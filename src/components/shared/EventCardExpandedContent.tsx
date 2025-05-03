import { memo } from "react";
import { motion } from "framer-motion";

import { type Event } from "@/models";

import { EventCardDetails } from "./EventCardDetails";

type Props = {
  getLayoutId: (id: string) => string | undefined;
} & Pick<Event, "title" | "description" | "duration" | "location">;

export const EventCardExpandedContent = memo(
  ({ getLayoutId, title, description, duration, location }: Props) => (
    <motion.div
      className="flex flex-col overflow-y-auto p-4"
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
        <EventCardDetails duration={duration} location={location} />
      </motion.div>
    </motion.div>
  ),
);

EventCardExpandedContent.displayName = "EventCardExpandedContent";
