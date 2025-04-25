import { useCallback, useMemo, useState } from "react";
import { addDays, format, parseISO, subDays } from "date-fns";

import { DateHeader } from "@/components/DateHeader";
import { DaysNavigation } from "@/components/DaysNavigation";
import { EventCard } from "@/components/EventCard";
import { useAllEvents } from "@/hooks/useEvents";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";

export const DailyView = () => {
  const [activeDay, setActiveDay] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );

  const { data: eventsByDate } = useAllEvents();

  const todayEvents = useMemo(
    () => eventsByDate?.[activeDay] || [],
    [activeDay, eventsByDate],
  );

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      const currentDate = parseISO(activeDay);

      const newDate =
        direction === "left"
          ? addDays(currentDate, 1)
          : subDays(currentDate, 1);

      setActiveDay(format(newDate, "yyyy-MM-dd"));
    },
    [activeDay],
  );

  const { handleTouchStart, handleTouchEnd } = useSwipeNavigation({
    onSwipe: handleSwipe,
  });

  return (
    <div className="overscroll-none touch-pan-y">
      <DaysNavigation activeDay={activeDay} setActiveDay={setActiveDay} />
      <div
        className="container mx-auto py-4 px-4"
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
      >
        <DateHeader date={activeDay} />
        <div className="mt-6">
          {todayEvents.length > 0 ? (
            <div className="grid gap-4">
              {todayEvents.map((event) => (
                <EventCard {...event} className="event-card" key={event.id} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No events scheduled for today
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
