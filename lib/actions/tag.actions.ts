"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { GetAllTagsParams, GetTopInteractedTagsParams } from "./shared.types";
import Tag from "@/database/tag.model";

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
