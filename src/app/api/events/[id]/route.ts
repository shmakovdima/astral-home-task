import { type NextRequest, NextResponse } from "next/server";
import { parseISO } from "date-fns";

import { getEvents, updateEvent } from "../data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const events = await getEvents();
  const { id } = await context.params;

  for (const date in events) {
    const event = events[date].find((event) => event.id === id);

    if (event) {
      return NextResponse.json(event, {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    }
  }

  return new NextResponse(null, {
    status: 404,
    statusText: "Event not found",
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const body = await request.json();
  const { timestamp } = body as { timestamp?: string };

  if (!timestamp) {
    return new NextResponse(null, {
      status: 400,
      statusText: "Timestamp is required",
    });
  }

  const newDate = parseISO(timestamp);
  const { id } = await context.params;
  const updatedEvent = await updateEvent(id, newDate);

  if (!updatedEvent) {
    return new NextResponse(null, {
      status: 404,
      statusText: "Event not found",
    });
  }

  return NextResponse.json(updatedEvent, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
