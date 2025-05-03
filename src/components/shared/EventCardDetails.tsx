import { memo } from "react";

import { formatDurationTime } from "@/helpers/dateUtils";
import type { Event } from "@/models";

export const EventCardDetails = memo(
  ({ duration, location }: Pick<Event, "duration" | "location">) => {
    const formattedDuration = formatDurationTime(duration);

    return (
      <>
        <div className="flex items-center gap-2 text-gray-600">
          <svg
            className="h-4 w-4 [stroke:url(#gradient-active)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <defs>
              <linearGradient
                id="gradient-active"
                x1="0%"
                x2="100%"
                y1="0%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
            <path
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <span className="text-sm">{formattedDuration}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <svg
            className="h-4 w-4 [stroke:url(#gradient-active)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <defs>
              <linearGradient
                id="gradient-active"
                x1="0%"
                x2="100%"
                y1="0%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
            <path
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
            <path
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <span className="text-sm">{location}</span>
        </div>
      </>
    );
  },
);

EventCardDetails.displayName = "EventCardDetails";
