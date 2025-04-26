import { useEffect, useState } from "react";
import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isToday,
  startOfWeek,
} from "date-fns";

import { WeekEventCard } from "@/components/WeekEventCard";
import { WeeksHeader } from "@/components/WeeksHeader";
import { cnTwMerge } from "@/helpers/cnTwMerge";
import { useAllEvents } from "@/hooks/useEvents";

export const WeeklyCalendarView = () => {
  const { data: eventsByDate } = useAllEvents();
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

    const weekDates = Array.from({ length: 7 }, (_, i) =>
      addDays(weekStart, i),
    );

    setCurrentWeek(weekDates);
  }, [currentDate]);

  const handlePrevWeek = () => {
    setCurrentDate((prev) => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => addWeeks(prev, 1));
  };

  const getEventsForDay = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return eventsByDate?.[dateString] || [];
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white overflow-hidden">
        <WeeksHeader
          onNextWeek={handleNextWeek}
          onPrevWeek={handlePrevWeek}
          weekEnd={weekEnd}
          weekStart={weekStart}
        />

        <div className="grid grid-cols-7 gap-0">
          {currentWeek.map((date) => (
            <div
              className={cnTwMerge(
                "flex flex-col items-center justify-center transition-colors duration-200 py-2 px-3 rounded-lg mx-1",
                isToday(date)
                  ? "bg-gradient-to-br from-indigo-600 to-violet-600"
                  : "bg-gray-100/10",
              )}
              key={format(date, "yyyy-MM-dd")}
            >
              <span className="text-sm">{format(date, "EEE")}</span>
              <span className="text-xl font-bold mt-1">{date.getDate()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-7 gap-0 overflow-hidden">
          {currentWeek.map((date, index) => {
            const events = getEventsForDay(date);
            const isLastDay = index === currentWeek.length - 1;

            return (
              <div
                className={`flex flex-col min-h-[500px] gap-4 p-2 ${
                  isToday(date) ? "bg-blue-50" : ""
                } ${!isLastDay ? "border-r border-gray-200" : ""}`}
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
    </div>
  );
};
