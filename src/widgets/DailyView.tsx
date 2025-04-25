import { useMemo, useState } from "react";

import { useAllEvents } from "@/hooks/useEvents";

import { DaysNavigation } from "../components/DaysNavigation";
import { EventCard } from "../components/EventCard";

export const DailyView = () => {
  const [activeDay, setActiveDay] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  console.log("activeDay", activeDay);

  const { data: eventsByDate } = useAllEvents();

  console.log("eventsByDate", eventsByDate)

  const todayEvents = useMemo(
    () => eventsByDate?.[activeDay] || [],
    [activeDay, eventsByDate],
  );

  return (
    <>
      <DaysNavigation activeDay={activeDay} setActiveDay={setActiveDay} />
      <div className="container mx-auto py-4 px-4">
        <div className="mt-6">
          {todayEvents.length > 0 ? (
            <div className="grid gap-4">
              {todayEvents.map((event) => (
                <EventCard {...event} key={event.id} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No events scheduled for today
            </p>
          )}
        </div>
      </div>
    </>
  );
};
