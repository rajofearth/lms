import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import OnboardingForm from "./_components/OnboardingForm";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const OnboardingPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user) redirect("/auth/sign-in");

  const data = await prisma.user.findUnique({
    where: { id: user.id },
  });
  if (data) {
    if (data.onBoarded) {
      redirect("/dashboard");
    }
  } else {
    // User record is managed by Better Auth via Prisma adapter.
    // Ensure minimal profile fields exist.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name || user.email.split("@")[0],
        image: user.image || undefined,
      },
    }).catch(() => {});
  }

  const categories: string[] = [
    "Web Development",
    "Mobile App Development",
    "Data Science",
    "Machine Learning",
    "Artificial Intelligence",
    "Cloud Computing",
    "Cybersecurity",
    "DevOps",
    "Blockchain",
    "Digital Marketing",
    "Graphic Design",
    "UX/UI Design",
    "Business Analytics",
    "Project Management",
    "Photography",
    "Music Production",
    "Language Learning",
    "Personal Development",
    "Fitness and Health",
    "Cooking and Nutrition",
  ];

  const learningGoals: string[] = [
    "Career Advancement",
    "Personal Interest",
    "Academic Requirements",
    "Skill Development",
    "Certification",
    "Starting a Business",
  ];
  const roles: string[] = ["Student", "Teacher"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className=" rounded-lg shadow-xl p-8 max-w-3xl w-full">
        <h1 className="text-4xl font-bold mb-6 text-center ">
          Welcome to YourLMS, {user?.name?.split(" ")[0] || user?.email}!
        </h1>
        <p className="text-lg mb-8 text-center text-gray-600">
          Let&apos;s personalize your learning journey. Tell us a bit about
          yourself and your goals.
        </p>

        <OnboardingForm
          categories={categories}
          learningGoals={learningGoals}
          roles={roles}
          id={user.id}
        />
      </div>
    </div>
  );
};

export default OnboardingPage;
