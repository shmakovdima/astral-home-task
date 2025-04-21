import { http, HttpResponse } from "msw";

import { type EventsByDate } from "../models";

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

const events: EventsByDate = {
  [dayAfterTomorrow.toISOString().split("T")[0]]: [
    {
      id: "event-1",
      title: "Coffee with Alex",
      description:
        "Meet with Alex to brainstorm ideas for the upcoming product launch.",
      imageUrl:
        "https://fastly.picsum.photos/id/312/1920/1080.jpg?hmac=OD_fP9MUQN7uJ8NBR7tlii78qwHPUROGgohG4w16Kjw",
      timestamp: new Date(dayAfterTomorrow.setHours(9, 0, 0, 0)).toISOString(),
    },
    {
      id: "event-2",
      title: "Team Standup",
      description: "Weekly standup meeting with the dev team.",
      imageUrl:
        "http://fastly.picsum.photos/id/737/1920/1080.jpg?hmac=aFzER8Y4wcWTrXVx2wVKSj10IqnygaF33gESj0WGDwI",
      timestamp: new Date(dayAfterTomorrow.setHours(14, 0, 0, 0)).toISOString(),
    },
  ],
  [tomorrow.toISOString().split("T")[0]]: [
    {
      id: "event-3",
      title: "Yoga Session",
      description:
        "Join for a relaxing yoga session to reduce stress and improve mindfulness.",
      imageUrl:
        "https://fastly.picsum.photos/id/392/1920/1080.jpg?hmac=Fvbf7C1Rcozg8EccwYPqsGkk_o6Bld2GQRDPZKWpd7g",
      timestamp: new Date(tomorrow.setHours(12, 0, 0, 0)).toISOString(),
    },
    {
      id: "event-4",
      title: "Product Demo",
      description: "Demo of UI improvements and performance optimizations.",
      imageUrl:
        "https://fastly.picsum.photos/id/249/1920/1080.jpg?hmac=cPMNdgGXRh6T_KhRMuaQjRtAx5cWRraELjtL2MHTfYs",
      timestamp: new Date(tomorrow.setHours(15, 30, 0, 0)).toISOString(),
    },
  ],
  [today.toISOString().split("T")[0]]: [
    {
      id: "event-5",
      title: "Client Meeting",
      description: "Review project progress and timeline adjustments.",
      imageUrl:
        "https://fastly.picsum.photos/id/908/1920/1080.jpg?hmac=MeG_oA1s75hHAL_4JzCioh6--zyFTWSCTxOhe8ugvXo",
      timestamp: new Date(today.setHours(11, 30, 0, 0)).toISOString(),
    },
  ],
};

export const handlers = [
  // Get all events
  http.get("/api/events", () => {
    console.log("Mock handler: GET /api/events");
    return HttpResponse.json(events);
  }),

  // Get a specific event by ID
  http.get("/api/event/:id", ({ params }) => {
    const { id } = params;
    console.log("Mock handler: GET /api/event/", id);

    // Search for the event across all dates
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
];
