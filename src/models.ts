import { z } from "zod";

export const EventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().min(1),
  timestamp: z.string().datetime(),
  duration: z.number().int().positive(),
  location: z.string().min(1),
});

export type Event = z.infer<typeof EventSchema>;

export type EventsByDate = Record<string, Event[]>;
