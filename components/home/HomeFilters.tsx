"use client";

import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { HomePageFilters } from "@/constants/filters";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";

const HomeFilters = () => {
  const searchParams = useSearchParams();
  const [active, setActive] = React.useState(searchParams.get("filter") || "");
  const router = useRouter();
  const path = usePathname();

  const handleClick = (item: string) => {
    if (active !== item) {
      setActive(item);
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "filter",
        value: item.toLowerCase(),
      });
      router.push(newUrl, { scroll: false });
    } else {
      const newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keys: ["filter"],
      });
      setActive("");
      router.push(newUrl, { scroll: false });
    }
  };

  return (
    <div className="mt-10 flex-wrap gap-3 md:flex hidden">
      {HomePageFilters.map((filter) => (
        <Button
          key={filter.value}
          onClick={() => handleClick(filter.value)}
          className={`body-medium rounded-lg px-6 py-3 capitalize shadow-none ${
            active === filter.value
              ? "bg-primary-100 text-primary-500 dark:bg-primary-500 dark:text-primary-100"
              : "bg-light-800 text-light-500 hover:bg-light-700 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-400"
          }`}
        >
          {filter.name}
        </Button>
      ))}
    </div>
  );
};

export default HomeFilters;
