import { getQuestionById } from "@/lib/actions/question.action";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Metric from "@/components/shared/Metric";
import { getTimestamp } from "@/lib/utils";
import ParseHTML from "@/components/shared/ParseHTML";
import RenderTag from "@/components/shared/RenderTag";
import Answer from "@/components/forms/Answer";
import AllAnswers from "@/components/shared/AllAnswers";
import Votes from "@/components/shared/Votes";
import { SignedIn, auth } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions/user.action";
import { URLProps } from "@/types";

const Page = async ({ params, searchParams }: URLProps) => {
  const result = await getQuestionById({ questionId: params.id });
  const { userId } = auth();
  let mongoUser = { _id: "", savedQuestions: [] };
  if (userId) {
    mongoUser = JSON.parse(await getUserByClerkId(userId));
  }
  if (!result) return <div>Not found</div>;
  return (
    <>
      <div className="flex-start w-full flex-col">
        <div
          className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row
          sm:items-center sm:gap-2"
        >
          <Link
            href={`/profile/${result.author.clerkId}`}
            className="flex items-center justify-start gap-1"
          >
            <Image
              src={result.author.picture}
              className="rounded-full"
              width={22}
              height={22}
              alt="profile picture"
            />
            <p className="paragraph-semibold text-dark300_light700">
              {result.author.name}
            </p>
          </Link>
          <div className="flex justify-end">
            <Votes
              type="question"
              itemId={JSON.stringify(result._id)}
              userId={JSON.stringify(mongoUser._id)}
              upvotes={result.upvotes.length}
              downvotes={result.downvotes.length}
              hasUpvoted={result.upvotes.includes(mongoUser._id)}
              hasDownvoted={result.downvotes.includes(mongoUser._id)}
              hasSaved={mongoUser.savedQuestions.includes(
                /* @ts-ignore */
                result._id.toString(),
              )}
            />
          </div>
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full text-left">
          {result.title}
        </h2>
      </div>
      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/assets/icons/clock.svg"
          alt="Clock icon"
          value={` asked ${getTimestamp(result.createdAt)}`}
          title=""
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/message.svg"
          alt="message"
          value={result.answers.length}
          title="Answers"
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/eye.svg"
          alt="eye"
          value={result.views}
          title="Views"
          textStyles="small-medium text-dark400_light800"
        />
      </div>

      <ParseHTML data={result.description} />

      <div className="mt-8 flex flex-wrap gap-2">
        {result.tags.map((tag: any) => (
          <RenderTag
            key={tag._id}
            _id={tag._id}
            name={tag.name}
            showCount={false}
          />
        ))}
      </div>

      <SignedIn>
        <Answer questionId={JSON.stringify(result._id)} />
      </SignedIn>

      <AllAnswers
        answers={result.answers.length}
        userId={userId}
        questionId={JSON.stringify(result._id)}
        filter={searchParams.filter || ""}
        page={parseInt(searchParams.page || "1")}
      />
    </>
  );
};

export default Page;
