"use client";
import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  page: number;
  isNext: boolean;
}

const Pagination = (props: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleNavigration = (direction: string) => {
    const nextPage = direction === "next" ? props.page + 1 : props.page - 1;

    const url = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: nextPage.toString(),
    });

    router.push(url);
  };

  if (!props.isNext && props.page === 1) return <></>;

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Button
        disabled={props.page === 1}
        onClick={() => handleNavigration("prev")}
        className="light-border-2 btn border flex min-h-[36px] items-center justify-center gap-2"
      >
        <Image
          src="/assets/icons/arrow-left.svg"
          alt="prev"
          width={10}
          height={10}
        />
      </Button>
      <div className="bg-primary-500 flex justify-center items-center rounded-md px-4 py-3">
        <p className="body-semibold text-light-900">{props.page}</p>
      </div>
      <Button
        disabled={!props.isNext}
        onClick={() => handleNavigration("next")}
        className="light-border-2 btn border flex min-h-[36px] items-center justify-center gap-2"
      >
        <Image
          src="/assets/icons/arrow-right.svg"
          alt="next"
          width={10}
          height={10}
        />
      </Button>
    </div>
  );
};

export default Pagination;
