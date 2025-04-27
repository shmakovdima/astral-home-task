import { memo, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useDraggable } from "@dnd-kit/core";

import { type Event } from "@/models";

const EDGE_THRESHOLD = 0.2; // 20% of screen width
const HOLD_DURATION = 1500; // 1.5 seconds

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

const getLayoutId = (prefix: string, id: string) => {
  return `day-${prefix}-${id}`;
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
    onDayChange,
  }: Event & { onDayChange?: (direction: 'prev' | 'next') => void }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const dragStartTimeRef = useRef(Date.now());
    const wasDragged = useRef(false);
    const edgeTimeoutRef = useRef<number | null>(null);
    const lastDirectionRef = useRef<'prev' | 'next' | null>(null);
    const pointerStartTimeRef = useRef(0);
    const pointerStartPositionRef = useRef({ x: 0, y: 0 });

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useDraggable({
      id: `draggable-${id}`,
      data: { id },
    });

    useEffect(() => {
      const handleDragMove = () => {
        if (!transform?.x || !onDayChange) return;

        const screenWidth = window.innerWidth;
        const threshold = screenWidth * EDGE_THRESHOLD;
        let newDirection: 'prev' | 'next' | null = null;

        if (transform.x > threshold) {
          newDirection = 'prev';
        } else if (transform.x < -threshold) {
          newDirection = 'next';
        }

        // Clear timeout if direction changed or we're not at an edge
        if (newDirection !== lastDirectionRef.current || !newDirection) {
          if (edgeTimeoutRef.current) {
            clearTimeout(edgeTimeoutRef.current);
            edgeTimeoutRef.current = null;
          }
        }

        // Start new timeout only if we're at an edge and don't have an active timeout
        if (newDirection && !edgeTimeoutRef.current) {
          edgeTimeoutRef.current = window.setTimeout(() => {
            onDayChange(newDirection);
          }, HOLD_DURATION);
        }

        lastDirectionRef.current = newDirection;
      };

      handleDragMove();

      return () => {
        if (edgeTimeoutRef.current) {
          clearTimeout(edgeTimeoutRef.current);
          edgeTimeoutRef.current = null;
        }
      };
    }, [transform?.x, onDayChange]);

    // Reset everything when dragging stops
    useEffect(() => {
      if (!isDragging) {
        if (edgeTimeoutRef.current) {
          clearTimeout(edgeTimeoutRef.current);
          edgeTimeoutRef.current = null;
        }
        lastDirectionRef.current = null;
        setTimeout(() => {
          wasDragged.current = false;
        }, 0);
      } else {
        wasDragged.current = true;
      }
    }, [isDragging]);

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

      console.log('Duration:', pointerDuration, 'Distance:', distance);

      if (pointerDuration < 200 && distance < 5) {
        setIsExpanded(true);
      }
    };

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

    return (
      <div className="relative">
        <div
          ref={setNodeRef}
          className={`rounded-lg shadow-sm hover:shadow-md transition-all bg-white event-card select-none cursor-pointer ${isDragging ? 'opacity-50' : ''}`}
          data-event-id={id}
          style={{
            transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
            transition: !isDragging ? 'transform 0.3s ease-out' : undefined,
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          {...attributes}
          {...listeners}
        >
          <motion.div
            className="flex flex-col gap-4 w-full"
            layoutId={getLayoutId("card", id)}
          >
            <motion.div
              className="relative w-full h-32 rounded-t-lg overflow-hidden"
              layoutId={getLayoutId("image-container", id)}
            >
              <Image
                alt={title}
                className={`transition-opacity duration-300 ${
                  isLoading ? "opacity-0" : "opacity-100"
                } select-none`}
                draggable={false}
                fill
                onLoad={() => setIsLoading(false)}
                priority
                src={imageUrl}
                style={{ objectFit: "cover", userSelect: "none" }}
              />
              <motion.div
                className="absolute flex justify-center align-middle top-3 right-3 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"
                layoutId={getLayoutId("time", id)}
              >
                <span className="text-xs font-medium text-white">
                  {eventTime}
                </span>
              </motion.div>
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
                  className="text-[18px] leading-[22px] font-semibold text-gray-900 w-full whitespace-nowrap text-ellipsis select-none"
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
                  className="mt-2 text-[14px] leading-5 text-gray-600 line-clamp-2 select-none"
                  layoutId={getLayoutId("description", id)}
                >
                  {description}
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {isExpanded ? (
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
                    className="relative w-full h-[30vh]"
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
                        <span className="text-sm select-none">
                          {formattedDuration}
                        </span>
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
