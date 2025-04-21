import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import { type Event, type EventsByDate } from "@/models";

export const useAllEvents = () =>
  useQuery({
    queryKey: ["events"],
    queryFn: async (): Promise<EventsByDate> => {
      const { data } = await api.get("/api/events");
      return data;
    },
  });

export const useEvent = (id: string) =>
  useQuery({
    queryKey: ["event", id],
    queryFn: async (): Promise<Event> => {
      const { data } = await api.get(`/api/event/${id}`);
      return data;
    },
    enabled: !!id,
  });
