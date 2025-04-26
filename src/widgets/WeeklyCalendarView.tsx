import { useCallback, useEffect, useState } from "react";
import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isToday,
  set,
  startOfWeek,
} from "date-fns";

import { DayDropZone } from "@/components/DayDropZone";
import { WeekEventCard } from "@/components/WeekEventCard";
import { WeeksHeader } from "@/components/WeeksHeader";
import { cnTwMerge } from "@/helpers/cnTwMerge";
import { useAllEvents } from "@/hooks/useEvents";
import { useUpdateEventDate } from "@/hooks/useUpdateEventDate";

export const WeeklyCalendarView = () => {
  const { data: eventsByDate } = useAllEvents();
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [isDayChanged, setIsDayChanged] = useState(false);
  const [startDay, setStartDay] = useState<string | null>(null);
  const [targetDayIndex, setTargetDayIndex] = useState<number | null>(null);

  const [draggedCardHeight, setDraggedCardHeight] = useState<number | null>(
    null,
  );

  const { mutate: updateEventDate } = useUpdateEventDate();

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

  const handleDayChange = (daysToMove: number) => {
    try {
      if (!startDay) {
        const currentDateString = format(currentDate, "yyyy-MM-dd");
        setStartDay(currentDateString);
      }

      if (daysToMove === 0) {
        setTargetDayIndex(null);
        setIsDayChanged(false);
        return;
      }

      const startDayIndex = currentWeek.findIndex(
        (day) => format(day, "yyyy-MM-dd") === startDay,
      );

      if (startDayIndex === -1) return;

      // Вычисляем целевой индекс
      const newIndex = startDayIndex + daysToMove;

      // Проверяем, что индекс в пределах недели
      if (newIndex >= 0 && newIndex < 7) {
        setTargetDayIndex(newIndex);
        setIsDayChanged(true);
      } else {
        setTargetDayIndex(null);
        setIsDayChanged(false);
      }
    } catch (error) {
      console.error("Ошибка при изменении дня:", error);
    }
  };

  const handleEventDrop = useCallback(
    (eventId: string, daysToMove: number) => {
      try {
        if (daysToMove === 0) {
          return;
        }

        const startDayIndex = currentWeek.findIndex(
          (day) => format(day, "yyyy-MM-dd") === startDay,
        );

        if (startDayIndex === -1) return;

        const targetIndex = startDayIndex + daysToMove;

        if (targetIndex >= 0 && targetIndex < 7) {
          const targetDate = currentWeek[targetIndex];

          const normalizedDate = set(targetDate, {
            hours: 12,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
          });

          updateEventDate({
            id: eventId,
            timestamp: normalizedDate.toISOString(),
          });
        }
      } catch (error) {
        console.error("Error days update:", error);
      } finally {
        setDraggedEventId(null);
        setIsDayChanged(false);
        setStartDay(null);
        setTargetDayIndex(null);
        setDraggedCardHeight(null);
      }
    },
    [currentWeek, startDay, updateEventDate],
  );

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
        <DayDropZone
          onDayChange={handleDayChange}
          onDrop={(daysToMove: number) => {
            if (draggedEventId) {
              handleEventDrop(draggedEventId, daysToMove);
            }
          }}
        >
          <div className="grid grid-cols-7 gap-0 overflow-hidden">
            {currentWeek.map((date, index) => {
              const events = getEventsForDay(date);
              const isLastDay = index === currentWeek.length - 1;
              const dateString = format(date, "yyyy-MM-dd");
              const isTargetDay = targetDayIndex === index && isDayChanged;

              return (
                <div
                  className={`flex flex-col min-h-[500px] gap-4 p-2 ${
                    isToday(date) ? "bg-blue-50" : ""
                  } ${isTargetDay ? "bg-blue-100/50" : ""} ${
                    !isLastDay ? "border-r border-gray-200" : ""
                  } transition-colors duration-200`}
                  key={format(date, "yyyy-MM-dd")}
                >
                  {isTargetDay ? (
                    <div
                      className="text-center text-gray-500 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/70 mb-2 flex items-center justify-center"
                      style={{
                        height: draggedCardHeight
                          ? `${draggedCardHeight}px`
                          : "auto",
                        minHeight: "140px",
                        padding: "0.5rem",
                      }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="w-6 h-6 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                        <span className="text-xs font-medium text-blue-600">
                          Drop here to move event
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {events.map((event) => (
                    <WeekEventCard
                      {...event}
                      key={event.id}
                      onDragEnd={(daysToMove) =>
                        handleEventDrop(event.id, daysToMove)
                      }
                      onDragStart={(height) => {
                        setDraggedEventId(event.id);
                        setStartDay(dateString);
                        setDraggedCardHeight(height);
                      }}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </DayDropZone>
      </div>
    </div>
  );
};
