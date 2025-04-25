import { useQuery } from "@tanstack/react-query";
import { getTime, parseISO } from "date-fns";

import { api } from "@/lib/axios";
import { eventsResponseSchema } from "@/lib/validations";
import { type Event, type EventsByDate } from "@/models";

const sortEvents = (events: Event[]): Event[] =>
  [...events].sort((a, b) => {
    const timeA = getTime(parseISO(a.timestamp));
    const timeB = getTime(parseISO(b.timestamp));

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
