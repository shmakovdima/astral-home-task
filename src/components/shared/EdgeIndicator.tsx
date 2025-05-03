import { memo } from "react";

import { cnTwMerge } from "@/helpers/cnTwMerge";

type Props = {
  isVisible: boolean;
  edgeProgress: number;
  position: "left" | "right";
  type: "weekly" | "daily";
};

export const EdgeIndicator = memo(
  ({ isVisible, edgeProgress, position, type }: Props) => {
    if (!isVisible) return null;

    const isLeft = position === "left";
    const gradientDirection = isLeft ? "bg-gradient-to-r" : "bg-gradient-to-l";

    const getArrowPath = () => {
      if (isLeft) {
        return type === "weekly" ? "M15 19l-7-7 7-7" : "M19 12H5m7 7l-7-7 7-7";
      }

      return type === "weekly" ? "M9 5l7 7-7 7" : "M5 12h14m-7-7l7 7-7 7";
    };

    const arrowPath = getArrowPath();
    const paddingTop = type === "daily" ? "pt-[195px]" : "pb-[60px]";
    const alignItems = type === "daily" ? "items-start" : "items-end";

    return (
      <div
        className={cnTwMerge(
          "fixed top-0 w-[100px] h-screen min-h-[calc(100dvh_-_180px)] from-blue-500/40 to-transparent z-[100] flex",
          isLeft ? "justify-start" : "justify-end",
          isLeft ? "left-0" : "right-0",
          gradientDirection,
          alignItems,
          paddingTop,
        )}
      >
        <div className={cnTwMerge("relative", isLeft ? "ml-4" : "mr-4")}>
          <div className="relative z-10">
            <div className="relative rounded-full bg-blue-500 p-2 text-white">
              <svg
                className="absolute top-0 left-0 -rotate-90"
                height="40"
                width="40"
              >
                <circle
                  cx="20"
                  cy="20"
                  fill="none"
                  r="19"
                  stroke="white"
                  strokeWidth="2"
                />
                <circle
                  cx="20"
                  cy="20"
                  fill="none"
                  r="19"
                  stroke="url(#gradient)"
                  strokeDasharray="120 120"
                  strokeDashoffset={120 - edgeProgress * 120}
                  strokeWidth="2"
                />
                <defs>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="gradient"
                    x1="20"
                    x2="20"
                    y1="0"
                    y2="40"
                  >
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              <svg
                className="relative z-10 h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d={arrowPath}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

EdgeIndicator.displayName = "EdgeIndicator";
