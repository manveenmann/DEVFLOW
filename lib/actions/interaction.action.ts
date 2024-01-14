"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import { ViewQuestionParams } from "./shared.types";
import Interaction from "@/database/interaction.model";

export async function viewQuestion(params: ViewQuestionParams) {
  try {
    await connectToDatabase();

    const { questionId, userId } = params;

    await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });

    if (userId && userId !== "") {
      const existingInteraction = await Interaction.findOne({
        user: userId,
        action: "view",
        question: questionId,
      });

      if (existingInteraction) return;

      await Interaction.create({
        user: userId,
        action: "view",
        question: questionId,
      });
    }
  } catch (err: any) {
    console.error(`Error : ${err.message}`);
    throw new Error(`Error viewing question: ${err.message}`);
  }
}
