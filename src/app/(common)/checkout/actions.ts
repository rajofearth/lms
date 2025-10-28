"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { render } from "@react-email/render";
import { redirect } from "next/navigation";
import nodemailer from "nodemailer";
import CourseEnrollmentEmail from "../../../../emails/CourseEnrollmentEmail";

export const enrollInCourse = async (courseId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        chapters: true,
        user: true,
      },
    });

    if (!course) {
      return { success: false, error: "Course not found" };
    }

    // Check if user is the author
    if (course.userId === user.id) {
      return { success: false, error: "You cannot enroll in your own course" };
    }

    // Check if already enrolled
    const existingAccess = await prisma.access.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
      },
    });

    if (existingAccess) {
      return { success: false, error: "You are already enrolled in this course" };
    }

    // Create enrollment record
    await prisma.purchases.create({
      data: {
        courseId: courseId,
        userId: user.id,
        status: "COMPLETED",
      },
    });

    // Grant access
    await prisma.access.create({
      data: {
        userId: user.id,
        courseId: course.id,
      },
    });

    // Send enrollment email
    try {
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

      const emailDetails = {
        authorName: course.user.name || course.user.email.split("@")[0],
        chapterCount: course.chapters.length,
        courseName: course.title,
        courseUrl: `course/${course.id}?chapter=${course.chapters[0]?.id || ""}`,
        name: user?.name || user.email.split("@")[0],
      };

      const htmlContent = await render(CourseEnrollmentEmail({ ...emailDetails }));
      
      const mailOptions = {
        from: process.env.MAIL_USER,
        to: user.email,
        subject: "Course Enrollment in YourLMS",
        html: htmlContent,
      };

      transport.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        }
      });
    } catch (emailError) {
      console.error("Failed to send enrollment email:", emailError);
      // Don't fail the enrollment if email fails
    }

    return { success: true };
  } catch (error) {
    console.error("Enrollment error:", error);
    return { success: false, error: "Failed to enroll in course" };
  }
};
