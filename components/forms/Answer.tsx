"use client";

import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AnswerSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor } from "@tinymce/tinymce-react";
import { useTheme } from "@/context/ThemeProvider";
import { Button } from "../ui/button";
import Image from "next/image";
import { createAnswer } from "@/lib/actions/answer.action";
import { useAuth } from "@clerk/nextjs";
import { redirect, usePathname } from "next/navigation";
import { getUserByClerkId } from "@/lib/actions/user.action";

const Answer = (props: { questionId: string }) => {
  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      answer: "",
    },
  });

  const { mode, setMode } = useTheme();
  const editorRef = React.useRef(null);
  const [isSumbutting, setIsSubmitting] = React.useState(false);
  const path = usePathname();
  const user = useAuth();
  if (!user) {
    redirect("/sign-in");
  }

  async function handleCreateAnswer(values: z.infer<typeof AnswerSchema>) {
    setIsSubmitting(true);
    console.log("submitting");
    try {
      if (!user.userId) {
        throw new Error("Could not get user ID from clerk");
      }
      const userId: string = await getUserByClerkId(user.userId)
        .then((u) => JSON.parse(u))
        .then((u) => u._id)
        .catch((e) => {});
      await createAnswer({
        content: values.answer,
        author: userId,
        path: path,
        question: JSON.parse(props.questionId),
      });

      form.reset();
      if (editorRef.current) {
        // @ts-ignore
        editorRef.current.setContent("");
      }
    } catch (error: any) {
      console.error(`Error creating answer: ${error.message}`);
    }
  }

  return (
    <div className="mt-5">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>
      </div>
      <Form {...form}>
        <form
          className="mt-6 flex w-full flex-col gap-10"
          onSubmit={form.handleSubmit(handleCreateAnswer)}
        >
          <FormField
            control={form.control}
            name="answer"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormControl className="mt-3.5">
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                    onInit={(evt, editor) => {
                      // @ts-ignore
                      editorRef.current = editor;
                    }}
                    onBlur={field.onBlur}
                    onEditorChange={(c) => field.onChange(c)}
                    init={{
                      height: 350,
                      menubar: false,
                      skin: mode === "dark" ? "oxide-dark" : "oxide",
                      content_css: mode === "dark" ? "dark" : "default",
                      plugins: [
                        "advlist",
                        "codesample",
                        "autolink",
                        "lists",
                        "link",
                        "image",
                        "charmap",
                        "preview",
                        "anchor",
                        "searchreplace",
                        "visualblocks",
                        "fullscreen",
                        "insertdatetime",
                        "media",
                        "table",
                      ],
                      toolbar:
                        "undo redo | blocks | " +
                        "codesample bold italic forecolor | alignleft aligncenter " +
                        "alignright alignjustify | bullist numlist | ",
                      content_style:
                        "body { font-family:Inter; font-size:16px }",
                    }}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <div className="flex justify-end ">
            <Button
              className={`${
                isSumbutting
                  ? "background-light800_dark300"
                  : "primary-gradient !text-light-900"
              } w-fit`}
              disabled={isSumbutting}
              type="submit"
            >
              {isSumbutting ? "Posting..." : "Post Answer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Answer;
