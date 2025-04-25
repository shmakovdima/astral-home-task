import { useEffect, useState } from "react";
import { addDays, format, isToday, startOfWeek } from "date-fns";

import { WeekEventCard } from "@/components/WeekEventCard";
import { useAllEvents } from "@/hooks/useEvents";

export const WeeklyCalendarView = () => {
  const { data: eventsByDate } = useAllEvents();
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);

  useEffect(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });

    const weekDates = Array.from({ length: 7 }, (_, i) =>
      addDays(weekStart, i),
    );

    setCurrentWeek(weekDates);
  }, []);

  const getEventsForDay = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return eventsByDate?.[dateString] || [];
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="grid grid-cols-7 gap-0 overflow-hidden mt-6">
        {currentWeek.map((date, index) => {
          const events = getEventsForDay(date);
          const isLastDay = index === currentWeek.length - 1;

          return (
            <div
              className={`min-h-[500px] p-1 ${
                isToday(date) ? "bg-blue-50" : ""
              } ${!isLastDay ? "border-r border-dotted border-white" : ""}`}
              key={format(date, "yyyy-MM-dd")}
            >
              {events.map((event) => (
                <WeekEventCard {...event} key={event.id} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
