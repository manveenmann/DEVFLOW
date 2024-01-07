"use client";

import React from "react";
import Image from "next/image";
import { getCount } from "@/lib/utils";
import {
  downvoteQuestion,
  upvoteQuestion,
} from "@/lib/actions/question.action";
import { redirect, usePathname, useRouter } from "next/navigation";
import { downvoteAnswer, upvoteAnswer } from "@/lib/actions/answer.action";
import { saveQuestion } from "@/lib/actions/user.action";
import { viewQuestion } from "@/lib/actions/interaction.action";

interface Props {
  type: "answer" | "question";
  itemId: string;
  userId: string;
  upvotes: number;
  downvotes: number;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  hasSaved: boolean;
}

const Votes = (params: Props) => {
  const router = useRouter();
  const path = usePathname();
  const handleVote = async (voteType: "upvote" | "downvote") => {
    const userId = JSON.parse(params.userId);
    if (!userId || userId === "") {
      router.push("/sign-in");
      return;
    }

    if (voteType === "upvote") {
      if (params.type === "question") {
        await upvoteQuestion({
          questionId: JSON.parse(params.itemId),
          userId: userId,
          hasupVoted: params.hasUpvoted,
          hasdownVoted: params.hasDownvoted,
          path: path,
        });
      } else {
        await upvoteAnswer({
          answerId: JSON.parse(params.itemId),
          userId: userId,
          hasupVoted: params.hasUpvoted,
          hasdownVoted: params.hasDownvoted,
          path: path,
        });
      }
    } else {
      if (params.type === "question") {
        await downvoteQuestion({
          questionId: JSON.parse(params.itemId),
          userId: userId,
          hasupVoted: params.hasUpvoted,
          hasdownVoted: params.hasDownvoted,
          path: path,
        });
      } else {
        await downvoteAnswer({
          answerId: JSON.parse(params.itemId),
          userId: userId,
          hasupVoted: params.hasUpvoted,
          hasdownVoted: params.hasDownvoted,
          path: path,
        });
      }
    }
  };

  const handleSave = async () => {
    await saveQuestion({
      path,
      userId: JSON.parse(params.userId),
      questionId: JSON.parse(params.itemId),
    });
  };

  React.useEffect(() => {
    viewQuestion({
      userId: JSON.parse(params.userId),
      questionId: JSON.parse(params.itemId),
    });
  }, [params.itemId, params.userId, path, router]);

  return (
    <div className="flex gap-5">
      <div className="flex-center gap-2.5">
        <div className="flex-center">
          <Image
            src={
              params.hasUpvoted
                ? "/assets/icons/upvoted.svg"
                : "/assets/icons/upvote.svg"
            }
            width={18}
            height={18}
            alt="upvote"
            className="cursor-pointer"
            onClick={() => handleVote("upvote")}
          />
          <div className="flex-center min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {getCount(params.upvotes)}
            </p>
          </div>
        </div>
        <div className="flex-center">
          <Image
            src={
              params.hasDownvoted
                ? "/assets/icons/downvoted.svg"
                : "/assets/icons/downvote.svg"
            }
            width={18}
            height={18}
            alt="downvote"
            className="cursor-pointer"
            onClick={() => handleVote("downvote")}
          />
          <div className="flex-center min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {getCount(params.downvotes)}
            </p>
          </div>
        </div>
      </div>
      {params.type === "question" && (
        <Image
          src={
            params.hasSaved
              ? "/assets/icons/star-filled.svg"
              : "/assets/icons/star-red.svg"
          }
          width={18}
          height={18}
          alt="star"
          className="cursor-pointer"
          onClick={handleSave}
        />
      )}
    </div>
  );
};

export default Votes;
