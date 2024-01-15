import QuestionCard from "@/components/cards/QuestionCard";
import Filter from "@/components/shared/Filter";
import NoResult from "@/components/shared/NoResult";
import LocalSearch from "@/components/shared/search/LocalSearch";
import { QuestionFilters } from "@/constants/filters";
import { getSavedQuestions } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function Collections({ searchParams }: SearchParamsProps) {
  const { userId } = auth();
  if (!userId) {
    redirect("/login");
  }
  const results = await getSavedQuestions({
    clerkId: userId,
    searchQuery: searchParams.q,
  });
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route="/collection"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />
        <Filter
          filters={QuestionFilters}
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
            title="You haven't saved any questions yet!"
            description="
              You can click the star icon on any question to save it here.
              "
            link="/"
            linkText="Browse Questions"
          />
        )}
      </div>
    </>
  );
}
