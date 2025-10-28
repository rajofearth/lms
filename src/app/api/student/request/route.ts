import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  const data: {
    email: string;
    request: string;
    phone: string;
  } = await req.json();

  if (!data.email || !data.request || !data.phone) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await prisma.requests.create({
    data: {
      email: data.email,
      message: data.request,
      phone: data.phone,
      userId: user.id,
    },
  });

  return NextResponse.json(user, { status: 200 });
}
