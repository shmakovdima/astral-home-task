import { memo, useMemo, useState } from "react";
import Image from "next/image";

import { type Event } from "@/models";

type WeekEventCardProps = Event;

export const WeekEventCard = memo(
  ({
    // id,
    title,
    imageUrl,
    timestamp,
    description,
    // location,
    // duration,
  }: WeekEventCardProps) => {
    const [isLoading, setIsLoading] = useState(true);

    const eventTime = useMemo(() => {
      const [hours, minutes] = timestamp.split("T")[1].split(":");
      const hoursNum = parseInt(hours, 10);
      const formattedHours = hoursNum % 12 || 12;
      return `${formattedHours}:${minutes} ${hoursNum >= 12 ? "PM" : "AM"}`;
    }, [timestamp]);

    return (
      <div
        className="rounded-lg shadow-sm hover:shadow-md transition-all bg-white event-card"
        onTouchEnd={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-4 w-full">
          <div className="relative w-full h-32 rounded-md overflow-hidden">
            <div
              className={`absolute inset-0 bg-gray-200 animate-pulse ${
                isLoading ? "block" : "hidden"
              }`}
            />
            <Image
              alt={title}
              className={`object-cover transition-opacity duration-300 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              fill
              onLoad={() => setIsLoading(false)}
              priority
              src={imageUrl}
            />
            <div className="absolute flex justify-center align-middle top-3 right-3 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600">
              <span className="text-xs font-medium text-white">
                {eventTime}
              </span>
            </div>
          </div>
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </div>
    );
  },
);
