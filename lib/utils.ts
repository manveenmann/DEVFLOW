import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";
import { BADGE_CRITERIA } from "@/constants";
import { BadgeCounts } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTimestamp = (createdAt: Date): string => {
  const now = new Date();
  const timeDiff = now.getTime() - createdAt.getTime();

  const seconds = Math.floor(timeDiff / 1000);
  const minutes = Math.floor(timeDiff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  if (years > 0) return `${years} years ago`;
  else if (months > 0) return `${months} months ago`;
  else if (days > 0) return `${days} days ago`;
  else if (hours > 0) return `${hours} hours ago`;
  else if (minutes > 0) return `${minutes} minutes ago`;
  else if (seconds > 0) return `${seconds} seconds ago`;
  else return "just now";
};

export const getCount = (count: number): string => {
  if (count > 1000000000) return `${(count / 1000000000).toFixed(1)}B`;
  else if (count > 1000000) return `${(count / 1000000).toFixed(1)}M`;
  else if (count > 1000) return `${(count / 1000).toFixed(1)}K`;
  else return `${count}`;
};

export const formatDate = (date: Date): string => {
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  return `${month} ${year}`;
};

interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}

export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
  const currUrl = qs.parse(params);
  currUrl[key] = value;
  return qs.stringifyUrl(
    { url: window.location.pathname, query: currUrl },
    { skipNull: true },
  );
};

interface RemoveUrlQueryParams {
  params: string;
  keys: string[];
}

export const removeKeysFromQuery = ({ params, keys }: RemoveUrlQueryParams) => {
  const currUrl = qs.parse(params);
  keys.forEach((k) => delete currUrl[k]);

  return qs.stringifyUrl(
    { url: window.location.pathname, query: currUrl },
    { skipNull: true },
  );
};

interface BadgeParams {
  criteria: {
    type: keyof typeof BADGE_CRITERIA;
    count: number;
  }[];
}

export const assignBadges = (params: BadgeParams) => {
  const badgeCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  };

  const { criteria } = params;

  criteria.forEach((c: any) => {
    const { type, count } = c;
    const badgeLevels: any =
      BADGE_CRITERIA[type as keyof typeof BADGE_CRITERIA];

    Object.keys(badgeLevels).forEach((level) => {
      if (count >= badgeLevels[level]) {
        badgeCounts[level as keyof BadgeCounts] += 1;
      }
    });
  });

  return badgeCounts;
};
