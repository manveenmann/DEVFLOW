"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";

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
