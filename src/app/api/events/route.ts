import { NextResponse } from "next/server";

import { getEvents } from "./data";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await getEvents();

  return NextResponse.json(events, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
