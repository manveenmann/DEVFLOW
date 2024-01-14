"use server";
import Question from "@/database/question.model";
import Answer from "@/database/answer.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";
import User from "@/database/user.model";
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Interaction from "@/database/interaction.model";

export async function createQuestion(params: CreateQuestionParams) {
  try {
    await connectToDatabase();

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
    return q;
  } catch (err: any) {
    console.error(`Error creating question: ${err.message}`);
  }
}

export async function getQuestions(params: GetQuestionsParams) {
  try {
    await connectToDatabase();
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
    await connectToDatabase();
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

export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    await connectToDatabase();
    await Question.findByIdAndDelete(params.questionId);
    await Answer.deleteMany({ question: params.questionId });
    await Interaction.deleteMany({ question: params.questionId });
    await Tag.updateMany(
      { questions: params.questionId },
      { $pull: { questions: params.questionId } },
    );

    revalidatePath(params.path);
  } catch (err: any) {
    console.error(`Error deleting question: ${err.message}`);
    throw new Error("Error deleting question");
  }
}

export async function editQuestion({
  questionId,
  title,
  content,
  path,
}: EditQuestionParams) {
  try {
    await connectToDatabase();

    const question = await Question.findByIdAndUpdate(questionId);

    if (!question) {
      throw new Error("Question not found");
    }

    question.title = title;
    question.description = content;

    await question.save();

    revalidatePath(path);
  } catch (err: any) {
    console.error(`Error editing question: ${err.message}`);
    throw new Error("Error editing question");
  }
}

export async function getHotQuestions() {
  try {
    await connectToDatabase();
    const questions = await Question.find({})
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .sort({ views: -1, upvotes: -1 })
      .limit(5);
    return questions;
  } catch (err: any) {
    console.error(`Error getting questions: ${err.message}`);
    return [];
  }
}
