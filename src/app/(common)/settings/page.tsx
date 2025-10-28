import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import SettingsField from "./_components/SettingsField";

const page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) return (
      <div className="h-[calc(100vh-100px)] w-full flex flex-col justify-center items-center gap-3">
        Sign in to view your settings
        <Button asChild>
          <a href="/auth/sign-in">Sign in</a>
        </Button>
      </div>
    );

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) redirect("/not-authorized");

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mb-4 text-sm text-gray-600">
            (Manage your account settings)
          </p>
        </div>
      </div>
      <SettingsField user={user} />
    </div>
  );
};

export default page;
