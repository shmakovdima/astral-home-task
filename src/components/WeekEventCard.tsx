import { memo, useMemo, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import Image from "next/image";

import { type Event } from "@/models";

type WeekEventCardProps = Event & {
  onDragStart?: (height: number) => void;
  onDragEnd?: (daysToMove: number) => void;
};

type DropResult = {
  daysToMove: number;
};

export const WeekEventCard = memo(
  ({
    id,
    title,
    imageUrl,
    timestamp,
    description,
    onDragStart,
    onDragEnd,
  }: WeekEventCardProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const cardRef = useRef<HTMLDivElement>(null);
    const hasEndedRef = useRef(false);

    const eventTime = useMemo(() => {
      const [hours, minutes] = timestamp.split("T")[1].split(":");
      const hoursNum = parseInt(hours, 10);
      const formattedHours = hoursNum % 12 || 12;
      return `${formattedHours}:${minutes} ${hoursNum >= 12 ? "PM" : "AM"}`;
    }, [timestamp]);

    const [{ isDragging }, drag] = useDrag(
      () => ({
        type: "event",
        item: () => {
          hasEndedRef.current = false;

          if (cardRef.current && onDragStart) {
            const height = cardRef.current.offsetHeight;
            onDragStart(height);
          }

          return { id };
        },
        collect: (monitor) => ({
          isDragging: !!monitor.isDragging(),
        }),
        end: (_, monitor) => {
          if (hasEndedRef.current) {
            return;
          }

          const dropResult = monitor.getDropResult<DropResult>();

          if (dropResult && onDragEnd) {
            hasEndedRef.current = true;
            onDragEnd(dropResult.daysToMove);

            setTimeout(() => {
              hasEndedRef.current = false;
            }, 100);
          }
        },
      }),
      [id, onDragStart, onDragEnd],
    );

    const dragRef = (el: HTMLDivElement) => {
      cardRef.current = el;
      drag(el);
    };

    return (
      <div
        className={`rounded-lg shadow-sm hover:shadow-md transition-all bg-white event-card ${
          isDragging ? "opacity-50 cursor-grabbing" : ""
        }`}
        data-event-id={id}
        ref={dragRef}
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
              className={`transition-opacity duration-300 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              fill
              onLoad={() => setIsLoading(false)}
              priority
              src={imageUrl}
              style={{ objectFit: "cover" }}
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
