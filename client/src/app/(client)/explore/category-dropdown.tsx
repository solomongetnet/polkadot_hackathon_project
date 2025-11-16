"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { setValueToSearchParam } from "@/utils/search-params";
import { useErrorToast } from "@/hooks/use-error-toast";

const categories = [
  { value: "explore", label: "Explore" },
  { value: "following", label: "Following" },
  { value: "popular", label: "Popular" },
];

export default function CategoryDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn } = useAuthStore();

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "explore";
  const { showErrorToast } = useErrorToast();

  const handleCategorySelect = (value: string) => {
    if (value === "following" && !isLoggedIn) {
      showErrorToast({
        code: "LOGIN_REQUIRED",
      });
      return;
    }

    setValueToSearchParam("category", value);
    setIsOpen(false);
  };

  const currentLabel =
    categories.find((cat) => cat.value === currentCategory)?.label || "Explore";

  return (
    <div className="relative inline-block">
      {/* Your existing div - enhanced with click handler */}
      <div
        className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-lg md:text-xl font-semibold tracking-wide">
          {currentLabel}
        </h2>
        <ChevronDown
          className={cn(
            "w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {/* Modern Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-2 z-20 min-w-[140px] bg-popover border border-border rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="p-1 space-y-1">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategorySelect(category.value)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-150",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                    currentCategory === category.value &&
                      "bg-accent text-accent-foreground font-medium"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
