import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getTopInteractedTags } from "@/lib/actions/tag.actions";
import { Badge } from "../ui/badge";
import RenderTag from "../shared/RenderTag";

interface UserCardProps {
  _id: string;
  clerkId: string;
  picture: string;
  name: string;
  username: string;
}

const UserCard = async (props: UserCardProps) => {
  const interactedTags = await getTopInteractedTags({ userId: props._id });
  return (
    <Link
      href={`/profile/${props._id}`}
      className="shadow-light100_darknone w-full max-xs:min-w-full xs:w-[260px]"
    >
      <article className="background-light900_dark200 light-border flex w-full flex-col items-center justify-center rounded-2xl border p-8">
        <Image
          src={props.picture}
          alt="user profile picture"
          width={100}
          height={100}
          className="rounded-full"
        />
        <div className="mt-4 text-center">
          <h3 className="h3-bold text-dark200_light900 line-clamp-1 ">
            {props.name}
          </h3>
          <p className="body-regular text-dark500_light500 mt-2">
            @{props.username}
          </p>
        </div>
        <div className="mt-5">
          {interactedTags.length > 0 ? (
            <div className="flex items-center gap-2">
              {interactedTags.map((tag: any) => (
                <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
              ))}
            </div>
          ) : (
            <Badge>No Tags Yet</Badge>
          )}
        </div>
      </article>
    </Link>
  );
};

export default UserCard;
