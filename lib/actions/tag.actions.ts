"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types";
import Tag from "@/database/tag.model";
import Question from "@/database/question.model";

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    await connectToDatabase();

    const { userId, limit = 5 } = params;
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    //TODO:

    return [
      { _id: "1", name: "tag1" },
      { _id: "2", name: "tag2" },
      { _id: "3", name: "tag2" },
    ];
  } catch (err: any) {
    console.error(`Error getting users: ${err.message}`);
    throw err;
  }
}

export async function getAllTags(params: GetAllTagsParams) {
  try {
    await connectToDatabase();

    const tags = await Tag.find({});

    return { tags };
  } catch (err: any) {
    console.error(`Error getting users: ${err.message}`);
    throw err;
  }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    await connectToDatabase();

    const { tagId, page = 1, pageSize = 10, searchQuery } = params;

    const query = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};
    const tagFilter = { _id: tagId };
    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: query,
      options: { sort: { createdAt: -1 } },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    return { tag: tag.name, questions: tag.questions };
  } catch (err: any) {
    console.error(`Error getting users: ${err.message}`);
    throw err;
  }
}

export async function getTopTags() {
  try {
    await connectToDatabase();
    const tags = await Tag.aggregate([
      { $project: { name: 1, numberOfQuestions: { $size: "$questions" } } },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ]);
    return tags;
  } catch (err: any) {
    console.error(`Error getting users: ${err.message}`);
    throw err;
  }
}
