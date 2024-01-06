import * as z from "zod";

export const QuestionsSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must contain at least 5 characters" })
    .max(130, { message: "Title cannot be longer than 130 characters" }),
  description: z
    .string()
    .min(100, { message: "Description must contain at least 100 characters" }),
  tags: z
    .array(
      z
        .string()
        .min(1, { message: "Tag cannot be empty" })
        .max(20, { message: "Tag cannot be more than 20 characters long" }),
    )
    .min(1, { message: "You must provide at least one tag" })
    .max(5, { message: "You cannot provide more than 5 tags" }),
});

export const AnswerSchema = z.object({
  answer: z
    .string()
    .min(100, { message: "Answer must contain at least 100 characters" }),
});
