import QuestionCard from "@/components/cards/QuestionCard";
import Filter from "@/components/shared/Filter";
import NoResult from "@/components/shared/NoResult";
import Pagination from "@/components/shared/Pagination";
import LocalSearch from "@/components/shared/search/LocalSearch";
import { TagFilters } from "@/constants/filters";
import { getQuestionsByTagId } from "@/lib/actions/tag.actions";
import { URLProps } from "@/types";
import React from "react";

const page = async ({ params, searchParams }: URLProps) => {
  const results = await getQuestionsByTagId({
    tagId: params.id,
    searchQuery: searchParams.q,
    page: searchParams.page ? +searchParams.page : 1,
  });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">{results.tag}</h1>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />
        <Filter
          filters={TagFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="max-md:flex hidden"
        />
      </div>

      <div className="mt-10 flex w-full flex-col gap-6">
        {results.questions.length > 0 ? (
          results.questions.map((ques: any) => (
            <QuestionCard
              key={ques._id}
              _id={ques._id}
              title={ques.title}
              tags={ques.tags}
              author={ques.author}
              upvotes={ques.upvotes}
              views={ques.views}
              answers={ques.answers}
              createdAt={ques.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="No Questions for this tag"
            description=""
            link="/ask-question"
            linkText="Ask Question"
          />
        )}
      </div>
      <div className="mt-10">
        <Pagination
          page={searchParams?.page ? +searchParams.page : 1}
          isNext={results.isNext || false}
        />
      </div>
    </>
  );
};

export default page;
