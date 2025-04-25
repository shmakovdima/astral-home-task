import { memo, useMemo, useState } from "react";
import { useDrag } from "react-dnd";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";

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
    location,
    duration,
    onDragStart,
    onDragEnd,
  }: EventCardProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();

    const eventTime = useMemo(() => {
      const [hours, minutes] = timestamp.split("T")[1].split(":");
      const hoursNum = parseInt(hours, 10);
      const formattedHours = hoursNum % 12 || 12;
      return `${formattedHours}:${minutes} ${hoursNum >= 12 ? "PM" : "AM"}`;
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
      end: (_, monitor) => {
        const dropResult = monitor.getDropResult<DropResult>();
        if (dropResult) {
          onDragEnd(dropResult.daysToMove);
        }
      },
    }));

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded(true);
      document.body.style.overflow = "hidden";
    };

    const handleClose = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded(false);
      document.body.style.overflow = "auto";
    };

    return (
      <>
        <motion.div
          layoutId={`event-card-${id}`}
          className={`rounded-lg shadow-sm hover:shadow-md transition-all bg-white event-card ${
            isDragging ? "opacity-50 cursor-grabbing" : ""
          }`}
          onTouchEnd={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={handleClick}
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
        </motion.div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={handleClose}
            >
              <motion.div
                layoutId={`event-card-${id}`}
                className="fixed inset-0 bg-white overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                initial={{ borderRadius: "0.5rem", scale: 0.9, y: 0 }}
                animate={{ borderRadius: "0", scale: 1, y: 0 }}
                exit={{ borderRadius: "0.5rem", scale: 0.9, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative h-screen">
                  <motion.div
                    className="relative h-1/2 w-full"
                    initial={{ scale: 1, y: 0 }}
                    animate={{ scale: 1.1, y: -20 }}
                    exit={{ scale: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      initial={{ y: 0 }}
                      animate={{ y: -20 }}
                      exit={{ y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Image
                        alt={title}
                        className="object-cover"
                        fill
                        priority
                        src={imageUrl}
                        style={{ display: isLoading ? "none" : "block" }}
                      />
                    </motion.div>
                    <motion.button
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                      onClick={handleClose}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <svg
                        className="w-6 h-6 text-gray-800"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </motion.button>
                  </motion.div>
                  <motion.div
                    className="p-6"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600">
                        <span className="text-sm font-medium text-white">
                          {eventTime}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {duration} minutes
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      {title}
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">{description}</p>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{location}</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  },
);
