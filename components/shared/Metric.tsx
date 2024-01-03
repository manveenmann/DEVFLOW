import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getCount } from "@/lib/utils";

interface MetricProps {
  imgUrl: string;
  alt: string;
  value: number | string;
  title: string;
  textStyles?: string;
  href?: string;
  isAuthor?: boolean;
}

const Metric = ({
  imgUrl,
  alt,
  value,
  title,
  isAuthor,
  textStyles,
  href,
}: MetricProps) => {
  console.log(imgUrl);
  const metricContent = (
    <>
      <Image
        src={imgUrl}
        alt={alt}
        width={16}
        height={16}
        className={`object-contain ${href ? "rounded-full" : ""}`}
      />
      <p className={`${textStyles} flex items-center gap-1`}>
        {typeof value === "number" ? getCount(value) : value}
        <span
          className={`small-regular line-clamp-1 ${
            isAuthor ? "max-sm:hidden" : ""
          }`}
        >
          {title}
        </span>
      </p>
    </>
  );
  if (href)
    return (
      <Link className="flex-center gap-1" href={href}>
        {metricContent}
      </Link>
    );
  return <div className="flex-center flex-wrap gap-1">{metricContent}</div>;
};

export default Metric;
