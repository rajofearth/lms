import { prisma } from "@/lib/db";
import Categories from "./_components/Categories";
import Courses from "./_components/Courses";
import SearchInput from "./_components/SearchInput";
import { getCourses } from "./actions";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) => {
  const params = await searchParams;
  const search = params?.search ?? "";
  
  // Fetch data in parallel for better performance
  const [cats, courses] = await Promise.all([
    prisma.category.findMany(),
    getCourses(search, 1, 20), // Get first page of courses
  ]);

  return (
    <div className="p-4  min-h-[calc(100vh-100px)] overflow-y-auto">
      <div className="w-full flex flex-col lg:flex-row justify-between lg:items-center ">
        <div>
          <h1 className="text-2xl font-semibold ">Courses</h1>
          <p className="mb-4 text-sm text-gray-600">
            (Choose your course and dive into career)
          </p>
        </div>
        <div>
          <SearchInput />
        </div>
      </div>
      <div className="w-full mb-4">
        <Categories categories={cats} search={search} />
      </div>
      <Courses initialCourses={courses} search={search} />
    </div>
  );
};

export default page;
