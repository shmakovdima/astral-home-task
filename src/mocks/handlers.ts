import { addDays, format } from "date-fns";
import { http, HttpResponse } from "msw";

import { type EventsByDate } from "../models";

const today = new Date();
const tomorrow = addDays(today, 1);
const dayAfterTomorrow = addDays(today, 2);

const createEvent = (date: Date, hours: number, minutes: number) => {
  const eventDate = new Date(date);
  eventDate.setUTCHours(hours, minutes, 0, 0);
  return eventDate.toISOString();
};

const events: EventsByDate = {
  [format(dayAfterTomorrow, "yyyy-MM-dd")]: [
    {
      id: "523e4567-e89b-12d3-a456-426614174004",
      title: "Client Meeting",
      description:
        "Review project progress and timeline adjustments. Discuss progress, blockers, and align on next week's priorities.",
      imageUrl: "/images/meeting.webp",
      timestamp: createEvent(dayAfterTomorrow, 11, 30),
      duration: 60,
      location: "Conference Room A",
    },
  ],
  [format(tomorrow, "yyyy-MM-dd")]: [
    {
      id: "323e4567-e89b-12d3-a456-426614174002",
      title: "Yoga Session",
      description:
        "Join for a relaxing yoga session to reduce stress and improve mindfulness. Suitable for all levels, focusing on gentle stretches.",
      imageUrl: "/images/yoga.webp",
      timestamp: createEvent(tomorrow, 12, 0),
      duration: 45,
      location: "Main Hall",
    },
    {
      id: "423e4567-e89b-12d3-a456-426614174003",
      title: "Product Demo",
      description:
        "Demo of UI improvements and performance optimizations to gather stakeholder feedback.",
      imageUrl: "/images/demo.webp",
      timestamp: createEvent(tomorrow, 15, 30),
      duration: 90,
      location: "Training Room",
    },
  ],
  [format(today, "yyyy-MM-dd")]: [
    {
      id: "223e4567-e89b-12d3-a456-426614174001",
      title: "Team Standup",
      description:
        "Weekly standup meeting with the dev team. Discuss progress, blockers, and align on next week's priorities.",
      imageUrl: "/images/standup.webp",
      timestamp: createEvent(today, 14, 0),
      duration: 45,
      location: "Meeting Room B",
    },
    {
      id: "123e4567-e89b-12d3-a456-426614174000",
      title: "Coffee with Alex",
      description:
        "Meet with Alex to brainstorm ideas for the upcoming product launch. We'll review market research and competitor analysis to identify potential opportunities and challenges.",
      imageUrl: "/images/coffee.webp",
      timestamp: createEvent(today, 9, 0),
      duration: 30,
      location: "Cafeteria",
    },
  ],
};

export const handlers = [
  http.get("/api/events", () => {
    console.log("Mock handler: GET /api/events");
    return HttpResponse.json(events);
  }),

  http.get("/api/events/:id", ({ params }) => {
    const { id } = params;
    console.log("Mock handler: GET /api/events/", id);

    for (const date in events) {
      const event = events[date].find((event) => event.id === id);

      if (event) {
        return HttpResponse.json(event);
      }
    }

    return new HttpResponse(null, {
      status: 404,
      statusText: "Event not found",
    });
  }),

  http.patch("/api/events/:id", async ({ params, request }) => {
    const { id } = params;
    console.log("Mock handler: PATCH /api/events/", id);

    const body = (await request.json()) as { timestamp?: string };
    const { timestamp } = body;

    if (!timestamp) {
      return new HttpResponse(null, {
        status: 400,
        statusText: "Timestamp is required",
      });
    }

    let updatedEvent = null;
    const newDate = new Date(timestamp);
    const formattedDate = format(newDate, "yyyy-MM-dd");

    for (const date in events) {
      const eventIndex = events[date].findIndex((event) => event.id === id);

      if (eventIndex !== -1) {
        updatedEvent = { ...events[date][eventIndex] };
        events[date].splice(eventIndex, 1);

        if (events[date].length === 0) {
          delete events[date];
        }

        break;
      }
    }

    if (!updatedEvent) {
      return new HttpResponse(null, {
        status: 404,
        statusText: "Event not found",
      });
    }

    if (!events[formattedDate]) {
      events[formattedDate] = [];
    }

    events[formattedDate].push(updatedEvent);

    return HttpResponse.json(updatedEvent);
  }),
];
