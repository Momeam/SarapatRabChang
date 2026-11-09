"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  max?: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
  size?: "sm" | "md" | "lg";
  showValueText?: boolean;
}

export default function StarRating({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = "md",
  showValueText = false,
}: StarRatingProps) {
  const [hoverVal, setHoverVal] = useState<number | null>(null);

  const starSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  const currentVal = hoverVal !== null ? hoverVal : value;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, i) => {
          const starNum = i + 1;
          const isFilled = starNum <= currentVal;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starNum)}
              onMouseEnter={() => interactive && setHoverVal(starNum)}
              onMouseLeave={() => interactive && setHoverVal(null)}
              className={`p-0.5 transition-transform ${
                interactive ? "cursor-pointer hover:scale-110 focus:outline-none" : "cursor-default"
              }`}
            >
              <Star
                className={`${starSizes[size]} ${
                  isFilled
                    ? "text-amber-400 fill-amber-400"
                    : "text-zinc-200 fill-zinc-100"
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>
      {showValueText && (
        <span className="text-sm font-semibold text-zinc-900 ml-1.5">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

