"use server";
import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";
import User from "@/database/user.model";
import { CreateQuestionParams, GetQuestionsParams } from "./shared.types";
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
