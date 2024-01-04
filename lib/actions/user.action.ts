"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  GetAllUsersParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";

export async function getUserByClerkId(userId: string) {
  try {
    connectToDatabase();

    const user = await User.findOne({ clerkId: userId });

    return JSON.stringify(user.toJSON());
  } catch (err: any) {
    console.error(`Error getting user: ${err.message}`);

    throw err;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();
    const newUser = await User.create(userData);
    return JSON.stringify(newUser.toJSON());
  } catch (err: any) {
    console.error(`Error getting user: ${err.message}`);
    throw err;
  }
}

export async function updateUser(userData: UpdateUserParams) {
  try {
    connectToDatabase();
    const { clerkId, updateData, path } = userData;
    const user = await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });
    revalidatePath(path);
  } catch (err: any) {
    console.error(`Error getting user: ${err.message}`);
    throw err;
  }
}

export async function deleteUser(id: string) {
  try {
    connectToDatabase();
    const user = await User.findOne({ clerkId: id });
    if (!user) {
      throw new Error("User not found");
    }
    const userQuestions = await Question.find({ author: user._id }).distinct(
      "_id",
    );
    await Question.deleteMany({ author: user._id });
    const deletedUser = await User.findByIdAndDelete(user._id);
    return deletedUser;
  } catch (err: any) {
    console.error(`Error getting user: ${err.message}`);
    throw err;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();

    // const { page = 1, pageSize = 20, filter, searchQuery } = params;
    const users = await User.find({}).sort({ createdAt: -1 });
    return { users };
  } catch (err: any) {
    console.error(`Error getting users: ${err.message}`);
    throw err;
  }
}
