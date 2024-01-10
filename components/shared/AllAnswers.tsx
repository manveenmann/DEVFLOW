import { AnswerFilters } from "@/constants/filters";
import { getAllAnswers } from "@/lib/actions/answer.action";
import React from "react";
import Filter from "./Filter";
import Link from "next/link";
import Image from "next/image";
import { getTimestamp } from "@/lib/utils";
import ParseHTML from "./ParseHTML";
import Votes from "./Votes";
import { getUserByClerkId } from "@/lib/actions/user.action";
import AnswerCard from "../cards/AnswerCard";

interface AllAnswersProps {
  questionId: string;
  answers: number;
  page?: number;
  filter?: string;
  userId: string | null;
}

const AllAnswers = async (params: AllAnswersProps) => {
  const results = await getAllAnswers({
    questionId: JSON.parse(params.questionId),
  });
  let mongoUser = { _id: "", savedQuestions: [] };
  if (params.userId) {
    mongoUser = JSON.parse(await getUserByClerkId(params.userId));
  }
  return (
    <div className="mt-11 ">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">{params.answers} Answers</h3>
        <Filter filters={AnswerFilters} />
      </div>
      <div>
        {results.map((answer) => (
          <AnswerCard
            key={answer._id}
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
            saved={mongoUser.savedQuestions.includes(
              /* @ts-ignore */
              answer._id.toString(),
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default AllAnswers;
