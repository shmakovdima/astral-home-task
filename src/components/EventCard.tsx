import { memo } from "react";
import Image from "next/image";
import { format, parseISO } from "date-fns";

import { type Event } from "@/models";

export const EventCard = memo(
  ({ title, imageUrl, timestamp, description }: Event) => (
    <div className="rounded-lg shadow-sm hover:shadow-md transition-all bg-white event-card">
      <div className="flex flex-col gap-4">
        <div className="relative w-full h-32 rounded-md overflow-hidden">
          <Image
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 128px"
            src={imageUrl}
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg text-gray-700 font-bold">{title}</h3>
            <time className="text-sm text-gray-500 whitespace-nowrap">
              {format(parseISO(timestamp), "hh:mm a")}
            </time>
          </div>
          <p className="text-sm mt-2 text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  ),
);
