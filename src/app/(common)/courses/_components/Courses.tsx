"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, memo } from "react";
import { ModifiedCourseType, getCourses } from "../actions";
import CourseCard from "./CourseCard";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CoursesProps {
  initialCourses: ModifiedCourseType[];
  search: string;
}

const Courses = memo(({ initialCourses, search }: CoursesProps) => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<ModifiedCourseType[]>(initialCourses);
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  const fetchCourses = useCallback(async (searchTerm: string) => {
    setLoading(true);
    try {
      const results = await getCourses(searchTerm);
      setCourses(results);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if search term has changed
    if (currentSearch !== search) {
      const timer = setTimeout(() => fetchCourses(currentSearch), 300);
      return () => clearTimeout(timer);
    }
  }, [currentSearch, search, fetchCourses]);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (courses.length === 0) {
    return (
      <div className="h-[calc(100vh-300px)] w-full flex justify-center items-center">
        <p className="text-lg font-semibold">No courses found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          chapterId={course.chapterId}
        />
      ))}
    </div>
  );
});

const SkeletonLoader = memo(() => {
  const skeletons = Array(10).fill(null);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {skeletons.map((_, index) => (
        <div
          key={index}
          className="shadow-md rounded-md border gap-3 cursor-pointer h-[280px]"
        >
          <Skeleton className="h-[60%] w-full rounded-md" />
          <div className="p-2 h-full w-full space-y-4 mt-5">
            <Skeleton className="h-[10%] w-3/4 rounded-md" />
            <Skeleton className="h-[10%] w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
});

SkeletonLoader.displayName = "SkeletonLoader";
Courses.displayName = "Courses";

export default Courses;
