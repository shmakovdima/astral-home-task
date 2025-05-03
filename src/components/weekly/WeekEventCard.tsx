import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import Image from "next/image";
import { motion } from "framer-motion";

import { cnTwMerge } from "@/helpers/cnTwMerge";
import { type Event } from "@/models";

import { EventCardContent } from "../shared/EventCardContent";
import { EventTimeBadge } from "../shared/EventTimeBadge";

import { WeekEventCardExpanded } from "./WeekEventCardExpanded";

type Props = Event & {
  onDragStart?: (height: number) => void;
  onDragEnd?: (daysToMove: number) => void;
};

type DropResult = {
  daysToMove: number;
};

const getScrollbarWidth = () => {
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  document.body.appendChild(outer);

  const inner = document.createElement("div");
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode?.removeChild(outer);

  return scrollbarWidth;
};

export const WeekEventCard = memo(
  ({
    id,
    title,
    imageUrl,
    timestamp,
    description,
    location,
    duration,
    onDragStart,
    onDragEnd,
  }: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const hasEndedRef = useRef(false);
    const scrollbarWidthRef = useRef(0);

    const getLayoutId = (prefix: string) => {
      if (isDragging) return undefined;

      return `weekday-${prefix}-${id}`;
    };

    useEffect(() => {
      scrollbarWidthRef.current = getScrollbarWidth();
    }, []);

    useEffect(() => {
      if (isExpanded) {
        const scrollY = window.scrollY;
        const html = document.documentElement;
        const body = document.body;

        const vw = document.documentElement.clientWidth;

        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        body.style.width = `${vw}px`;
        html.style.width = `${vw}px`;
      } else {
        const body = document.body;
        const html = document.documentElement;
        const scrollY = parseInt(body.style.top || "0");

        body.style.position = "";
        body.style.top = "";
        body.style.width = "";
        html.style.width = "";

        window.scrollTo(0, scrollY * -1);
      }

      return () => {
        const body = document.body;
        const html = document.documentElement;
        body.style.position = "";
        body.style.top = "";
        body.style.width = "";
        html.style.width = "";
      };
    }, [isExpanded]);

    const handleEscapeKey = useCallback((event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    }, []);

    useEffect(() => {
      if (isExpanded) {
        document.addEventListener("keydown", handleEscapeKey);

        return () => {
          document.removeEventListener("keydown", handleEscapeKey);
        };
      }
    }, [isExpanded, handleEscapeKey]);

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
      <div className="event-card relative" draggable={false}>
        <div
          className={cnTwMerge(
            "rounded-lg shadow-sm hover:shadow-md transition-all bg-white",
            {
              "opacity-50 cursor-grabbing": isDragging,
            },
          )}
          data-event-id={id}
          onClick={() => !isDragging && setIsExpanded(true)}
          onContextMenu={(e) => e.preventDefault()}
          onTouchStart={(e) => {
            if (isDragging) {
              e.preventDefault();
            }
          }}
          ref={dragRef}
        >
          <div className="absolute inset-0 z-0 flex w-full flex-col">
            <div className="relative h-32 w-full overflow-hidden rounded-t-lg">
              <Image
                alt={title}
                className="select-none"
                draggable={false}
                fill
                priority
                src={imageUrl}
                style={{ objectFit: "cover" }}
              />
              <div className="absolute top-3 right-3 flex justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-2 py-1 align-middle">
                <EventTimeBadge timestamp={timestamp} />
              </div>
            </div>
            <div className="flex flex-col overflow-auto p-4">
              <div className="overflow-hidden">
                <h3 className="line-clamp-1 w-full  text-[18px] leading-[22px] font-semibold break-all text-ellipsis text-gray-900 select-none">
                  {title}
                </h3>
              </div>
              <div className="overflow-hidden">
                <p className="mt-2 line-clamp-2  text-[14px] leading-5 text-gray-600 select-none">
                  {description}
                </p>
              </div>
            </div>
          </div>

          <motion.div
            animate={{ opacity: 0 }}
            className="relative z-10 flex w-full flex-col"
            initial={false}
            layoutId={getLayoutId("card")}
          >
            <EventCardContent
              description={description}
              duration={duration}
              getLayoutId={getLayoutId}
              id={id}
              imageUrl={imageUrl}
              location={location}
              timestamp={timestamp}
              title={title}
            />
          </motion.div>
        </div>

        <WeekEventCardExpanded
          description={description}
          duration={duration}
          getLayoutId={getLayoutId}
          id={id}
          imageUrl={imageUrl}
          isExpanded={isExpanded}
          location={location}
          setIsExpanded={setIsExpanded}
          timestamp={timestamp}
          title={title}
        />
      </div>
    );
  },
);

WeekEventCard.displayName = "WeekEventCard";
