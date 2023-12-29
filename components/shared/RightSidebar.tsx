import React from "react";
import Link from "next/link";
import Image from "next/image";
import RenderTag from "./RenderTag";

const RightSidebar = () => {
  const questions = [
    { _id: 1, title: "question" },
    { _id: 2, title: "question" },
    { _id: 3, title: "question" },
    { _id: 4, title: "question" },
    { _id: 5, title: "question" },
  ];
  const tags = [
    { _id: 1, name: "javascript", questions: 15 },
    { _id: 2, name: "react", questions: 12 },
    { _id: 3, name: "nextjs", questions: 10 },
    { _id: 4, name: "typescript", questions: 4 },
    { _id: 5, name: "nodejs", questions: 1 },
  ];
  return (
    <section className="background-light900_dark300 light-border sticky right-0 top-0 flex h-screen flex-col overflow-y-auto border-l p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden lg:w-[266px] w-[350px]">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {questions.map((question) => (
            <Link
              href={`questions/${question._id}`}
              key={question._id}
              className="flex cursor-pointer items-center justify-between gap-7"
            >
              <p className="body-medium text-dark500_light700">
                {question.title}
              </p>
              <Image
                src="/assets/icons/chevron-right.svg"
                alt="chevron-right"
                width={20}
                height={20}
                className="invert-colors"
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {tags.map((tag) => (
            <RenderTag
              key={tag._id}
              _id={tag._id}
              name={tag.name}
              questions={tag.questions}
              showCount
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
