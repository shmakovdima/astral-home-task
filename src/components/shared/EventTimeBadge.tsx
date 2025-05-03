import { memo } from "react";

import { getEventTime } from "@/helpers/dateUtils";
import { type Event } from "@/models";

export const EventTimeBadge = memo(
  ({ timestamp }: Pick<Event, "timestamp">) => {
    const eventTime = getEventTime(timestamp);

    return (
      <span className="text-xs font-medium text-white select-none">
        {eventTime}
      </span>
    );
  },
);

EventTimeBadge.displayName = "EventTimeBadge";
