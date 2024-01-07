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
          <article key={answer._id} className="light-border border-b py-10">
            <div className="flex items-center justify-between">
              <div className="mb-8 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
                <Link
                  href={`/profile/${answer.author._id}`}
                  className="flex flex-1 items-start gap-1 sm:items-center"
                >
                  <Image
                    src={answer.author.picture}
                    width={22}
                    height={22}
                    alt="profile picture"
                    className="rounded-full object-cover max-sm:mt-0.5"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p className="body-semibold text-dark300_light700">
                      {answer.author.name}{" "}
                    </p>
                    <p className="small-regular text-light400_light500 mt-0.5 line-clamp-1 ml-1">
                      answered {getTimestamp(answer.createdAt)}
                    </p>
                  </div>
                </Link>
                <div className="flex justify-end">
                  <Votes
                    type="answer"
                    itemId={JSON.stringify(answer._id)}
                    userId={JSON.stringify(mongoUser._id)}
                    upvotes={answer.upvotes.length}
                    downvotes={answer.downvotes.length}
                    hasUpvoted={answer.upvotes.includes(mongoUser._id)}
                    hasDownvoted={answer.downvotes.includes(mongoUser._id)}
                    /* @ts-ignore */
                    hasSaved={mongoUser.savedQuestions.includes(answer._id)}
                  />
                </div>
              </div>
            </div>
            <ParseHTML data={answer.content} />
          </article>
        ))}
      </div>
    </div>
  );
};

export default AllAnswers;
