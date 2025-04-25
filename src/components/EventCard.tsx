import { memo, useMemo, useState } from "react";
import { useDrag } from "react-dnd";
import Image from "next/image";
import { format, parseISO } from "date-fns";

import { type Event } from "@/models";

type EventCardProps = Event & {
  onDayChange: (daysToMove: number) => void;
};

export const EventCard = memo(
  ({ id, title, imageUrl, timestamp, description, onDayChange }: EventCardProps) => {
    const [isLoading, setIsLoading] = useState(true);

    const eventTime = useMemo(() => {
      const date = parseISO(timestamp);
      return format(date, "hh:mm a");
    }, [timestamp]);

    const [{ isDragging }, drag] = useDrag(() => ({
      type: "event",
      item: { id },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult();
        if (dropResult) {
          onDayChange(dropResult.daysToMove);
        }
      },
    }));

    return (
      <div
        ref={drag}
        className={`rounded-lg shadow-sm hover:shadow-md transition-all bg-white event-card cursor-move ${
          isDragging ? "opacity-50" : ""
        }`}
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
              onLoadingComplete={() => setIsLoading(false)}
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
              <h3 className="text-lg text-gray-700 font-bold">{title}</h3>
            </div>
            <p className="mt-2 text-gray-500">{description}</p>
          </div>
        </div>
      </div>
    );
  },
);
