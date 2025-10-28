import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { courseId, chapterId } = await params;
    if (!courseId || !chapterId) {
      return NextResponse.json(
        { message: "CourseId and ChapterId are required" },
        { status: 400 }
      );
    }

    const value = await req.json();
    if (!value) {
      return NextResponse.json(
        { message: "field is required to update" },
        { status: 400 }
      );
    }
    const res = await prisma.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      data: {
        ...value,
      },
    });

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        _count: {
          select: {
            chapters: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
    });

    if (course!._count.chapters === 0) {
      await prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return NextResponse.json(
      { message: "chapter updated...", ...res },
      { status: 201 }
    );
  } catch (error) {
    console.error("General error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { courseId, chapterId } = await params;
    if (!courseId || !chapterId) {
      return NextResponse.json(
        { message: "CourseId and ChapterId are required" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await prisma.chapter.delete({
      where: {
        id: chapterId,
        courseId: courseId,
      },
    });

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        _count: {
          select: {
            chapters: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
    });

    if (course!._count.chapters === 0) {
      await prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return NextResponse.json(
      { message: "Chapter deleted", ...res },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
