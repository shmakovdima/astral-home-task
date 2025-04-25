import { addDays, format } from "date-fns";
import { http, HttpResponse } from "msw";

import { type EventsByDate } from "../models";

const today = new Date();
const tomorrow = addDays(today, 1);
const dayAfterTomorrow = addDays(today, 2);

const createEvent = (date: Date, hours: number, minutes: number) => {
  const eventDate = new Date(date);
  eventDate.setHours(hours, minutes, 0, 0);
  return eventDate.toISOString();
};

const events: EventsByDate = {
  [format(dayAfterTomorrow, "yyyy-MM-dd")]: [
    {
      id: "523e4567-e89b-12d3-a456-426614174004",
      title: "Client Meeting",
      description: "Review project progress and timeline adjustments.",
      imageUrl:
        "https://fastly.picsum.photos/id/908/1920/1080.jpg?hmac=MeG_oA1s75hHAL_4JzCioh6--zyFTWSCTxOhe8ugvXo",
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
        "Join for a relaxing yoga session to reduce stress and improve mindfulness.",
      imageUrl:
        "https://fastly.picsum.photos/id/392/1920/1080.jpg?hmac=Fvbf7C1Rcozg8EccwYPqsGkk_o6Bld2GQRDPZKWpd7g",
      timestamp: createEvent(tomorrow, 12, 0),
      duration: 45,
      location: "Main Hall",
    },
    {
      id: "423e4567-e89b-12d3-a456-426614174003",
      title: "Product Demo",
      description: "Demo of UI improvements and performance optimizations.",
      imageUrl:
        "https://fastly.picsum.photos/id/249/1920/1080.jpg?hmac=cPMNdgGXRh6T_KhRMuaQjRtAx5cWRraELjtL2MHTfYs",
      timestamp: createEvent(tomorrow, 15, 30),
      duration: 90,
      location: "Training Room",
    },
  ],
  [format(today, "yyyy-MM-dd")]: [
    {
      id: "123e4567-e89b-12d3-a456-426614174000",
      title: "Coffee with Alex",
      description:
        "Meet with Alex to brainstorm ideas for the upcoming product launch.",
      imageUrl:
        "https://fastly.picsum.photos/id/312/1920/1080.jpg?hmac=OD_fP9MUQN7uJ8NBR7tlii78qwHPUROGgohG4w16Kjw",
      timestamp: createEvent(today, 9, 0),
      duration: 30,
      location: "Cafeteria",
    },
    {
      id: "223e4567-e89b-12d3-a456-426614174001",
      title: "Team Standup",
      description: "Weekly standup meeting with the dev team.",
      imageUrl:
        "http://fastly.picsum.photos/id/737/1920/1080.jpg?hmac=aFzER8Y4wcWTrXVx2wVKSj10IqnygaF33gESj0WGDwI",
      timestamp: createEvent(today, 14, 0),
      duration: 45,
      location: "Meeting Room B",
    },
  ],
};

export const handlers = [
  http.get("/api/events", () => {
    console.log("Mock handler: GET /api/events");
    return HttpResponse.json(events);
  }),

  http.get("/api/event/:id", ({ params }) => {
    const { id } = params;
    console.log("Mock handler: GET /api/event/", id);

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

  http.patch("/api/event/:id", async ({ params, request }) => {
    const { id } = params;
    console.log("Mock handler: PATCH /api/event/", id);

    const body = (await request.json()) as { timestamp?: string };
    const { timestamp } = body;

    if (!timestamp) {
      return new HttpResponse(null, {
        status: 400,
        statusText: "Timestamp is required",
      });
    }

    let updatedEvent = null;
    const newDate = timestamp.split("T")[0];

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

    if (!events[newDate]) {
      events[newDate] = [];
    }

    events[newDate].push(updatedEvent);

    return HttpResponse.json(updatedEvent);
  }),
];
