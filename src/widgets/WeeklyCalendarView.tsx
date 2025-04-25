import { useEffect, useState } from "react";

import { EventCard } from "@/components/EventCard";
import { useAllEvents } from "@/hooks/useEvents";

export const WeeklyCalendarView = () => {
  const { data: eventsByDate } = useAllEvents();
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(today);
      day.setDate(diff + i);
      return day;
    });

    setCurrentWeek(weekDates);
  }, []);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForDay = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
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
              key={date.toLocaleDateString()}
            >
              {events.map((event) => (
                <EventCard {...event} key={event.id} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
