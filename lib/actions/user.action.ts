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
import { BadgeCriteriaType } from "@/types";
import { assignBadges } from "../utils";

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
    const skip = (page - 1) * pageSize;
    let sortQuery = {};
    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, "i") } },
        { username: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }
    switch (filter) {
      case "new_users":
        sortQuery = { joinedAt: -1 };
        break;
      case "old_users":
        sortQuery = { joinedAt: 1 };
        break;
      case "top_contributors":
        sortQuery = { reputation: -1 };
        break;
    }
    const users = await User.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(pageSize);
    const totalUsers = await User.countDocuments(query);
    return { users, isNext: totalUsers > skip + users.length };
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
    const skip = (page - 1) * pageSize;
    const query = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};
    let sortQuery = {};
    switch (filter) {
      case "most_recent":
        sortQuery = { createdAt: -1 };
        break;
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      case "most_voted":
        sortQuery = { upvotes: -1 };
        break;
      case "most_viewed":
        sortQuery = { views: -1 };
        break;
      case "most_answered":
        sortQuery = { answers: -1 };
        break;
    }
    const user = await User.findOne({ clerkId }).populate({
      path: "savedQuestions",
      match: query,
      options: { sort: sortQuery, skip, limit: pageSize + 1 },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      questions: user.savedQuestions.slice(0, pageSize),
      isNext: user.savedQuestions.length > pageSize,
    };
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

   // Get total upvotes on questions
const [questionUpvotes] = await Question.aggregate([
  { $match: { author: user._id } },
  {
    $project: {
      _id: 0,
      upvotesCount: { $size: { $ifNull: ["$upvotes", []] } }
    }
  },
  {
    $group: {
      _id: null,
      totalUpvotes: { $sum: "$upvotesCount" }
    }
  }
]);

// Get total upvotes on answers
const [answerUpvotes] = await Answer.aggregate([
  { $match: { author: user._id } },
  {
    $project: {
      _id: 0,
      upvotesCount: { $size: { $ifNull: ["$upvotes", []] } }
    }
  },
  {
    $group: {
      _id: null,
      totalUpvotes: { $sum: "$upvotesCount" }
    }
  }
]);

// Get total views on user's questions
const [views] = await Question.aggregate([
  { $match: { author: user._id } },
  {
    $group: {
      _id: null,
      totalViews: { $sum: { $ifNull: ["$views", 0] } }
    }
  }
]);


    const criteria = [
      {
        type: "QUESTION_COUNT" as BadgeCriteriaType,
        count: totalQuestions,
      },
      {
        type: "ANSWER_COUNT" as BadgeCriteriaType,
        count: totalAnswers,
      },
      {
        type: "QUESTION_UPVOTES" as BadgeCriteriaType,
        count: questionUpvotes?.totalUpvotes || 0,
      },
      {
        type: "ANSWER_UPVOTES" as BadgeCriteriaType,
        count: answerUpvotes?.totalUpvotes || 0,
      },
      {
        type: "TOTAL_VIEWS" as BadgeCriteriaType,
        count: views?.totalViews || 0,
      },
    ];

    const badges = assignBadges({ criteria });

    return {
      user,
      totalQuestions,
      totalAnswers,
      badges,
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
    const skip = (page - 1) * pageSize;

    const totalQuestions = await Question.countDocuments({ author: userId });
    const userQuestions = await Question.find({ author: userId })
      .sort({
        createdAt: -1,
        views: -1,
        upvotes: -1,
      })
      .skip(skip)
      .limit(pageSize)
      .populate("tags", "_id name")
      .populate("author", "_id clerkId name picture");

    return {
      questions: userQuestions,
      totalQuestions,
      isNext: totalQuestions > skip + userQuestions.length,
    };
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
    const skip = (page - 1) * pageSize;
    const userAnswers = await Answer.find({ author: userId })
      .sort({
        upvotes: -1,
      })
      .skip(skip)
      .limit(pageSize)
      .populate("question", "_id title")
      .populate("author", "_id clerkId name picture");
    return {
      answers: userAnswers,
      totalAnswers,
      isNext: totalAnswers > skip + userAnswers.length,
    };
  } catch (err: any) {
    console.error(`Error getting users: ${err.message}`);
    throw err;
  }
}
