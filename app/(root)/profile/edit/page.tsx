import React from "react";
import Profile from "@/components/forms/Profile";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/lib/actions/user.action";
import { getQuestionById } from "@/lib/actions/question.action";
import { ParamsProps } from "@/types";

const page = async ({ params }: ParamsProps) => {
  const { userId } = auth();

  if (!userId) {
    redirect("sign-in");
  }

  const mongoUser = JSON.parse(await getUserByClerkId(userId));

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>

      <div className="mt-9">
        <Profile clerkId={userId} user={JSON.stringify(mongoUser)} />
      </div>
    </>
  );
};

export default page;
