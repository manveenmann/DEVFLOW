"use server";
import Question, { IQuestion } from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";
import User from "@/database/user.model";
import {
  CreateQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";

export async function createQuestion(params: CreateQuestionParams) {
  try {
    connectToDatabase();

    const q = await Question.create({
      title: params.title,
      description: params.description,
      author: params.author,
    });

    // Find or Create tags
    const tagIds = [];
    for (const tag of params.tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $push: { questions: q._id } },
        { upsert: true, new: true },
      );
      tagIds.push(existingTag._id);
    }

    await Question.findByIdAndUpdate(q._id, {
      $push: { tags: { $each: tagIds } },
    });

    revalidatePath(params.path);
  } catch (err: any) {
    console.error(`Error creating question: ${err.message}`);
  }
}

export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();
    const questions = await Question.find({})
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .sort({ createdAt: -1 });
    return { questions };
  } catch (err: any) {
    console.error(`Error getting questions: ${err.message}`);
    return { questions: [] };
  }
}

export async function getQuestionById(
  params: GetQuestionByIdParams,
): Promise<any> {
  try {
    connectToDatabase();
    const question = await Question.findById(params.questionId)
      .populate({ path: "tags", model: Tag, select: "_id name" })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      });
    return question;
  } catch (err: any) {
    console.error(`Error getting question by id: ${err.message}`);
    throw new Error("Error getting question by id");
  }
}

export async function upvoteQuestion({
  userId,
  questionId,
  hasupVoted,
  hasdownVoted,
  path,
}: QuestionVoteParams) {
  try {
    connectToDatabase();

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

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error("Question not found");
    }

    revalidatePath(path);
  } catch (err: any) {
    console.error(`Error upvoting question: ${err.message}`);
    throw new Error("Error upvoting question");
  }
}

export async function downvoteQuestion({
  questionId,
  userId,
  hasupVoted,
  hasdownVoted,
  path,
}: QuestionVoteParams) {
  try {
    connectToDatabase();

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

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error("Question not found");
    }

    revalidatePath(path);
  } catch (err: any) {
    console.error(`Error downvoting question: ${err.message}`);
    throw new Error("Error downvoting question");
  }
}
