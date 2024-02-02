"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import { SearchParams } from "./shared.types";
import Answer from "@/database/answer.model";
import User from "@/database/user.model";
import Tag from "@/database/tag.model";

const SearchableTypes = ["question", "user", "answer", "tag"];

export async function globalSearch(params: SearchParams) {
  try {
    await connectToDatabase();

    const query = params.query;
    const type = params.type?.toLowerCase();
    const regex = { $regex: query, $options: "i" };
    let results = [];

    const modelsAndTypes = [
      { model: Question, searchField: "title", type: "question" },
      { model: User, searchField: "name", type: "user" },
      { model: Answer, searchField: "content", type: "answer" },
      { model: Tag, searchField: "name", type: "tag" },
    ];

    if (!type || !SearchableTypes.includes(type)) {
      for (const { searchField, model, type } of modelsAndTypes) {
        const queryResults = await model
          .find({ [searchField]: regex })
          .limit(2);
        results.push(
          ...queryResults.map((item) => ({
            title:
              type === "answer"
                ? `Answers containing ${query}`
                : item[searchField],
            type,
            id:
              type === "user"
                ? item.clerkId
                : type === "answer"
                  ? item.question
                  : item._id,
          })),
        );
      }
    } else {
      const modelInfo = modelsAndTypes.find((m) => m.type === type);

      if (!modelInfo) {
        throw new Error(`Invalid type: ${type}`);
      }

      const queryResults = await modelInfo.model
        .find({
          [modelInfo.searchField]: regex,
        })
        .limit(8);

      results = queryResults.map((item) => ({
        title:
          type === "answer"
            ? `Answers containing ${query}`
            : item[modelInfo.searchField],
        type,
        id:
          type === "user"
            ? item.clerkId
            : type === "answer"
              ? item.question
              : item._id,
      }));
    }
    return JSON.stringify(results);
  } catch (e) {
    console.error(`Error fetching global results: ${e}`);
    throw e;
  }
}
