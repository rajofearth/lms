"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { enrollInCourse } from "../actions";

interface EnrollmentFormProps {
  courseId: string;
  courseName: string;
}

const EnrollmentForm: React.FC<EnrollmentFormProps> = ({
  courseId,
  courseName,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    setIsLoading(true);
    toast.loading("Enrolling in course...", {
      id: "enrollment",
    });

    try {
      const result = await enrollInCourse(courseId);

      if (result.success) {
        toast.success("Successfully enrolled!", {
          id: "enrollment",
        });
        
        toast.loading("Redirecting to course...", {
          id: "redirect",
        });
        
        router.push(`/course/${courseId}`);
        
        toast.success("Welcome to the course!", {
          id: "redirect",
        });
      } else {
        toast.error(result.error || "Failed to enroll", {
          id: "enrollment",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.", {
        id: "enrollment",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="md:w-1/2 p-8 my-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
        Confirm Enrollment
      </h2>
      
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You&apos;re about to enroll in <span className="font-semibold text-gray-800 dark:text-gray-200">{courseName}</span>
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Once enrolled, you&apos;ll have full access to all course content, including videos, materials, and certificates upon completion.
        </p>
      </div>

      <Button
        onClick={handleEnroll}
        disabled={isLoading}
        className="w-full py-3 text-lg bg-indigo-600 hover:bg-indigo-700"
      >
        {isLoading ? "Enrolling..." : "Confirm Enrollment"}
      </Button>

      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
          What you&apos;ll get:
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-center">
            <span className="mr-2">✓</span>
            Lifetime access to course content
          </li>
          <li className="flex items-center">
            <span className="mr-2">✓</span>
            Certificate upon completion
          </li>
          <li className="flex items-center">
            <span className="mr-2">✓</span>
            Track your progress
          </li>
          <li className="flex items-center">
            <span className="mr-2">✓</span>
            Access to all course materials
          </li>
        </ul>
      </div>

      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        Payments with DodoPayments are coming soon. For now, enrollment does not require payment.
        <br />
        <a href="/checkout/start" className="underline">Learn more</a>
      </div>
    </div>
  );
};

export default EnrollmentForm;
