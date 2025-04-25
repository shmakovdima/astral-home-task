import { memo, useMemo, useState } from "react";
import { useDrag } from "react-dnd";
import Image from "next/image";

import { type Event } from "@/models";

type EventCardProps = Event & {
  onDragStart?: () => void;
  onDragEnd: (daysToMove: number) => void;
};

type DropResult = {
  daysToMove: number;
};

export const EventCard = memo(
  ({
    id,
    title,
    imageUrl,
    timestamp,
    description,
    onDragStart,
    onDragEnd,
  }: EventCardProps) => {
    const [isLoading, setIsLoading] = useState(true);

    const eventTime = useMemo(() => {
      const time = timestamp.split("T")[1].split(":")[0];
      const hours = parseInt(time, 10);
      return `${hours}:00 ${hours >= 12 ? "PM" : "AM"}`;
    }, [timestamp]);

    const [{ isDragging }, drag] = useDrag(() => ({
      type: "event",
      item: () => {
        onDragStart?.();
        return { id };
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult<DropResult>();
        if (dropResult) {
          onDragEnd(dropResult.daysToMove);
        }
      },
    }));

    return (
      <div
        className={`rounded-lg shadow-sm hover:shadow-md transition-all bg-white event-card cursor-grab ${
          isDragging ? "opacity-50 cursor-grabbing" : ""
        }`}
        onTouchEnd={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        ref={drag as unknown as React.RefObject<HTMLDivElement>}
      >
        <div className="flex flex-col gap-4">
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
              sizes="(max-width: 768px) 100vw, 128px"
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
