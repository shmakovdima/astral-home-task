import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import { eventsResponseSchema } from "@/lib/validations";
import { type Event, type EventsByDate } from "@/models";

const sortEvents = (events: Event[]): Event[] =>
  [...events].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();

    if (timeA !== timeB) {
      return timeA - timeB;
    }

    return a.title.localeCompare(b.title);
  });

export const useAllEvents = () =>
  useQuery({
    queryKey: ["events"],
    queryFn: async (): Promise<EventsByDate> => {
      console.log("Fetching events...");
      const response = await api.get("/api/events");
      console.log("API response:", response);

      try {
        const parsedData = eventsResponseSchema.parse(response.data);

        const sortedData: EventsByDate = Object.fromEntries(
          Object.entries(parsedData).map(([date, events]) => [
            date,
            sortEvents(events),
          ]),
        );

        console.log("Sorted data:", sortedData);
        return sortedData;
      } catch (error) {
        console.error("Validation error:", error);
        throw error;
      }
    },
  });
