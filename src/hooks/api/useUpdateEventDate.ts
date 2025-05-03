import { useMutation, useQueryClient } from "@tanstack/react-query";

import { sortEvents } from "@/helpers/api";
import { api } from "@/lib/axios";
import { eventsResponseSchema, patchEventDateSchema } from "@/lib/validations";
import type { Event, EventsByDate } from "@/models";

type UseUpdateEventDateOptions = {
  onError?: () => void;
};

export const useUpdateEventDate = ({
  onError,
}: UseUpdateEventDateOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      timestamp,
    }: {
      id: string;
      timestamp: string;
    }) => {
      const validatedData = patchEventDateSchema.parse({ timestamp });
      const { data } = await api.patch(`/api/events/${id}`, validatedData);
      return data;
    },
    onMutate: async ({ id, timestamp }) => {
      await queryClient.cancelQueries({ queryKey: ["events"] });

      const previousEvents = queryClient.getQueryData<EventsByDate>(["events"]);

      if (previousEvents) {
        const newEvents = { ...previousEvents };
        const newDate = new Date(timestamp).toISOString().split("T")[0];

        for (const date in newEvents) {
          const eventIndex = newEvents[date].findIndex(
            (event) => event.id === id,
          );

          if (eventIndex !== -1) {
            const [event] = newEvents[date].splice(eventIndex, 1);
            const oldDate = new Date(event.timestamp);
            const newDateTime = new Date(timestamp);

            const updatedTimestamp = new Date(
              newDateTime.getFullYear(),
              newDateTime.getMonth(),
              newDateTime.getDate(),
              oldDate.getHours(),
              oldDate.getMinutes(),
              oldDate.getSeconds(),
            ).toISOString();

            const updatedEvent: Event = {
              ...event,
              timestamp: updatedTimestamp,
            };

            if (!newEvents[newDate]) {
              newEvents[newDate] = [];
            }

            newEvents[newDate].push(updatedEvent);

            if (newEvents[date].length === 0) {
              delete newEvents[date];
            }

            newEvents[newDate] = sortEvents(newEvents[newDate]);

            break;
          }
        }

        queryClient.setQueryData<EventsByDate>(
          ["events"],
          eventsResponseSchema.parse(newEvents),
        );
      }

      return { previousEvents };
    },
    onError: (err, variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData<EventsByDate>(
          ["events"],
          context.previousEvents,
        );
      }

      onError?.();
    },
    onSuccess: (data) => {
      queryClient.setQueryData<EventsByDate>(["events"], (old) => {
        if (!old) return old;

        const newEvents = { ...old };
        const newDate = new Date(data.timestamp).toISOString().split("T")[0];

        // Find the old event to get its time
        let oldEvent: Event | undefined;

        for (const date in newEvents) {
          const eventIndex = newEvents[date].findIndex(
            (event) => event.id === data.id,
          );

          if (eventIndex !== -1) {
            oldEvent = newEvents[date][eventIndex];
            newEvents[date].splice(eventIndex, 1);

            if (newEvents[date].length === 0) {
              delete newEvents[date];
            }

            break;
          }
        }

        if (!oldEvent) return newEvents;

        const oldTime = new Date(oldEvent.timestamp);
        const newDateTime = new Date(data.timestamp);

        const updatedTimestamp = new Date(
          newDateTime.getFullYear(),
          newDateTime.getMonth(),
          newDateTime.getDate(),
          oldTime.getHours(),
          oldTime.getMinutes(),
          oldTime.getSeconds(),
        ).toISOString();

        if (!newEvents[newDate]) {
          newEvents[newDate] = [];
        }

        newEvents[newDate].push({
          ...data,
          timestamp: updatedTimestamp,
        });

        newEvents[newDate] = sortEvents(newEvents[newDate]);

        return eventsResponseSchema.parse(newEvents);
      });
    },
  });
};
