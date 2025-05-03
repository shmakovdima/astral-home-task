import { memo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { cnTwMerge } from "@/helpers/cnTwMerge";
import type { Event } from "@/models";

import { EventCardExpandedContent } from "../shared/EventCardExpandedContent";
import { EventTimeBadge } from "../shared/EventTimeBadge";

type Props = {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  getLayoutId: (id: string) => string | undefined;
} & Event;

export const WeekEventCardExpanded = memo(
  ({
    isExpanded,
    description,
    imageUrl,
    timestamp,
    title,
    duration,
    location,
    setIsExpanded,
    getLayoutId,
  }: Props) => (
    <AnimatePresence mode="wait">
      {isExpanded ? (
        <div className="event-card-expanded fixed inset-0 isolate z-[9999]">
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
              className="pointer-events-auto flex max-h-[90vh] w-[480px] flex-col overflow-hidden rounded-xl bg-white"
              layoutId={getLayoutId("card")}
            >
              <motion.div
                className="relative h-[240px] w-full"
                layoutId={getLayoutId("image-container")}
              >
                <Image
                  alt={description}
                  className="select-none"
                  draggable={false}
                  fill
                  priority
                  src={imageUrl}
                  style={{ objectFit: "cover" }}
                />
                <motion.div
                  className="absolute top-5 right-4 flex justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-2 py-1 align-middle"
                  layoutId={getLayoutId("time")}
                >
                  <EventTimeBadge timestamp={timestamp} />
                </motion.div>
                <motion.button
                  animate={{ opacity: 1 }}
                  className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 backdrop-blur-sm transition-colors duration-300 hover:bg-black/60 active:bg-black/20"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    className="h-5 w-5 text-white"
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
              <EventCardExpandedContent
                description={description}
                duration={duration}
                getLayoutId={getLayoutId}
                location={location}
                title={title}
              />
            </motion.div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  ),
);

WeekEventCardExpanded.displayName = "WeekEventCardExpanded";
