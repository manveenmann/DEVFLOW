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
        <Link key={answer._id} href={`/question/${answer.question._id}`}>
          <AnswerCard
            _id={answer._id}
            content={answer.content}
            upvotes={answer.upvotes.length}
            downvotes={answer.downvotes.length}
            upvoted={answer.upvotes.includes(mongoUser._id)}
            downvoted={answer.downvotes.includes(mongoUser._id)}
            authorId={answer.author._id}
            authorName={answer.author.name}
            imgUrl={answer.author.picture}
            createdAt={answer.createdAt}
            userId={mongoUser._id}
            voting={false}
            saved={mongoUser.savedQuestions.includes(
              /* @ts-ignore */
              answer._id.toString(),
            )}
          />
        </Link>
      ))}
    </>
  );
};

export default AnswersTab;
