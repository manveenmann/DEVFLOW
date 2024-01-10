import React from "react";
import Link from "next/link";
import Image from "next/image";
import ParseHTML from "../shared/ParseHTML";
import Votes from "../shared/Votes";
import { getTimestamp } from "@/lib/utils";

interface Props {
  _id: string;
  authorId: string;
  imgUrl: string;
  createdAt: Date;
  userId: string;
  upvotes: number;
  downvotes: number;
  upvoted: boolean;
  downvoted: boolean;
  authorName: string;
  content: string;
  saved: boolean;
  voting?: boolean;
}

const AnswerCard = ({
  _id,
  authorId,
  imgUrl,
  createdAt,
  userId,
  upvotes,
  downvotes,
  upvoted,
  downvoted,
  authorName,
  content,
  saved,
  voting = true,
}: Props) => {
  return (
    <article key={_id} className="light-border border-b py-10">
      <div className="flex items-center justify-between">
        <div className="mb-8 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
          <Link
            href={`/profile/${authorId}`}
            className="flex flex-1 items-start gap-1 sm:items-center"
          >
            <Image
              src={imgUrl}
              width={22}
              height={22}
              alt="profile picture"
              className="rounded-full object-cover max-sm:mt-0.5"
            />
            <div className="flex flex-col sm:flex-row sm:items-center">
              <p className="body-semibold text-dark300_light700">
                {authorName}{" "}
              </p>
              <p className="small-regular text-light400_light500 mt-0.5 line-clamp-1 ml-1">
                answered {getTimestamp(createdAt)}
              </p>
            </div>
          </Link>
          <div className="flex justify-end">
            {voting && (
              <Votes
                type="answer"
                itemId={JSON.stringify(_id)}
                userId={JSON.stringify(userId)}
                upvotes={upvotes}
                downvotes={downvotes}
                hasUpvoted={upvoted}
                hasDownvoted={downvoted}
                hasSaved={saved}
              />
            )}
          </div>
        </div>
      </div>
      <ParseHTML data={content} />
    </article>
  );
};

export default AnswerCard;
