"use client";
import React from "react";
import Image from "next/image";
import { deleteQuestion } from "@/lib/actions/question.action";
import { usePathname } from "next/navigation";
import { deleteAnswer } from "@/lib/actions/answer.action";
import { useRouter } from "next/navigation";

interface EditDeleteActionProps {
  type: "question" | "answer";
  itemId: string;
}

const EditDeleteAction = ({ type, itemId }: EditDeleteActionProps) => {
  const path = usePathname();
  const router = useRouter();
  const handleEdit = () => {
    router.push(`/question/edit/${JSON.parse(itemId)}`);
  };
  const handleDelete = async () => {
    if (type === "question") {
      await deleteQuestion({ questionId: JSON.parse(itemId), path: path });
    } else {
      await deleteAnswer({ answerId: JSON.parse(itemId), path: path });
    }
  };

  return (
    <div className="flex items-center justify-end gap-3 max-sm:w-full">
      <Image
        src="/assets/icons/edit.svg"
        alt="edit"
        width={14}
        height={14}
        className="cursor-pointer object-contain"
        onClick={handleEdit}
      />
      <Image
        src="/assets/icons/trash.svg"
        alt="delete"
        width={14}
        height={14}
        className="cursor-pointer object-contain"
        onClick={handleDelete}
      />
    </div>
  );
};

export default EditDeleteAction;
