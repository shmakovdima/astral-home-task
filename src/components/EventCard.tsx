import { memo } from "react";
import Image from "next/image";

import { type Event } from "@/models";

export const EventCard = memo(
  ({ title, imageUrl, timestamp, description }: Event) => (
    <div className="rounded-lg shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col gap-4">
        <div className="relative w-full h-32 rounded-md overflow-hidden">
          <Image
            alt={title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 128px"
            src={imageUrl}
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium">{title}</h3>
            <time className="text-sm text-gray-500 whitespace-nowrap">
              {new Date(timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>
          <p className="text-sm mt-2 text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  ),
);
