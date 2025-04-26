import { useQuery } from "@tanstack/react-query";
import { getHours, getMinutes, getSeconds, parseISO } from "date-fns";

import { api } from "@/lib/axios";
import { eventsResponseSchema } from "@/lib/validations";
import { type Event, type EventsByDate } from "@/models";

const sortEvents = (events: Event[]): Event[] =>
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

export const useAllEvents = () =>
  useQuery({
    queryKey: ["events"],
    queryFn: async (): Promise<EventsByDate> => {
      const response = await api.get("/api/events");

      try {
        const parsedData = eventsResponseSchema.parse(response.data);

        const sortedData: EventsByDate = Object.fromEntries(
          Object.entries(parsedData).map(([date, events]) => [
            date,
            sortEvents(events),
          ]),
        );

        return sortedData;
      } catch (error) {
        console.error("Validation error:", error);
        throw error;
      }
    },
  });
