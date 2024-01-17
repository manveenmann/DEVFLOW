import React from "react";
import Link from "next/link";
import { Badge } from "../ui/badge";

interface Props {
  _id: string;
  name: string;
  questions?: number;
  showCount?: boolean;
  link?: boolean;
}

const RenderTagContent = ({ _id, name, questions, showCount, link }: Props) => {
  return (
    <>
      <Badge className="subtle-medium background-light800_dark400 text-light400_light500 rounded-md border-none px-4 py-2 uppercase">
        {name}
      </Badge>
      {showCount && (
        <p className="small-medium text-dark500_light700">{questions}</p>
      )}
    </>
  );
};
const RenderTag = (props: Props) => {
  if (!props.link) {
    return <RenderTagContent {...props} />;
  }
  return (
    <Link href={`/tags/${props._id}`} className="flex justify-between gap-2">
      <RenderTagContent {...props} />
    </Link>
  );
};

export default RenderTag;
