import { getUserAnswers, getUserById } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types";
import React from "react";
import AnswerCard from "../cards/AnswerCard";
import Link from "next/link";
import Pagination from "./Pagination";
import { useSearchParams } from "next/navigation";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}

const AnswersTab = async ({ userId, clerkId, searchParams }: Props) => {
  const results = await getUserAnswers({
    userId,
    page: searchParams.page ? +searchParams.page : 1,
  });
  const mongoUser = JSON.parse(await getUserById(userId));
  return (
    <div className="flex flex-col gap-5 w-full">
      {results.answers.map((answer) => (
        <div
          key={answer._id}
          className="background-light900_dark200 p-4 rounded-md shadow-light-800"
        >
          <Link href={`/question/${answer.question._id}`}>
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1">
              {answer.question.title}
            </h3>
          </Link>
          <AnswerCard
            _id={answer._id}
            content={answer.content}
            upvotes={answer.upvotes.length}
            clerkId={clerkId || ""}
            downvotes={answer.downvotes.length}
            authorClerkId={answer.author.clerkId}
            upvoted={answer.upvotes.includes(mongoUser._id)}
            downvoted={answer.downvotes.includes(mongoUser._id)}
            authorId={answer.author._id}
            authorName={answer.author.name}
            imgUrl={answer.author.picture}
            createdAt={answer.createdAt}
            userId={mongoUser._id}
            showActions
            saved={mongoUser.savedQuestions.includes(
              /* @ts-ignore */
              answer._id.toString(),
            )}
          />
        </div>
      ))}
      <div className="mt-10">
        <Pagination
          page={searchParams?.page ? +searchParams.page : 1}
          isNext={results.isNext || false}
        />
      </div>
    </div>
  );
};

export default AnswersTab;
