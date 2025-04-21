import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import { type EventsByDate } from "@/models";

export const useAllEvents = () =>
  useQuery({
    queryKey: ["events"],
    queryFn: async (): Promise<EventsByDate> => {
      const { data } = await api.get("/api/events");
      return data;
    },
  });
