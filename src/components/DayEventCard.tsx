import { memo, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useDraggable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";

import { formatDurationTime } from "@/helpers/dateUtils";
import { type Event } from "@/models";

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

    const getLayoutId = (prefix: string, id: string) => `day-${prefix}-${id}`;

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

    const eventTime = useMemo(() => {
      const [hours, minutes] = timestamp.split("T")[1].split(":");
      const hoursNum = parseInt(hours, 10);
      const formattedHours = hoursNum % 12 || 12;
      return `${formattedHours}:${minutes} ${hoursNum >= 12 ? "PM" : "AM"}`;
    }, [timestamp]);

    const formattedDuration = formatDurationTime(duration);

    console.log("isInitialRender", isInitialRender);

    return (
      <div className="relative">
        <div
          className="rounded-lg shadow-sm hover:shadow-md bg-white event-card select-none cursor-pointer"
          data-event-id={id}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          ref={setNodeRef}
          {...attributes}
          {...listeners}
        >
          <motion.div
            className="flex flex-col gap-4 w-full"
            initial={false}
            layoutId={
              disabledAnimation && isInitialRender
                ? undefined
                : getLayoutId("card", id)
            }
            transition={
              isInitialRender
                ? { duration: 0, layout: { duration: 0 } }
                : undefined
            }
          >
            <motion.div
              className="relative w-full h-32 rounded-t-lg overflow-hidden"
              initial={false}
              layoutId={
                disabledAnimation && isInitialRender
                  ? undefined
                  : getLayoutId("image-container", id)
              }
            >
              <img
                alt={title}
                className="select-none w-full h-full object-cover"
                draggable={false}
                src={imageUrl}
              />
              <motion.div
                className="absolute flex justify-center align-middle top-3 right-3 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"
                initial={false}
                layoutId={
                  disabledAnimation && isInitialRender
                    ? undefined
                    : getLayoutId("time", id)
                }
              >
                <span className="text-xs font-medium text-white">
                  {eventTime}
                </span>
              </motion.div>
            </motion.div>
            <motion.div
              className="flex flex-col p-4"
              initial={false}
              layoutId={
                disabledAnimation && isInitialRender
                  ? undefined
                  : getLayoutId("content", id)
              }
            >
              <motion.div
                className="overflow-hidden"
                initial={false}
                layoutId={
                  disabledAnimation && isInitialRender
                    ? undefined
                    : getLayoutId("title-container", id)
                }
              >
                <motion.h3
                  className="text-[18px] leading-[22px] font-semibold text-gray-900 w-full line-clamp-1 text-ellipsis select-none"
                  initial={false}
                  layoutId={
                    disabledAnimation && isInitialRender
                      ? undefined
                      : getLayoutId("title", id)
                  }
                >
                  {title}
                </motion.h3>
              </motion.div>
              <motion.div
                className="overflow-hidden"
                initial={false}
                layoutId={
                  disabledAnimation && isInitialRender
                    ? undefined
                    : getLayoutId("description-container", id)
                }
              >
                <motion.p
                  className="mt-2 text-[14px] leading-5 text-gray-600 line-clamp-2 select-none"
                  initial={false}
                  layoutId={
                    disabledAnimation && isInitialRender
                      ? undefined
                      : getLayoutId("description", id)
                  }
                >
                  {description}
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {isExpanded ? (
            <div className="fixed inset-0 z-[9999] isolate disable-swipe">
              <motion.div
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/40"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                onClick={() => setIsExpanded(false)}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                animate={{ opacity: 1 }}
                className="fixed inset-0 flex items-center justify-center"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="flex flex-col w-full h-full bg-white select-none"
                  layoutId={getLayoutId("card", id)}
                >
                  <motion.div
                    className="relative w-full h-[30dvh]"
                    layoutId={getLayoutId("image-container", id)}
                  >
                    <Image
                      alt={title}
                      draggable={false}
                      fill
                      priority
                      src={imageUrl}
                      style={{ objectFit: "cover", userSelect: "none" }}
                    />
                    <motion.div
                      className="absolute flex justify-center align-middle top-5 right-4 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"
                      layoutId={getLayoutId("time", id)}
                    >
                      <span className="text-xs font-medium text-white">
                        {eventTime}
                      </span>
                    </motion.div>
                    <motion.button
                      animate={{ opacity: 1 }}
                      className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center hover:bg-black transition-colors"
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(false);
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M6 18L18 6M6 6l12 12"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </motion.button>
                  </motion.div>
                  <motion.div
                    className="flex flex-col p-4"
                    layoutId={getLayoutId("content", id)}
                  >
                    <motion.div
                      className="overflow-hidden"
                      layoutId={getLayoutId("title-container", id)}
                    >
                      <motion.h3
                        className="text-[18px] leading-[22px] font-semibold text-gray-900 select-none"
                        layoutId={getLayoutId("title", id)}
                      >
                        {title}
                      </motion.h3>
                    </motion.div>
                    <motion.div
                      className="overflow-hidden"
                      layoutId={getLayoutId("description-container", id)}
                    >
                      <motion.p
                        className="mt-2 text-[14px] leading-5 text-gray-600 select-none"
                        layoutId={getLayoutId("description", id)}
                      >
                        {description}
                      </motion.p>
                    </motion.div>
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex flex-col gap-2"
                      exit={{ opacity: 0, y: 10 }}
                      initial={{ opacity: 0, y: 10 }}
                      transition={{ delay: 0.2, duration: 0.2 }}
                    >
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg
                          className="w-4 h-4 [stroke:url(#gradient-active)]"
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
                        <span className="text-sm select-none">
                          {formattedDuration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg
                          className="w-4 h-4 [stroke:url(#gradient-active)]"
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
                        <span className="text-sm select-none">{location}</span>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  },
);

DayEventCard.displayName = "DayEventCard";
