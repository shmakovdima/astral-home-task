import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { api } from "@/lib/axios";
import { type Event } from "@/types/event";

export const useEvent = ({ id }: { id: string }) =>
  useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      try {
        const { data } = await api.get<Event>(`/api/events/${id}`);
        return data;
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          throw new Error("NOT_FOUND");
        }

        throw error;
      }
    },
    retry: false,
  });
