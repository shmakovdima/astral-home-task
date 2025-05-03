import { memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { type Event } from "@/models";

import { EventTimeBadge } from "./EventTimeBadge";

type Props = {
  getLayoutId: (id: string) => string | undefined;
} & Event;

export const EventCardContent = memo(
  ({ getLayoutId, title, timestamp, imageUrl, description }: Props) => (
    <>
      <motion.div
        className="relative h-32 w-full overflow-hidden rounded-t-lg"
        initial={false}
        layoutId={getLayoutId("image-container")}
      >
        <Image
          alt={title}
          className="select-none"
          draggable={false}
          fill
          priority
          src={imageUrl}
          style={{ objectFit: "cover" }}
        />
        <motion.div
          className="absolute top-3 right-3 flex justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-2 py-1 align-middle"
          initial={false}
          layoutId={getLayoutId("time")}
        >
          <EventTimeBadge timestamp={timestamp} />
        </motion.div>
      </motion.div>
      <motion.div
        className="flex flex-col overflow-auto p-4"
        initial={false}
        layoutId={getLayoutId("content")}
      >
        <motion.div
          className="overflow-hidden"
          initial={false}
          layoutId={getLayoutId("title-container")}
        >
          <motion.h3
            className="line-clamp-1 w-full text-[18px] leading-[22px] font-semibold text-ellipsis text-gray-900 select-none"
            initial={false}
            layoutId={getLayoutId("title")}
          >
            {title}
          </motion.h3>
        </motion.div>
        <motion.div
          className="overflow-hidden"
          initial={false}
          layoutId={getLayoutId("description-container")}
        >
          <motion.p
            className="mt-2 line-clamp-2 text-[14px] leading-5 text-gray-600 select-none"
            initial={false}
            layoutId={getLayoutId("description")}
          >
            {description}
          </motion.p>
        </motion.div>
      </motion.div>
    </>
  ),
);

EventCardContent.displayName = "EventCardContent";
