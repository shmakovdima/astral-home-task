import { memo } from "react";

type Props = {
  isVisible: boolean;
  edgeProgress: number;
  position: "left" | "right";
};

export const DailyEdgeIndicator = memo(
  ({ isVisible, edgeProgress, position }: Props) => {
    if (!isVisible) return null;

    const isLeft = position === "left";
    const gradientDirection = isLeft ? "to-r" : "to-l";

    const arrowPath = isLeft
      ? "M19 12H5m7 7l-7-7 7-7"
      : "M5 12h14m-7-7l7 7-7 7";

    return (
      <div
        className={`fixed ${isLeft ? "left-0" : "right-0"} min-h-[calc(100dvh_-_160px)] top-0 w-[100px] bg-gradient-${gradientDirection} h-screen from-blue-500/40 to-transparent z-[100] flex items-start pt-[195px] ${isLeft ? "justify-start" : "justify-end"}`}
      >
        <div className={`${isLeft ? "ml-4" : "mr-4"} relative`}>
          <div className="relative z-10">
            <div className="bg-blue-500 rounded-full p-2 text-white relative">
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
                className="w-6 h-6 relative z-10"
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

DailyEdgeIndicator.displayName = "DailyEdgeIndicator";
