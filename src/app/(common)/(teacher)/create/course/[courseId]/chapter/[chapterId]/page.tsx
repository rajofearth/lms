import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import TitleField from "./_components/TitleField";
import ContentField from "./_components/ContentField";
import VideoField from "./_components/VideoField";
import Banner from "@/components/Banner";
import PublishField from "./_components/PublishField";
import BackField from "./_components/BackField";
import AttachmentsField from "./_components/AttachmentsField";

const page = async ({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) => {
  const resolvedParams = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/");
  }

  const chapterDeatils = await prisma.chapter.findUnique({
    where: {
      id: resolvedParams.chapterId,
      courseId: resolvedParams.courseId,
    },
    include: {
      attachments: true,
    },
  });

  if (!chapterDeatils) {
    redirect("/");
  }

  const requiredFileds = [chapterDeatils.title, chapterDeatils.content];

  const totalFields = requiredFileds.length;
  const filledFields = requiredFileds.filter((field) => field).length;

  const isAllFieldsFilled = totalFields === filledFields;

  return (
    <div className="w-full h-full overflow-y-auto">
      {!chapterDeatils.isPublished && <Banner isCourse={false} />}
      <BackField courseId={resolvedParams.courseId} />
      <div className="p-3 w-full h-full space-y-4">
        <div className="mb-4 flex justify-between items-center">
          <div className="space-y-2 ">
            <h1 className="text-3xl font-bold">Chapter setup</h1>
            <p className="font-medium text-sm">
              complete all the fields ({`${filledFields}/${totalFields}`})
            </p>
          </div>
          <PublishField
            chapterDeatils={chapterDeatils}
            isCompleted={isAllFieldsFilled}
            courseId={resolvedParams.courseId}
            chapterId={resolvedParams.chapterId}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <TitleField
              title={chapterDeatils.title}
              courseId={resolvedParams.courseId}
              chapterId={resolvedParams.chapterId}
            />

            <VideoField
              chapterId={resolvedParams.chapterId}
              courseId={resolvedParams.courseId}
              videoUrl={chapterDeatils.videoUrl || ""}
              title={chapterDeatils.title}
            />
          </div>
          <div className="space-y-4 w-full">
            <AttachmentsField
              attachments={chapterDeatils.attachments || []}
              courseId={resolvedParams.courseId}
              chapterId={resolvedParams.chapterId}
            />
          </div>
        </div>
        <ContentField
          content={chapterDeatils.content || ""}
          courseId={resolvedParams.courseId}
          chapterId={resolvedParams.chapterId}
        />
      </div>
    </div>
  );
};

export default page;
