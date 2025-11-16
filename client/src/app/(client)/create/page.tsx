import type React from "react";
import { FormContainer } from "./form-container";
import { Metadata } from "next";
import { Suspense } from "react";
import Header from "./header";

export const metadata: Metadata = {
  title: "Create New AI Character",
  description:
    "Build a unique AI character with custom personality, traits, and prompt.",
};

export default function Page() {
  return (
    <main className="">
      <Header />

      {/* title */}
      <Suspense fallback={null}>
        <div className="w-full min-h-screen pb-10 px-4 sm:px-8 md:px-[150px] lg:px-[280px]">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Create New AI Character
          </h1>
          <FormContainer />
        </div>
      </Suspense>
    </main>
  );
}
