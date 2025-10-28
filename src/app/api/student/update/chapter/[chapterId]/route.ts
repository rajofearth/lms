import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { chapterId } = await params;
    if (!chapterId) {
      return NextResponse.json(
        { message: "chapterID is required" },
        { status: 400 }
      );
    }
    const value = await req.json();

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const chapter = await prisma.progress.upsert({
      where: {
        userId_chapterId: {
          chapterId: chapterId,
          userId: user.id,
        },
      },
      update: {
        status: value.completed ? "COMPLETED" : "IN_PROGRESS",
      },
      create: {
        chapterId: chapterId,
        userId: user.id,
        status: value.completed ? "COMPLETED" : "IN_PROGRESS",
      },
    });

    return NextResponse.json({ message: "progress updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
