import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserFilters } from "@/constants/filters";
import LocalSearch from "@/components/shared/search/LocalSearch";
import Filter from "@/components/shared/Filter";
import { getAllUsers } from "@/lib/actions/user.action";
import UserCard from "@/components/cards/UserCard";
import NoResult from "@/components/shared/NoResult";
import { SearchParamsProps } from "@/types";
import Pagination from "@/components/shared/Pagination";

const page = async ({ searchParams }: SearchParamsProps) => {
  const results = await getAllUsers({
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
  });
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">All Questions</h1>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route="/community"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for amazing minds"
          otherClasses="flex-1"
        />
        <Filter
          filters={UserFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>

      <section className="mt-12 flex flex-wrap gap-4">
        {results.users.length > 0 ? (
          results.users.map((user: any) => (
            <UserCard
              key={user._id}
              _id={user._id}
              picture={user.picture}
              clerkId={user.clerkId}
              name={user.name}
              username={user.username}
            />
          ))
        ) : (
          <div className="paragraph-regular text-dark200_light800 mx-auto max-w-4xl text-center">
            <NoResult
              title="No Users Yet"
              description=""
              linkText="Join to be the first"
              link="/sign-up"
            />
          </div>
        )}
      </section>
      <div className="mt-10">
        <Pagination
          page={searchParams?.page ? +searchParams.page : 1}
          isNext={results.isNext || false}
        />
      </div>
    </>
  );
};

export default page;
