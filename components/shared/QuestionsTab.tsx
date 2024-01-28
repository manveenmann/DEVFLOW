import { getUserQuestions } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types";
import React from "react";
import QuestionCard from "../cards/QuestionCard";
import Pagination from "./Pagination";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}

const QuestionsTab = async ({ searchParams, userId, clerkId }: Props) => {
  const results = await getUserQuestions({
    userId,
    page: searchParams.page ? +searchParams.page : 1,
  });
  return (
    <div className="flex w-full gap-5 flex-col">
      {results.questions.map((ques) => (
        <QuestionCard
          key={ques._id}
          _id={ques._id}
          clerkId={clerkId?.toString()}
          title={ques.title}
          tags={ques.tags}
          author={ques.author}
          upvotes={ques.upvotes}
          views={ques.views}
          answers={ques.answers}
          createdAt={ques.createdAt}
          showActions
        />
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

export default QuestionsTab;
