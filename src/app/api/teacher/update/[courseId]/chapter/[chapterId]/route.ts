import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ClientUploadedFileData } from "uploadthing/types";

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

export async function PATCH(
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

export async function POST(
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

    const values = await req.json();

    if (!values) {
      return NextResponse.json(
        { message: "field is required to update" },
        { status: 400 }
      );
    }
    let index = 1;
    values.all.forEach(async (element: ClientUploadedFileData<null>) => {
      await prisma.attachment.create({
        data: {
          chapterId: chapterId,
          name: element.name || `Attachment-${index++}`,
          url: element.url,
          type: element.type || "file",
        },
      });
    });

    return NextResponse.json({ message: "Attachments added" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const values = await req.json();

    if (!values) {
      return NextResponse.json(
        { message: "field is required to update" },
        { status: 400 }
      );
    }

    await prisma.attachment.delete({
      where: {
        id: values.id,
        chapterId: chapterId,
      },
    });

    return NextResponse.json(
      { message: "Attachment Removed" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
