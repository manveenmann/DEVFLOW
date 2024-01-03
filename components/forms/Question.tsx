import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuestionsSchema } from "@/lib/validations";
import { useTheme } from "@/context/ThemeProvider";
import { Badge } from "../ui/badge";
import { createQuestion } from "@/lib/actions/question.action";
import { getUserByClerkId } from "@/lib/actions/user.action";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const type = "create";

const Question = () => {
  const [isSumbutting, setIsSubmitting] = React.useState(false);
  const editorRef = useRef(null);
  const { mode, setMode } = useTheme();
  const router = useRouter();
  const path = usePathname();

  const user = useAuth();
  if (!user) {
    redirect("/sign-in");
  }

  const form = useForm<z.infer<typeof QuestionsSchema>>({
    resolver: zodResolver(QuestionsSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
    },
  });

  async function onSubmit(values: z.infer<typeof QuestionsSchema>) {
    setIsSubmitting(true);

    try {
      if (!user.userId) {
        throw new Error("Could not get user ID from clerk");
      }
      const mongoUser = JSON.parse(await getUserByClerkId(user.userId));
      await createQuestion({ author: mongoUser._id, path: path, ...values });
      router.push("/");
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  }

  const inputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: any,
  ) => {
    if (e.key === "Enter" && field.name === "tags") {
      e.preventDefault();
      const tagInput = e.target as HTMLInputElement;
      const tagValue = tagInput.value.trim();

      if (tagValue !== "") {
        if (tagValue.length > 20) {
          return form.setError("tags", {
            type: "required",
            message: "Tag length should be less than 20 characters",
          });
        }
        if (field.value.length >= 5) {
          return form.setError("tags", {
            type: "required",
            message: "You can add upto 5 tags",
          });
        }

        if (!field.value.includes(tagValue as never)) {
          form.setValue("tags", [...field.value, tagValue]);
          tagInput.value = "";
          form.clearErrors("tags");
        } else {
          form.trigger();
        }
      }
    }
  };

  const handleTagRemove = (tag: string, field: any) => {
    const newTags = field.value.filter((t: string) => t !== tag);
    form.setValue("tags", newTags);
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-10"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Question Title
                  <span className="text-primary-500">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <Input
                    className="no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] border"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="body-regular mt-2.5 text-light-500">
                  Be specific and imagine you’re asking a question to another
                  person
                </FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Question Description
                  <span className="text-primary-500">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                    onInit={(evt, editor) => {
                      // @ts-ignore
                      editorRef.current = editor;
                    }}
                    initialValue=""
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
                <FormDescription className="body-regular mt-2.5 text-light-500">
                  Explain all the information someone would need to answer your
                  question. Min 100 characters.
                </FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Tags
                  <span className="text-primary-500">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <>
                    <Input
                      className="no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] border"
                      placeholder="Add tags..."
                      onKeyDown={(e) => inputKeyDown(e, field)}
                    />
                    {field.value.length > 0 && (
                      <div className="flex-start mt-2.5 gap-2.5">
                        {field.value.map((tag) => (
                          <Badge
                            key={tag}
                            className="subtle-medium background-light800_dark300 text-light400_light500 flex 
                            items-center justify-center gap-2 rounded-md border-none px-4 py-2 uppercase"
                            onClick={() => handleTagRemove(tag, field)}
                          >
                            {tag}
                            <Image
                              src="/assets/icons/close.svg"
                              alt="close icon"
                              width={12}
                              height={12}
                              className="cursor-pointer object-contain invert-0 dark:invert"
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                </FormControl>
                <FormDescription className="body-regular mt-2.5 text-light-500">
                  Add upto 5 tags to describe what your question is about. Press
                  enter to add a tag.
                </FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className={`${
              isSumbutting ? "background-light800_dark300" : "primary-gradient"
            } w-fit !text-light-900`}
            disabled={isSumbutting}
          >
            {isSumbutting
              ? type === "create"
                ? "Posting..."
                : "Saving..."
              : type === "create"
                ? "Post Question"
                : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Question;
