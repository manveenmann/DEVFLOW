"use server";

import Answer from "@/database/answer.model";
import { connectToDatabase } from "../mongoose";
import {
  AnswerVoteParams,
  CreateAnswerParams,
  GetAnswersParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";

export async function createAnswer(params: CreateAnswerParams) {
  try {
    await connectToDatabase();

    const { content, author, question, path } = params;

    const newAnswer = await Answer.create({ content, author, question });

    await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });

    revalidatePath(path);
  } catch (e: any) {
    console.error(`Error creating answer: ${e.message}`);
    throw e;
  }
}

export async function getAllAnswers(params: GetAnswersParams) {
  try {
    await connectToDatabase();
    const answers = await Answer.find({ question: params.questionId })
      .populate("author", "_id clerkId name picture")
      .sort({ createdAt: -1 });
    return answers;
  } catch (e: any) {
    console.error(`Error getting all answers: ${e.message}`);
    throw e;
  }
}

export async function upvoteAnswer({
  userId,
  answerId,
  hasupVoted,
  hasdownVoted,
  path,
}: AnswerVoteParams) {
  try {
    await connectToDatabase();

    let updateQuery = {};
    if (hasupVoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = { $push: { upvotes: userId } };
    }

    const question = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error("Answer not found");
    }

    revalidatePath(path);
  } catch (err: any) {
    console.error(`Error upvoting question: ${err.message}`);
    throw new Error("Error upvoting question");
  }
}

export async function downvoteAnswer({
  answerId,
  userId,
  hasupVoted,
  hasdownVoted,
  path,
}: AnswerVoteParams) {
  try {
    await connectToDatabase();

    let updateQuery = {};
    if (hasdownVoted) {
      updateQuery = { $pull: { downvotes: userId } };
    } else if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = { $push: { downvotes: userId } };
    }

    const question = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error("Answer not found");
    }

    revalidatePath(path);
  } catch (err: any) {
    console.error(`Error downvoting question: ${err.message}`);
    throw new Error("Error downvoting question");
  }
}
