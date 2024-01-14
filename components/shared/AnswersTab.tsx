import { getUserAnswers, getUserById } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types";
import React from "react";
import AnswerCard from "../cards/AnswerCard";
import Link from "next/link";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}

const AnswersTab = async ({ userId, clerkId }: Props) => {
  const results = await getUserAnswers({ userId });
  const mongoUser = JSON.parse(await getUserById(userId));
  return (
    <>
      {results.answers.map((answer) => (
        <>
          <Link key={answer._id} href={`/question/${answer.question._id}`}>
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1">
              {answer.question.title}
            </h3>
          </Link>
          <AnswerCard
            key={answer._id}
            _id={answer._id}
            content={answer.content}
            upvotes={answer.upvotes.length}
            clerkId={clerkId}
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
        </>
      ))}
    </>
  );
};

export default AnswersTab;
