import { z } from "zod";

export const eventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500),
  imageUrl: z.string().url("Invalid URL format"),
  timestamp: z.string().datetime({ offset: true }),
});

export const eventsResponseSchema = z.record(
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  z.array(eventSchema),
);

export const createEventSchema = eventSchema.omit({ id: true });
export const updateEventSchema = eventSchema.partial().required({ id: true });

export const patchEventDateSchema = z.object({
  timestamp: z.string().datetime({ offset: true }),
});
