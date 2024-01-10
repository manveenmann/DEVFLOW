import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
