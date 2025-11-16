"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles, TrendingUp, X, User } from "lucide-react";
import { getTrendingOrSearchCharactersAction } from "@/server/actions/character.actions";
import { cn } from "@/lib/utils";

type CharacterBrief = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  tagline?: string | null;
};

type CharacterSearchResult = {
  characters: CharacterBrief[];
  personalities: string[];
};

export function CharacterSearch({
  mainContainerClassName,
  inputClassName,
  inputContainerClassName,
  instantApply,
}: {
  mainContainerClassName?: string;
  inputClassName?: string;
  inputContainerClassName?: string;
  instantApply?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load q from search param initially
  useEffect(() => {
    const paramQ = searchParams.get("q") ?? "";
    setValue(paramQ);
  }, [searchParams]);

  // Recent searches
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Debounce input
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQ(value.trim()), 180);
    return () => clearTimeout(t);
  }, [value]);

  const { data, isLoading } = useQuery<CharacterSearchResult>({
    queryKey: ["characters", q],
    queryFn: () => getTrendingOrSearchCharactersAction(q),
    enabled: focused,
    staleTime: 30_000,
  });

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recent-searches");
      if (stored) setRecentSearches(JSON.parse(stored).slice(0,4));
    } catch {}
  }, []);

  function saveRecentSearch(term: string) {
    if (term.length === 0) {
      return;
    }
    setRecentSearches((prev) => {
      const updated = [term, ...prev.filter((t) => t !== term)].slice(0, 5);
      localStorage.setItem("recent-searches", JSON.stringify(updated));
      return updated;
    });
  }
  function removeRecentSearch(term: string) {
    setRecentSearches((prev) => {
      const updated = prev.filter((t) => t !== term);
      localStorage.setItem("recent-searches", JSON.stringify(updated));
      return updated;
    });
  }

  const list: CharacterBrief[] = useMemo(() => {
    if (!focused) return [];
    return data?.characters ?? [];
  }, [focused, data?.characters]);

  const personalities: string[] = useMemo(() => {
    if (!focused) return [];
    return data?.personalities ?? [];
  }, [focused, data?.personalities]);

  useEffect(() => {
    setHighlight(0);
  }, [q, focused]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!panelRef.current || !inputRef.current) return;
      if (
        panelRef.current.contains(e.target as Node) ||
        inputRef.current.contains(e.target as Node)
      )
        return;
      setFocused(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function selectItem(name: string) {
    saveRecentSearch(name);
    router.push(`/search?q=${encodeURIComponent(name)}`);
    setFocused(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(0, list.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      if (list[highlight]) {
        e.preventDefault();
        selectItem(list[highlight].name);
      }
    } else if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("q") as string;
    saveRecentSearch(searchValue);
    router.push(`/search?q=${encodeURIComponent(searchValue)}`);
  }

  return (
    <div className={cn(`relative ${mainContainerClassName}`)}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div
          className={cn(
            `flex w-full h-[45px] bg-accent rounded-4xl ${inputContainerClassName}`
          )}
        >
          <span className="px-3 self-center">
            <Search className="w-5" />
          </span>
          <input
            ref={inputRef}
            name="q"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={onKeyDown}
            placeholder="Search"
            className={cn(
              `flex-1 h-full bg-transparent outline-0 border-0 focus:outline-0 focus:border-0 text-sm ${inputClassName}`
            )}
          />
        </div>
      </form>

      {focused && (
        <div
          ref={panelRef}
          className="max-h-[70dvh] overflow-y-auto absolute z-20 mt-2 w-full rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-black/40"
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                <Sparkles size={14} className="" />
                <span>Recent searches</span>
              </div>
              <ul>
                {recentSearches.map((term) => (
                  <li
                    key={term}
                    className="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-white/5 rounded transition-colors"
                  >
                    <span
                      className="truncate text-sm text-zinc-100 flex-1"
                      onClick={() => selectItem(term)}
                    >
                      {term}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(term);
                      }}
                      className="ml-2 text-zinc-400 hover:text-zinc-200"
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Header */}
          <div className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {q.length > 0 ? (
                <>
                  <Sparkles size={14} className="" />
                  <span>{"Suggestions"}</span>
                </>
              ) : (
                <>
                  <TrendingUp size={14} className="" />
                  <span>{"Trending characters"}</span>
                </>
              )}
            </div>
          </div>

          {/* Character list */}
          <div className="overflow-y-auto divide-y divide-white/5">
            {isLoading && (
              <div className="p-3 text-sm text-zinc-400">
                {q.length > 0 ? "Searching..." : "Loading trending..."}
              </div>
            )}

            {list.length === 0 && !isLoading && (
              <div className="p-3 text-sm text-zinc-500">No suggestions</div>
            )}

            <ul role="listbox" aria-label="Character suggestions">
              {list.map((c, idx) => {
                const active = idx === highlight;
                return (
                  <li
                    key={c.id}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setHighlight(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectItem(c.name);
                    }}
                    className={[
                      "flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors",
                      active ? "bg-white/10" : "hover:bg-white/5",
                    ].join(" ")}
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <Search className="w-4 opacity-60" />
                      <p className="truncate text-sm text-zinc-100">{c.name}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Personalities */}
          {personalities.length > 0 && (
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 text-xs mb-2 text-muted-foreground">
                <User size={14} className="" />
                <span>
                  {q.length > 0
                    ? "Matching personalities"
                    : "Trending personalities"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {personalities.map((p) => (
                  <span
                    key={p}
                    onClick={() => selectItem(p)}
                    className="cursor-pointer text-xs px-3 py-1 rounded-full bg-white/10 text-zinc-100 hover:bg-white/20 transition-colors"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
