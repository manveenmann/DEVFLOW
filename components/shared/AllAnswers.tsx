import { AnswerFilters } from "@/constants/filters";
import { getAllAnswers } from "@/lib/actions/answer.action";
import React from "react";
import Filter from "./Filter";
import { getUserByClerkId } from "@/lib/actions/user.action";
import AnswerCard from "../cards/AnswerCard";
import Pagination from "./Pagination";

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
    sortBy: params.filter || "",
    page: params.page ? +params.page : 1,
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
        {results.answers.map((answer) => (
          <AnswerCard
            key={answer._id}
            _id={answer._id}
            clerkId={params.userId}
            content={answer.content}
            upvotes={answer.upvotes.length}
            downvotes={answer.downvotes.length}
            upvoted={answer.upvotes.includes(mongoUser._id)}
            downvoted={answer.downvotes.includes(mongoUser._id)}
            authorId={answer.author._id}
            authorClerkId={answer.author.clerkId}
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
      <div className="mt-10">
        <Pagination
          page={params.page ? +params.page : 1}
          isNext={results.isNext || false}
        />
      </div>
    </div>
  );
};

export default AllAnswers;
