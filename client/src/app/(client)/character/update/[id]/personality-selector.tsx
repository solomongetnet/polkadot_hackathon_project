"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Plus, X } from "lucide-react";

const PERSONALITIES = [
  "Friendly",
  "Professional",
  "Witty",
  "goofy",
  "chaotic",
  "unpredictable",
  "Empathetic",
  "Analytical",
  "Preacher",
  "Creative",
  "Pastor",
  "Shepherd",
  "Evangelist",
  "Prophet",
  "Enthusiastic",
  "Calm",
  "Curious",
  "Supportive",
  "Adventurous",
  "Wise",
  "Playful",
  "Mysterious",
  "Confident",
  "Gentle",
  "Ambitious",
  "Philosophical",
  "Optimistic",
  "Pragmatic",
  "Charismatic",
  "Rebellious",
  "Nurturing",
  "Intellectual",
  "Spontaneous",
  "Diplomatic",
  "Eccentric",
  "Stoic",
  "Innovative",
  "Compassionate",
];

const MAX_SELECTIONS = 5;
const INITIAL_DISPLAY = 10;
const INCREMENT = 10;
const MAX_CUSTOM_LENGTH = 25;

export default function PersonalitySelector({ setValue }: { setValue: any }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_DISPLAY);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPersonality, setCustomPersonality] = useState("");

  const handleToggle = (name: string) => {
    setSelected((prev) => {
      let updated: string[];
      if (prev.includes(name)) {
        updated = prev.filter((n) => n !== name);
      } else if (prev.length < MAX_SELECTIONS) {
        updated = [...prev, name];
      } else {
        updated = prev;
      }
      // Fix: Use updated instead of selected
      setValue("personality", updated.toString());
      return updated;
    });
  };

  const handleAddCustom = () => {
    if (customPersonality.trim() && selected.length < MAX_SELECTIONS) {
      const trimmedPersonality = customPersonality.trim();
      if (!selected.includes(trimmedPersonality)) {
        const updated = [...selected, trimmedPersonality];
        setSelected(updated);
        setValue("personality", updated.toString());
      }
      setCustomPersonality("");
      setShowCustomInput(false);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CUSTOM_LENGTH) {
      setCustomPersonality(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddCustom();
    } else if (e.key === "Escape") {
      setCustomPersonality("");
      setShowCustomInput(false);
    }
  };

  const isDisabled = (name: string) =>
    selected.length >= MAX_SELECTIONS && !selected.includes(name);

  const canShowMore = visibleCount < PERSONALITIES.length;
  const canShowLess = visibleCount > INITIAL_DISPLAY;

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        {selected.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">
              Selected ({selected.length}/{MAX_SELECTIONS}):
            </div>
            <div className="flex flex-wrap gap-1">
              {selected.map((name) => (
                <Badge
                  key={name}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200 flex items-center gap-1"
                  onClick={() => handleToggle(name)}
                >
                  {name}
                  <X className="h-2.5 w-2.5" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {PERSONALITIES.slice(0, visibleCount).map((name) => {
            const isSelected = selected.includes(name);
            return (
              <button
                type="button"
                key={name}
                onClick={() => handleToggle(name)}
                disabled={isDisabled(name)}
                className={`
                  relative px-2 py-1.5 rounded-md border text-xs text-left transition-all duration-200
                  ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  }
                  ${
                    isDisabled(name)
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
              >
                {isSelected && (
                  <Check className="h-3 w-3 absolute top-0.5 right-0.5 text-primary-foreground" />
                )}
                <div className="pr-4 font-medium">{name}</div>
              </button>
            );
          })}

          {/* Custom personality input or add button */}
          {showCustomInput ? (
            <div className="col-span-3 sm:col-span-4 lg:col-span-5 relative px-2 py-1.5 rounded-md border border-primary bg-accent flex items-center gap-2">
              <Input
                type="text"
                value={customPersonality}
                onChange={handleCustomInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Enter custom personality..."
                className="h-auto p-0 border-0 bg-transparent text-xs font-medium focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                maxLength={MAX_CUSTOM_LENGTH}
                autoFocus
              />
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleAddCustom}
                  disabled={
                    !customPersonality.trim() ||
                    selected.length >= MAX_SELECTIONS
                  }
                  className="h-5 w-5 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomPersonality("");
                    setShowCustomInput(false);
                  }}
                  className="h-5 w-5 rounded-sm bg-muted text-muted-foreground hover:bg-muted/80 flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              disabled={selected.length >= MAX_SELECTIONS}
              className={`
      relative px-2 py-1.5 rounded-md border text-xs transition-all duration-200 flex items-center justify-center
      border-dashed border-primary/50 hover:border-primary hover:bg-accent
      ${
        selected.length >= MAX_SELECTIONS
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer"
      }
    `}
            >
              <Plus className="h-3 w-3 text-primary" />
            </button>
          )}
        </div>

        {showCustomInput && (
          <div className="text-xs text-muted-foreground text-center">
            {customPersonality.length}/{MAX_CUSTOM_LENGTH} characters • Press
            Enter to add, Escape to cancel
          </div>
        )}

        <div className="flex justify-center">
          {canShowMore && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setVisibleCount((v) =>
                  Math.min(v + INCREMENT, PERSONALITIES.length)
                )
              }
              className="text-xs bg-transparent"
            >
              Show More (+
              {Math.min(INCREMENT, PERSONALITIES.length - visibleCount)})
            </Button>
          )}
          {canShowLess && !canShowMore && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setVisibleCount(INITIAL_DISPLAY)}
              className="text-xs bg-transparent"
            >
              Show Less
            </Button>
          )}
        </div>

        {selected.length === MAX_SELECTIONS && (
          <div className="text-center text-xs text-amber-600 dark:text-amber-400">
            Maximum reached. Deselect to choose different traits.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
