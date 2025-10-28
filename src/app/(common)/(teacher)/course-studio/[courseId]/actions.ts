"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const getStudentsForCourse = async (courseId: string) => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/");
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    redirect("/");
  }

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      userId: user.id,
    },
    include: {
      _count: {
        select: {
          chapters: true,
        },
      },
    },
  });

  if (!course) {
    redirect("/");
  }

  const data = await prisma.access.findMany({
    where: {
      courseId: courseId,
    },
    include: {
      user: {
        select: {
          name: true,
          _count: {
            select: {
              progress: {
                where: {
                  status: "COMPLETED",
                },
              },
            },
          },
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const filteredData = data.map((access) => {
    return {
      name: access.user.name || "No Name",
      email: access.user.email,
      chapters: course._count.chapters,
      progress: access.user._count.progress,
      accessDate: access.createdAt,
      courseId: courseId,
      userId: access.userId,
    };
  });

  return filteredData;
};

export type StudentsForCourseType = Awaited<
  ReturnType<typeof getStudentsForCourse>
>[0];
