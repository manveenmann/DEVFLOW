"use server";

import Answer from "@/database/answer.model";
import { connectToDatabase } from "../mongoose";
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Interaction from "@/database/interaction.model";

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
    let sort = {};
    switch (params.sortBy) {
      case "highestUpvotes":
        sort = { upvotes: -1 };
        break;
      case "lowestUpvotes":
        sort = { upvotes: 1 };
        break;
      case "recent":
        console.log("recent");
        sort = { createdAt: -1 };
        break;
      case "old":
        sort = { createdAt: 1 };
    }
    const answers = await Answer.find({ question: params.questionId })
      .populate("author", "_id clerkId name picture")
      .sort(sort);
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

export async function deleteAnswer(params: DeleteAnswerParams) {
  try {
    await connectToDatabase();
    const { answerId, path } = params;
    const answer = await Answer.findById(answerId);

    if (!answer) {
      throw new Error("Answer not found");
    }

    await Answer.deleteOne({ _id: answerId });
    await Question.updateMany(
      { _id: answer.question },
      { $pull: { answers: answerId } },
    );
    await Interaction.deleteMany({ answer: answerId });

    revalidatePath(path);
  } catch (err: any) {
    console.error(`Error deleting answer: ${err.message}`);
    throw new Error("Error deleting answer");
  }
}
