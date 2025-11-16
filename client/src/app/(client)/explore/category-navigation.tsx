"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

const categories = [
  {
    category: "For you",
    id: 0,
  },
  {
    category: "Characters",
    id: 1,
  },
  {
    category: "Scenes",
    id: 2,
  },
];

const CategoryNavigation = () => {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || categories[0].category;

  return (
    <header className="flex gap-4">
      {categories.map(({ category, id }) => (
        <Link href={`/?category=${category.toLowerCase()}`} key={id}>
          <span
            className={`text-xs cursor-pointer px-2 py-2 rounded-xl border ${
              activeCategory.toLowerCase() === category.toLowerCase() &&
              " bg-primary text-primary-foreground"
            }`}
          >
            {category}
          </span>
        </Link>
      ))}
    </header>
  );
};

export default CategoryNavigation;
