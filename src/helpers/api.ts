import { getHours, getMinutes, getSeconds, parseISO } from "date-fns";

import { type Event } from "@/models";

export const sortEvents = (events: Event[]): Event[] =>
  [...events].sort((a, b) => {
    const dateA = parseISO(a.timestamp);
    const dateB = parseISO(b.timestamp);

    const timeA =
      getHours(dateA) * 3600 + getMinutes(dateA) * 60 + getSeconds(dateA);

    const timeB =
      getHours(dateB) * 3600 + getMinutes(dateB) * 60 + getSeconds(dateB);

    if (timeA !== timeB) {
      return timeA - timeB;
    }

    return a.title.localeCompare(b.title);
  });
