import { useQuery } from "@tanstack/react-query";

import { sortEvents } from "@/helpers/api";
import { api } from "@/lib/axios";
import { eventsResponseSchema } from "@/lib/validations";
import { type EventsByDate } from "@/models";

export const useAllEvents = () =>
  useQuery({
    queryKey: ["events"],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<EventsByDate> => {
      const response = await api.get("/api/events");

      try {
        const parsedData = eventsResponseSchema.parse(response.data);

        const sortedData = Object.fromEntries(
          Object.entries(parsedData).map(([date, events]) => [
            date,
            sortEvents(events),
          ]),
        ) satisfies EventsByDate;

        return sortedData;
      } catch (error) {
        console.error("Validation error:", error);
        throw error;
      }
    },
  });
