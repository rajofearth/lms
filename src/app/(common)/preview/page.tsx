import { prisma } from "@/lib/db";
import React from "react";
import CoursePreviewPage from "./_components/CoursePreviewPage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ courseId: string }>;
}) => {
  const resolvedSearchParams = await searchParams;
  const courseId = resolvedSearchParams.courseId;
  if (!courseId) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <p className="text-2xl font-bold">Course not found</p>
      </div>
    );
  }

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      _count: {
        select: {
          accesses: {
            where: { courseId },
          },
        },
      },
      category: true,
      user: true,
      chapters: {
        select: {
          title: true,
          id: true,
        },
      },
    },
  });

  if (!course) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <p className="text-2xl font-bold">Course not found</p>
      </div>
    );
  }

  let isEnrolled = false;
  let visitedUser = true;
  let isAuthor = false;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user) {
      const access = await prisma.access.findFirst({
        where: {
          userId: user.id,
          courseId,
        },
      });

      isEnrolled = !!access;
    }
    visitedUser = false;
    isAuthor = course.userId === userId;
  }

  return (
    <div className="overflow-y-auto w-full mx-auto">
      <CoursePreviewPage
        course={course}
        isEnrolled={isEnrolled}
        visitedUser={visitedUser}
        isAuthor={isAuthor}
      />
    </div>
  );
};

export default Page;
