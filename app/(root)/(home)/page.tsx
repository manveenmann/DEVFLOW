import QuestionCard from "@/components/cards/QuestionCard";
import HomeFilters from "@/components/home/HomeFilters";
import Filter from "@/components/shared/Filter";
import NoResult from "@/components/shared/NoResult";
import Pagination from "@/components/shared/Pagination";
import LocalSearch from "@/components/shared/search/LocalSearch";
import { Button } from "@/components/ui/button";
import { HomePageFilters } from "@/constants/filters";
import { getQuestions } from "@/lib/actions/question.action";
import { SearchParamsProps } from "@/types";
import Link from "next/link";

export default async function Home({ searchParams }: SearchParamsProps) {
  const results = await getQuestions({
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
  });
  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Link href="/ask-question" className="flex justify-end max-sm:w-full">
          <Button className="primary-gradient min-h px-3 py-3 !text-light-900">
            Ask a Question
          </Button>
        </Link>
      </div>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />
        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="max-md:flex hidden"
        />
      </div>

      <HomeFilters />

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
            title="There's no questions to show"
            description="
        Be the first to break the silence! 🚀 Ask a question and kickstart the
        discussion, our query could be the next big thing others learn from. Get
        Involved! 💡
              "
            link="/ask-question"
            linkText="Ask a Question"
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
}
