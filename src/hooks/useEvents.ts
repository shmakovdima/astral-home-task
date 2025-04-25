import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import { eventsResponseSchema } from "@/lib/validations";
import { type EventsByDate } from "@/models";

export const useAllEvents = () =>
  useQuery({
    queryKey: ["events"],
    queryFn: async (): Promise<EventsByDate> => {
      console.log("Fetching events...");
      const response = await api.get("/api/events");
      console.log("API response:", response);

      try {
        const parsedData = eventsResponseSchema.parse(response.data);
        console.log("Parsed data:", parsedData);
        return parsedData;
      } catch (error) {
        console.error("Validation error:", error);
        throw error;
      }
    },
  });
