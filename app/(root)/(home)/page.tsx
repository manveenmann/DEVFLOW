import QuestionCard from "@/components/cards/QuestionCard";
import HomeFilters from "@/components/home/HomeFilters";
import Filter from "@/components/shared/Filter";
import NoResult from "@/components/shared/NoResult";
import LocalSearch from "@/components/shared/search/LocalSearch";
import { Button } from "@/components/ui/button";
import { HomePageFilters } from "@/constants/filters";
import Link from "next/link";

export default function Home() {
  const questions = [
    {
      _id: "1",
      title: "How to use TypeScript with React?",
      tags: [
        { _id: "101", name: "TypeScript" },
        { _id: "102", name: "React" },
      ],
      author: {
        _id: "201",
        name: "John Doe",
        picture: "/assets/icons/avatar.svg",
      },
      upvotes: 15,
      views: 120,
      answers: [
        {
          answerId: 301,
          text: "You can use the `tsx` extension for your React components.",
        },
        {
          answerId: 302,
          text: "Make sure to install the @types/react package.",
        },
      ],
      createdAt: new Date("2024-01-01T08:30:00Z"),
    },
    {
      _id: "2",
      title: "Best practices for responsive web design?",
      tags: [
        { _id: "103", name: "Web Design" },
        { _id: "104", name: "Responsive Design" },
      ],
      author: {
        _id: "202",
        name: "Jane Smith",
        picture: "/assets/icons/avatar.svg",
      },
      upvotes: 20,
      views: 150,
      answers: [
        {
          answerId: 303,
          text: "Use media queries to adjust styles based on screen size.",
        },
        {
          answerId: 304,
          text: "Consider using a responsive CSS framework like Bootstrap.",
        },
      ],
      createdAt: new Date("2023-06-20T12:45:00Z"),
    },
  ];

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
        {questions.length > 0 ? (
          questions.map((ques) => (
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
    </>
  );
}
