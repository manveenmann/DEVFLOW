"use server";
import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";

export async function createQuestion(params: {
  title: string;
  description: string;
  tags: string[];
  author: string;
}) {
  try {
    connectToDatabase();

    const q = await Question.create({
      title: params.title,
      description: params.description,
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
  } catch (err: any) {
    console.error(`Error creating question: ${err.message}`);
  }
}
