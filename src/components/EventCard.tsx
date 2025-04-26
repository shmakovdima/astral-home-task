import { memo, useMemo, useRef, useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { type Event } from "@/models";

type EventCardProps = Event & {
  onDragStart?: (height: number) => void;
  onDragEnd?: (daysToMove: number) => void;
  disableAnimation?: boolean;
  onExpandChange?: (isExpanded: boolean) => void;
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
    location,
    duration,
    onDragStart,
    onDragEnd,
    disableAnimation,
    onExpandChange,
  }: EventCardProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const hasEndedRef = useRef(false);

    useEffect(() => {
      if (isExpanded) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [isExpanded]);

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
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      }
      
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} min`;
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
      <>
        <div className="relative">
          <div
            className={`rounded-lg shadow-sm hover:shadow-md transition-all bg-white event-card ${
              isDragging ? "opacity-50 cursor-grabbing" : ""
            }`}
            data-event-id={id}
            ref={dragRef}
            onClick={() => !isDragging && setIsExpanded(true)}
          >
            <motion.div 
              className="flex flex-col gap-4 w-full" 
              layoutId={disableAnimation ? undefined : isDragging ? undefined : `card-${id}`}
            >
              <motion.div 
                className="relative w-full h-32 rounded-t-lg overflow-hidden"
                layoutId={disableAnimation ? undefined : isDragging ? undefined : `image-container-${id}`}
              >
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
                <motion.div 
                  className="absolute flex justify-center align-middle top-3 right-3 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"
                  layoutId={disableAnimation ? undefined : isDragging ? undefined : `time-${id}`}
                >
                  <span className="text-xs font-medium text-white">
                    {eventTime}
                  </span>
                </motion.div>
              </motion.div>
              <motion.div 
                className="flex flex-col p-4" 
                layoutId={disableAnimation ? undefined : isDragging ? undefined : `content-${id}`}
              >
                <motion.div
                  className="overflow-hidden"
                  layoutId={disableAnimation ? undefined : isDragging ? undefined : `title-container-${id}`}
                >
                  <motion.h3 
                    className="text-[18px] leading-[22px] font-semibold text-gray-900 w-full whitespace-nowrap text-ellipsis"
                    layoutId={disableAnimation ? undefined : isDragging ? undefined : `title-${id}`}
                  >
                    {title}
                  </motion.h3>
                </motion.div>
                <motion.div
                  className="overflow-hidden"
                  layoutId={disableAnimation ? undefined : isDragging ? undefined : `description-container-${id}`}
                >
                  <motion.p 
                    className="mt-2 text-[14px] leading-5 text-gray-600 line-clamp-2"
                    layoutId={disableAnimation ? undefined : isDragging ? undefined : `description-${id}`}
                  >
                    {description}
                  </motion.p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {isExpanded && !isDragging && (
              <div className="fixed inset-0 z-[9999] isolate">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 bg-black/40"
                  onClick={() => setIsExpanded(false)}
                />
                <motion.div
                  className="fixed inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="flex flex-col w-full h-full bg-white" 
                    layoutId={disableAnimation ? undefined : isDragging ? undefined : `card-${id}`}
                  >
                    <motion.div 
                      className="relative w-full h-[30vh]"
                      layoutId={disableAnimation ? undefined : isDragging ? undefined : `image-container-${id}`}
                    >
                      <Image
                        alt={title}
                        fill
                        priority
                        src={imageUrl}
                        style={{ objectFit: "cover" }}
                      />
                      <motion.div 
                        className="absolute flex justify-center align-middle top-5 right-4 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"
                        layoutId={disableAnimation ? undefined : isDragging ? undefined : `time-${id}`}
                      >
                        <span className="text-xs font-medium text-white">
                          {eventTime}
                        </span>
                      </motion.div>
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center hover:bg-black transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsExpanded(false);
                        }}
                      >
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </motion.div>
                    <motion.div 
                      className="flex flex-col p-4" 
                      layoutId={disableAnimation ? undefined : isDragging ? undefined : `content-${id}`}
                    >
                      <motion.div
                        className="overflow-hidden"
                        layoutId={disableAnimation ? undefined : isDragging ? undefined : `title-container-${id}`}
                      >
                        <motion.h3 
                          className="text-[18px] leading-[22px] font-semibold text-gray-900"
                          layoutId={disableAnimation ? undefined : isDragging ? undefined : `title-${id}`}
                        >
                          {title}
                        </motion.h3>
                      </motion.div>
                      <motion.div
                        className="overflow-hidden"
                        layoutId={disableAnimation ? undefined : isDragging ? undefined : `description-container-${id}`}
                      >
                        <motion.p 
                          className="mt-2 text-[14px] leading-5 text-gray-600"
                          layoutId={disableAnimation ? undefined : isDragging ? undefined : `description-${id}`}
                        >
                          {description}
                        </motion.p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: 0.2, duration: 0.2 }}
                        className="mt-4 flex flex-col gap-2"
                      >
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">{formattedDuration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm">{location}</span>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </>
    );
  },
);
