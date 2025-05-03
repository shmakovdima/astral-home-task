import { type z } from "zod";

import { type eventSchema, type eventsResponseSchema } from "@/lib/validations";

export type Event = z.infer<typeof eventSchema>;

export type EventsByDate = z.infer<typeof eventsResponseSchema>;
