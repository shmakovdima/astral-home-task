import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { cnTwMerge } from "@/helpers/cnTwMerge";
import { type Event } from "@/models";

type WeekEventCardProps = Event & {
  onDragStart?: (height: number) => void;
  onDragEnd?: (daysToMove: number) => void;
  disableAnimation?: boolean;
  onExpandChange?: (isExpanded: boolean) => void;
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
    disableAnimation,
    onExpandChange,
  }: WeekEventCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const hasEndedRef = useRef(false);
    const scrollbarWidthRef = useRef(0);

    const getLayoutId = (prefix: string) => {
      if (disableAnimation) return undefined;
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

        // Сохраняем текущую ширину вьюпорта
        const vw = document.documentElement.clientWidth;

        // Фиксируем body в текущей позиции
        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        body.style.width = `${vw}px`;
        html.style.width = `${vw}px`;
      } else {
        const body = document.body;
        const html = document.documentElement;
        const scrollY = parseInt(body.style.top || "0");

        // Восстанавливаем состояние
        body.style.position = "";
        body.style.top = "";
        body.style.width = "";
        html.style.width = "";

        // Восстанавливаем позицию скролла
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

    useEffect(() => {
      onExpandChange?.(isExpanded);
    }, [isExpanded, onExpandChange]);

    const eventTime = useMemo(() => {
      const [hours, minutes] = timestamp.split("T")[1].split(":");
      const hoursNum = parseInt(hours, 10);
      const formattedHours = hoursNum % 12 || 12;
      return `${formattedHours}:${minutes} ${hoursNum >= 12 ? "PM" : "AM"}`;
    }, [timestamp]);

    const formattedDuration = useMemo(() => {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;

      if (hours === 0) {
        return `${minutes} min`;
      }

      if (minutes === 0) {
        return `${hours} ${hours === 1 ? "hour" : "hours"}`;
      }

      return `${hours} ${hours === 1 ? "hour" : "hours"} ${minutes} min`;
    }, [duration]);

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
      <div className="relative">
        <div
          className={`rounded-lg shadow-sm hover:shadow-md transition-all bg-white event-card ${
            isDragging ? "opacity-50 cursor-grabbing" : ""
          }`}
          data-event-id={id}
          onClick={() => !isDragging && setIsExpanded(true)}
          ref={dragRef}
        >
          <div className="absolute inset-0 flex flex-col w-full z-0">
            <div className="relative w-full h-32 rounded-t-lg overflow-hidden">
              <img
                alt={title}
                className="w-full h-full object-cover"
                src={imageUrl}
              />
              <div className="absolute flex justify-center align-middle top-3 right-3 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600">
                <span className="text-xs font-medium text-white">
                  {eventTime}
                </span>
              </div>
            </div>
            <div className="flex flex-col p-4">
              <div className="overflow-hidden">
                <h3 className="text-[18px] break-all leading-[22px] font-semibold line-clamp-1 text-gray-900 w-full text-ellipsis">
                  {title}
                </h3>
              </div>
              <div className="overflow-hidden">
                <p className="mt-2 text-[14px] leading-5 text-gray-600 line-clamp-2">
                  {description}
                </p>
              </div>
            </div>
          </div>

          <motion.div
            animate={{ opacity: 0 }}
            className="flex flex-col w-full relative z-10"
            layoutId={getLayoutId("card")}
          >
            <motion.div
              className="relative w-full h-32 rounded-t-lg overflow-hidden"
              layoutId={getLayoutId("image-container")}
            >
              <Image
                alt={title}
                fill
                priority
                src={imageUrl}
                style={{ objectFit: "cover" }}
              />
              <motion.div
                className="absolute flex justify-center align-middle top-3 right-3 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"
                layoutId={getLayoutId("time")}
              >
                <span className="text-xs font-medium text-white">
                  {eventTime}
                </span>
              </motion.div>
            </motion.div>
            <motion.div
              className="flex flex-col p-4"
              layoutId={getLayoutId("content")}
            >
              <motion.div
                className="overflow-hidden"
                layoutId={getLayoutId("title-container")}
              >
                <motion.h3
                  className="text-[18px] break-all leading-[22px] font-semibold line-clamp-1 text-gray-900 w-full text-ellipsis"
                  layoutId={getLayoutId("title")}
                >
                  {title}
                </motion.h3>
              </motion.div>
              <motion.div
                className="overflow-hidden"
                layoutId={getLayoutId("description-container")}
              >
                <motion.p
                  className="mt-2 text-[14px] leading-5 text-gray-600 line-clamp-2"
                  layoutId={getLayoutId("description")}
                >
                  {description}
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {isExpanded && !isDragging ? (
            <div className="fixed inset-0 z-[9999] isolate">
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
                className={cnTwMerge(
                  "fixed inset-0 flex items-center justify-center",
                  {
                    "pointer-events-none": isExpanded,
                  },
                )}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="flex flex-col w-[480px] max-h-[90vh] bg-white rounded-xl overflow-hidden pointer-events-auto"
                  layoutId={getLayoutId("card")}
                >
                  <motion.div
                    className="relative w-full h-[240px]"
                    layoutId={getLayoutId("image-container")}
                  >
                    <Image alt={title} fill priority src={imageUrl} />
                    <motion.div
                      className="absolute flex justify-center align-middle top-5 right-4 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"
                      layoutId={getLayoutId("time")}
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
                    className="flex flex-col p-4 overflow-y-auto"
                    layoutId={getLayoutId("content")}
                  >
                    <motion.div
                      className="overflow-hidden"
                      layoutId={getLayoutId("title-container")}
                    >
                      <motion.h3
                        className="text-[18px] leading-[22px] font-semibold text-gray-900"
                        layoutId={getLayoutId("title")}
                      >
                        {title}
                      </motion.h3>
                    </motion.div>
                    <motion.div
                      className="overflow-hidden"
                      layoutId={getLayoutId("description-container")}
                    >
                      <motion.p
                        className="mt-2 text-[14px] leading-5 text-gray-600"
                        layoutId={getLayoutId("description")}
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
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
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
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
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
