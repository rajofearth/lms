import { BookOpenCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { memo } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ModifiedCourseType } from "../actions";

interface CourseCardProps {
  course: ModifiedCourseType;
  chapterId?: string;
}

const CourseCard = memo(({ course, chapterId }: CourseCardProps) => {

  return (
    <Link
      href={`/preview?courseId=${course.id}`}
      className="shadow-md rounded-md border flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-200"
    >
      <Image
        src={course.thumbnail!}
        alt={course.title}
        width={500}
        height={300}
        className="rounded-t-md flex-1 object-cover max-h-[300px]"
        priority={false}
        loading="lazy"
      />
      <div className="p-4 pb-0 space-y-3">
        <h2 className="text-xl font-semibold line-clamp-2">{course.title}</h2>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <BookOpenCheck className="w-4 h-4" />
            <span className="text-sm text-gray-600">{course.chapters} chapters</span>
          </div>
        </div>
        <Link href={`/profile/${course.user.id}`} className="w-full mt-3">
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
