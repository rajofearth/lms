"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import CourseCompletionEmail from "../../../../emails/CourseCompletionEmail";
import { cache, CACHE_KEYS } from "@/lib/cache";

export const courseAccess = async (courseId: string) => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const userId = session?.user?.id;
  let visitedUser = false;
  if (!userId) visitedUser = true;
  let isCourseAccessableByTheUser = false;
  let isauther = false;
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      user: true,
    },
  });

  if (!course) {
    return { visitedUser, isCourseAccessableByTheUser, isauther };
  }

  if (course.user.id === userId) {
    isauther = true;
    visitedUser = false;
    return { visitedUser, isCourseAccessableByTheUser, isauther };
  }
  if (userId) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (user) {
      const courseAccess = await prisma.access.findUnique({
        where: {
          courseId_userId: {
            courseId: courseId,
            userId: user.id,
          },
        },
      });
      if (courseAccess) isCourseAccessableByTheUser = true;
    }
  }

  return { visitedUser, isCourseAccessableByTheUser, isauther };
};

export const getCourses = async (word: string, page = 1, pageSize = 20) => {
  const cacheKey = `courses_${word}_${page}_${pageSize}`;
  
  return cache.getOrSet(cacheKey, async () => {
    const skip = (page - 1) * pageSize;
    
    // Optimized query with better indexing and reduced data fetching
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: word, mode: 'insensitive' } },
          { description: { contains: word, mode: 'insensitive' } },
          { category: { title: { contains: word, mode: 'insensitive' } } },
          { user: { name: { contains: word, mode: 'insensitive' } } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        duration: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            profilePic: true,
          },
        },
        category: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            chapters: { where: { isPublished: true } },
          },
        },
        chapters: {
          select: { id: true },
          where: { isPublished: true },
          orderBy: { order: "asc" },
          take: 1, // Only get the first chapter ID
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' }, // Add ordering for consistent results
    });

    const finalCourses = courses.map((course) => ({
      ...course,
      chapters: course._count.chapters,
      chapterId: course.chapters[0]?.id,
    }));

    return finalCourses;
  }, 2 * 60 * 1000); // Cache for 2 minutes
};

export const getTotalCourseProgress = async (courseId: string) => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const userId = session?.user?.id;
  if (!userId) {
    return 0;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return 0;
  }

  const chaptersCompleted = await prisma.course.findUnique({
    where: {
      id: courseId,
      isPublished: true,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        select: {
          id: true,
        },
      },
      user: true,
    },
  });

  if (!chaptersCompleted) {
    return 0;
  }

  const chapterIds =
    chaptersCompleted?.chapters.map((chapter) => chapter.id) || [];
  const chapterProgressIds = await prisma.progress.findMany({
    where: {
      status: "COMPLETED",
      userId: user.id,
      chapterId: {
        in: chapterIds,
      },
    },
  });

  //calculate the progress
  const totalChapters = chapterIds.length;
  const completedChapters = chapterProgressIds.length;
  const progress = (completedChapters / totalChapters) * 100;

  if (progress === 100) {
    const isAlreadyNotified = await prisma.certificate.findUnique({
      where: {
        courseId_userId: {
          courseId: courseId,
          userId: user.id,
        },
      },
    });

    if (isAlreadyNotified) {
      return progress;
    }

    const certificate = await prisma.certificate.create({
      data: {
        title: chaptersCompleted.title,
        userId: user.id,
        courseId: courseId,
      },
    });
    const transport = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const htmlContent = await render(
      CourseCompletionEmail({
        studentName: user?.name || user.email.split("@")[0],
        certificateUrl: `certificate/${certificate.id}`,
        courseName: chaptersCompleted.title,
        instructorName:
          chaptersCompleted.user.name ||
          chaptersCompleted.user.email.split("@")[0],
        instructorPic: chaptersCompleted.user.profilePic || "",
      })
    );

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "Course Completion Certificate",
      html: htmlContent,
    };

    transport.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        throw new Error("Error sending email");
      }
    });
  }

  return progress;
};

// Optimized function to get user courses with progress data in a single query
export const getUserCoursesWithProgress = async (userId: string) => {
  return cache.getOrSet(CACHE_KEYS.USER_COURSES(userId), async () => {
    const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      accesses: {
        select: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              thumbnail: true,
              duration: true,
              createdAt: true,
              updatedAt: true,
              userId: true,
              _count: {
                select: {
                  chapters: {
                    where: {
                      isPublished: true,
                    },
                  },
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  profilePic: true,
                },
              },
              // Get progress data for all chapters in one query
              chapters: {
                select: {
                  id: true,
                  progress: {
                    where: {
                      userId: userId,
                      status: "COMPLETED",
                    },
                    select: {
                      id: true,
                    },
                  },
                },
                where: {
                  isPublished: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  // Calculate progress for each course
  const coursesWithProgress = user.accesses.map((access) => {
    const course = access.course;
    const totalChapters = course._count.chapters;
    const completedChapters = course.chapters.reduce(
      (count, chapter) => count + (chapter.progress.length > 0 ? 1 : 0),
      0
    );
    const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
    const isAuthor = course.userId === userId;

    return {
      ...course,
      chapters: totalChapters,
      progress,
      isAuthor,
      isAccessible: true, // User has access to these courses
    };
  });

    return {
      ...user,
      accesses: coursesWithProgress,
    };
  }, 5 * 60 * 1000); // Cache for 5 minutes
};

export type ModifiedCourseType = Omit<
  Awaited<ReturnType<typeof getCourses>>[0],
  "_count"
>;
