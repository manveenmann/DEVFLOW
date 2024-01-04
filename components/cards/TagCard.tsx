import Link from "next/link";
import React from "react";

interface TagCardProps {
  _id: string;
  name: string;
  questions: number;
}

const TagCard = (props: TagCardProps) => {
  return (
    <Link href={`/tags/${props._id}`} className="shadow-light100_darknone">
      <article className="background-light900_dark200 light-border flex w-full flex-col items-center justify-center rounded-2xl border px-8 py-10 sm:w-[260px]">
        <div className="background-light800_dark400 w-fit rounded-sm px-5 py-1.5">
          <p className="paragraph-semibold text-dark300_light900">
            {props.name}
          </p>
        </div>

        <p className="small-medium text-dark400_light500 mt-3.5">
          <span className="body-semibold primary-text-gradient mr-2.5">
            {props.questions}+
          </span>
          Questions
        </p>
      </article>
    </Link>
  );
};

export default TagCard;
