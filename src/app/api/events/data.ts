import { cookies } from "next/headers";
import { addDays, format, parseISO } from "date-fns";

import { sortEvents } from "@/helpers/api";
import { createLocalTimestamp } from "@/helpers/dateUtils";
import { type EventsByDate } from "@/models";

const SESSION_KEY = "events_data";

function getDefaultEvents(): EventsByDate {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const dayAfterTomorrow = addDays(today, 2);

  return {
    [format(dayAfterTomorrow, "yyyy-MM-dd")]: [
      {
        id: "523e4567-e89b-12d3-a456-426614174004",
        title: "Client Meeting",
        description:
          "Review project progress and timeline adjustments. Discuss progress, blockers, and align on next week's priorities.",
        imageUrl: "/images/meeting.webp",
        timestamp: createLocalTimestamp(dayAfterTomorrow, 11, 30),
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
        timestamp: createLocalTimestamp(tomorrow, 12, 0),
        duration: 45,
        location: "Main Hall",
      },
      {
        id: "423e4567-e89b-12d3-a456-426614174003",
        title: "Product Demo",
        description:
          "Demo of UI improvements and performance optimizations to gather stakeholder feedback.",
        imageUrl: "/images/demo.webp",
        timestamp: createLocalTimestamp(tomorrow, 15, 30),
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
        timestamp: createLocalTimestamp(today, 14, 0),
        duration: 45,
        location: "Meeting Room B",
      },
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "Coffee with Alex",
        description:
          "Meet with Alex to brainstorm ideas for the upcoming product launch. We'll review market research and competitor analysis to identify potential opportunities and challenges.",
        imageUrl: "/images/coffee.webp",
        timestamp: createLocalTimestamp(today, 9, 0),
        duration: 30,
        location: "Cafeteria",
      },
    ],
  } satisfies EventsByDate;
}

export async function getEvents() {
  const cookieStore = await cookies();
  const eventsCookie = cookieStore.get(SESSION_KEY);

  if (!eventsCookie) {
    const defaultEvents = getDefaultEvents();

    const sortedEvents = Object.fromEntries(
      Object.entries(defaultEvents).map(([date, events]) => [
        date,
        sortEvents(events),
      ]),
    ) satisfies EventsByDate;

    cookieStore.set(SESSION_KEY, JSON.stringify(sortedEvents), {
      httpOnly: true,
      sameSite: "lax",
    });

    return sortedEvents;
  }

  const events = JSON.parse(eventsCookie.value) as EventsByDate;

  return Object.fromEntries(
    Object.entries(events).map(([date, events]) => [date, sortEvents(events)]),
  ) satisfies EventsByDate;
}

export async function updateEvent(id: string, newDate: Date) {
  const events = await getEvents();
  let updatedEvent = null;
  const formattedDate = format(newDate, "yyyy-MM-dd");

  for (const date in events) {
    const eventIndex = events[date].findIndex((event) => event.id === id);

    if (eventIndex !== -1) {
      const event = events[date][eventIndex];
      const oldDate = parseISO(event.timestamp);

      const updatedTimestamp = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
        oldDate.getHours(),
        oldDate.getMinutes(),
        oldDate.getSeconds(),
      ).toISOString();

      updatedEvent = {
        ...event,
        timestamp: updatedTimestamp,
      };

      events[date].splice(eventIndex, 1);

      if (events[date].length === 0) {
        delete events[date];
      }

      break;
    }
  }

  if (!updatedEvent) {
    return null;
  }

  if (!events[formattedDate]) {
    events[formattedDate] = [];
  }

  events[formattedDate].push(updatedEvent);

  const sortedEvents = Object.fromEntries(
    Object.entries(events).map(([date, events]) => [date, sortEvents(events)]),
  ) satisfies EventsByDate;

  const cookieStore = await cookies();

  cookieStore.set(SESSION_KEY, JSON.stringify(sortedEvents), {
    httpOnly: true,
    sameSite: "lax",
  });

  return updatedEvent;
}
