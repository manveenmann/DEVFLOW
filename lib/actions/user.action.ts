"use server";

import User from "@/database/user.model";
import Tag from "@/database/tag.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Answer from "@/database/answer.model";
import { FilterQuery } from "mongoose";

export async function getUserByClerkId(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error("User not found");
    }
    return JSON.stringify(user.toJSON());
  } catch (err: any) {
    console.error(`Error getting user: ${err.message}`);

    throw err;
  }
}

export async function getUserById(userId: string) {
  try {
    connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return JSON.stringify(user.toJSON());
  } catch (err: any) {
    console.error(`Error getting user: ${err.message}`);
    throw err;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    await connectToDatabase();
    const newUser = await User.create(userData);
    return JSON.stringify(newUser.toJSON());
  } catch (err: any) {
    console.error(`Error getting user: ${err.message}`);
    throw err;
  }
}

export async function updateUser(userData: UpdateUserParams) {
  try {
    await connectToDatabase();
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
    await connectToDatabase();
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
    await connectToDatabase();

    const { page = 1, pageSize = 20, filter, searchQuery } = params;
    const query: FilterQuery<typeof User> = {};
    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, "i") } },
        { username: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }
    const users = await User.find(query).sort({ createdAt: -1 });
    return { users };
  } catch (err: any) {
    console.error(`Error getting users: ${err.message}`);
    throw err;
  }
}

export async function saveQuestion({
  userId,
  path,
  questionId,
}: ToggleSaveQuestionParams) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const isSaved = user.savedQuestions.includes(questionId);
    let updateQuery = {};
    if (isSaved) {
      updateQuery = {
        $pull: { savedQuestions: questionId },
      };
    } else {
      updateQuery = {
        $push: { savedQuestions: questionId },
      };
    }

    await User.findByIdAndUpdate(userId, updateQuery, { new: true });

    revalidatePath(path);
  } catch (err: any) {
    console.error(`Error getting users: ${err.message}`);
    throw err;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    await connectToDatabase();

    const { clerkId, page = 1, pageSize = 10, searchQuery, filter } = params;
    const query = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};
    const user = await User.findOne({ clerkId }).populate({
      path: "savedQuestions",
      match: query,
      options: { sort: { createdAt: -1 } },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return { questions: user.savedQuestions };
  } catch (err: any) {
    console.error(`Error getting users: ${err.message}`);
    throw err;
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId: params.userId });

    if (!user) {
      throw new Error("User not found");
    }

    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });

    return {
      user,
      totalQuestions,
      totalAnswers,
    };
  } catch (err: any) {
    console.error(`Error getting users: ${err.message}`);
    throw err;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    await connectToDatabase();

    const { userId, page = 1, pageSize = 10 } = params;

    const totalQuestions = await Question.countDocuments({ author: userId });
    const userQuestions = await Question.find({ author: userId })
      .sort({
        views: -1,
        upvotes: -1,
      })
      .populate("tags", "_id name")
      .populate("author", "_id clerkId name picture");

    return { questions: userQuestions, totalQuestions };
  } catch (err: any) {
    console.error(`Error getting users: ${err.message}`);
    throw err;
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    await connectToDatabase();
    const { userId, page = 1, pageSize = 10 } = params;
    const totalAnswers = await Answer.countDocuments({ author: userId });
    const userAnswers = await Answer.find({ author: userId })
      .sort({
        upvotes: -1,
      })
      .populate("question", "_id title")
      .populate("author", "_id clerkId name picture");
    return { answers: userAnswers, totalAnswers };
  } catch (err: any) {
    console.error(`Error getting users: ${err.message}`);
    throw err;
  }
}
