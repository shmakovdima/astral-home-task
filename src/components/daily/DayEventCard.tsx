import { memo, useEffect, useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";

import { type Event } from "@/models";

import { EventCardContent } from "../shared/EventCardContent";

import { DayEventCardExpanded } from "./DayEventCardExpanded";

type Props = Event & {
  disabledAnimation?: boolean;
};

export const DayEventCard = memo(
  ({
    id,
    title,
    imageUrl,
    timestamp,
    description,
    location,
    duration,
    disabledAnimation = false,
  }: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isInitialRender, setIsInitialRender] = useState(true);
    const pointerStartTimeRef = useRef(0);
    const pointerStartPositionRef = useRef({ x: 0, y: 0 });

    const { attributes, listeners, setNodeRef } = useDraggable({
      id: `draggable-${id}`,
      data: { id },
    });

    const getLayoutId = (prefix: string) => {
      if (disabledAnimation && isInitialRender) return undefined;

      return `day-${prefix}-${id}`;
    };

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsInitialRender(false);
      }, 300);

      return () => clearTimeout(timer);
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

    const handlePointerDown = (e: React.PointerEvent) => {
      pointerStartTimeRef.current = Date.now();
      pointerStartPositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      const pointerUpTime = Date.now();
      const pointerDuration = pointerUpTime - pointerStartTimeRef.current;

      const dx = Math.abs(e.clientX - pointerStartPositionRef.current.x);
      const dy = Math.abs(e.clientY - pointerStartPositionRef.current.y);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (pointerDuration < 200 && distance < 5) {
        setIsExpanded(true);
      }
    };

    return (
      <div className="event-card relative">
        <div
          className="cursor-pointer rounded-lg bg-white shadow-sm hover:shadow-md"
          data-event-id={id}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          ref={setNodeRef}
          {...attributes}
          {...listeners}
        >
          <motion.div
            className="flex w-full flex-col"
            initial={false}
            layoutId={getLayoutId("card")}
            transition={
              isInitialRender
                ? { duration: 0, layout: { duration: 0 } }
                : undefined
            }
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

        <DayEventCardExpanded
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

DayEventCard.displayName = "DayEventCard";
