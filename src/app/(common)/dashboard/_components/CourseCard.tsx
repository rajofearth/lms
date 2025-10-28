"use client";
import { currencyFormater } from "@/lib/utils";
import { Course, User } from "@prisma/client";
import { BookOpenCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { memo } from "react";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      name: string | null;
      profilePic: string | null;
    };
    chapters: number;
    progress: number;
    isAuthor: boolean;
    isAccessible: boolean;
  };
  chapters: number;
  isAccessible?: boolean;
  progress?: number;
  isAuthor?: boolean;
}

const CourseCard = memo(({ 
  course, 
  chapters, 
  isAccessible = false, 
  progress = 0, 
  isAuthor = false 
}: CourseCardProps) => {

  return (
    <Link
      href={`/course/${course.id}`}
      className="shadow-md rounded-md border flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-200"
    >
      <Image
        src={course.thumbnail!}
        alt={course.title}
        width={600}
        height={400}
        className="rounded-t-md flex-1 max-h-[300px] object-cover"
        priority={false}
        loading="lazy"
      />
      <div className="p-4 pb-0 space-y-3">
        <h2 className="text-xl font-semibold line-clamp-2">{course.title}</h2>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <BookOpenCheck className="w-4 h-4" />
            <span className="text-sm text-gray-600">{chapters} chapters</span>
          </div>

          {!isAuthor &&
            (isAccessible ? (
              <GiReceiveMoney size={24} className="text-green-600" />
            ) : (
              <GiPayMoney size={24} className="text-red-600" />
            ))}
        </div>
        {isAccessible && <Progress value={progress} className="h-2" />}
        <Link href={`/profile/${course.user.id}`} className="w-full">
          <Button
            variant={"link"}
            className="w-full border-0 rounded-none font-bold hover:scale-110 transition-transform duration-200"
          >
            by {course.user.name}
          </Button>
        </Link>
      </div>
    </Link>
  );
});

CourseCard.displayName = "CourseCard";

export default CourseCard;
