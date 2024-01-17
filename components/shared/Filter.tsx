"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterProps {
  filters: {
    name: string;
    value: string;
  }[];
  otherClasses?: string;
  containerClasses?: string;
}

const Filter = ({ filters, otherClasses, containerClasses }: FilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleUpdateParams = (value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.get("filter") || "",
      key: "filter",
      value: value,
    });
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className={`relative ${containerClasses}`}>
      <Select
        onValueChange={handleUpdateParams}
        defaultValue={searchParams.get("filter") || undefined}
      >
        <SelectTrigger
          className={`body-regular light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5 ${otherClasses}`}
        >
          <div className="line-clamp-1 flex-1 text-left">
            <SelectValue placeholder="Select a filter" />
          </div>
        </SelectTrigger>
        <SelectContent className="background-light900_dark300">
          <SelectGroup>
            {filters.map((filter) => (
              <SelectItem
                key={filter.value}
                value={filter.value}
                className="body-regular text-dark500_light700"
              >
                {filter.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Filter;
