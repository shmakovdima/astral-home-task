import { useCallback, useEffect, useRef, useState } from "react";
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
import { WeeksNavigation } from "@/components/WeeksNavigation";
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

  const [weekOffset, setWeekOffset] = useState(0);
  const originalEventDateRef = useRef<string | null>(null);
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

  const handleWeekChange = useCallback((direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentDate((prev) => addWeeks(prev, -1));
      setWeekOffset((prev) => prev - 1);
      setTargetDayIndex(6);
      setIsDayChanged(true);
    } else {
      setCurrentDate((prev) => addWeeks(prev, 1));
      setWeekOffset((prev) => prev + 1);
      setTargetDayIndex(0);
      setIsDayChanged(true);
    }
  }, []);

  const handleDayChange = (daysToMove: number) => {
    try {
      if (!startDay) {
        const currentDateString = format(currentDate, "yyyy-MM-dd");
        setStartDay(currentDateString);

        if (draggedEventId && !originalEventDateRef.current) {
          const event = Object.values(eventsByDate || {})
            .flat()
            .find((e) => e.id === draggedEventId);

          if (event) {
            originalEventDateRef.current = event.timestamp;
          }
        }
      }

      const totalDaysToMove = daysToMove + weekOffset * 7;

      if (totalDaysToMove === 0 && weekOffset === 0) {
        setTargetDayIndex(null);
        setIsDayChanged(false);
        return;
      }

      if (weekOffset !== 0) {
        const dayIndex = ((daysToMove % 7) + 7) % 7;
        setTargetDayIndex(dayIndex);
        setIsDayChanged(true);
        return;
      }

      const startDayIndex = currentWeek.findIndex(
        (day) => format(day, "yyyy-MM-dd") === startDay,
      );

      if (startDayIndex === -1) return;

      const newIndex = startDayIndex + daysToMove;

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

  const isProcessingDropRef = useRef(false);

  const handleEventDrop = useCallback(
    (eventId: string, daysToMove: number) => {
      try {
        if (isProcessingDropRef.current) {
          console.log("Событие уже обрабатывается, пропускаем");
          return;
        }

        isProcessingDropRef.current = true;

        console.log(
          `Обработка перетаскивания события ${eventId} на ${daysToMove} дней`,
        );

        const event = Object.values(eventsByDate || {})
          .flat()
          .find((e) => e.id === eventId);

        if (!event) {
          console.error("Событие не найдено");
          return;
        }

        if (weekOffset !== 0) {
          if (
            targetDayIndex !== null &&
            targetDayIndex >= 0 &&
            targetDayIndex < 7
          ) {
            const targetDate = currentWeek[targetDayIndex];

            const originalDate = new Date(event.timestamp);

            const normalizedDate = set(targetDate, {
              hours: originalDate.getHours(),
              minutes: originalDate.getMinutes(),
              seconds: originalDate.getSeconds(),
              milliseconds: 0,
            });

            console.log(
              `Перемещение события на другую неделю: ${format(normalizedDate, "yyyy-MM-dd HH:mm")}`,
            );

            updateEventDate({
              id: eventId,
              timestamp: normalizedDate.toISOString(),
            });

            return;
          }
        }

        const startDayIndex = currentWeek.findIndex(
          (day) => format(day, "yyyy-MM-dd") === startDay,
        );

        if (startDayIndex === -1) {
          console.error("Исходный день не найден");
          return;
        }

        const targetIndex = startDayIndex + daysToMove;

        if (targetIndex >= 0 && targetIndex < 7) {
          const targetDate = currentWeek[targetIndex];

          const originalDate = new Date(event.timestamp);

          const normalizedDate = set(targetDate, {
            hours: originalDate.getHours(),
            minutes: originalDate.getMinutes(),
            seconds: originalDate.getSeconds(),
            milliseconds: 0,
          });

          console.log(
            `Перемещение события на: ${format(normalizedDate, "yyyy-MM-dd HH:mm")}`,
          );

          updateEventDate({
            id: eventId,
            timestamp: normalizedDate.toISOString(),
          });
        } else {
          console.error("Целевой индекс вне диапазона недели:", targetIndex);
        }
      } catch (error) {
        console.error("Ошибка при обновлении даты:", error);
      } finally {
        setTimeout(() => {
          isProcessingDropRef.current = false;
        }, 200);

        setDraggedEventId(null);
        setIsDayChanged(false);
        setStartDay(null);
        setTargetDayIndex(null);
        setDraggedCardHeight(null);
        setWeekOffset(0);
        originalEventDateRef.current = null;
      }
    },
    [
      currentWeek,
      updateEventDate,
      eventsByDate,
      startDay,
      targetDayIndex,
      weekOffset,
    ],
  );

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  return (
    <div className="flex flex-col h-full">
      <WeeksNavigation
        currentWeek={currentWeek}
        onNextWeek={handleNextWeek}
        onPrevWeek={handlePrevWeek}
        weekEnd={weekEnd}
        weekStart={weekStart}
      />

      <div className="flex-1 overflow-hidden px-6">
        <DayDropZone
          onDayChange={handleDayChange}
          onDrop={(daysToMove: number) => {
            if (draggedEventId) {
              handleEventDrop(draggedEventId, daysToMove);
            }
          }}
          onWeekChange={handleWeekChange}
        >
          <div className="grid grid-cols-7 gap-0 overflow-hidden flex-1 h-full">
            {currentWeek.map((date, index) => {
              const events = getEventsForDay(date);
              const isLastDay = index === currentWeek.length - 1;
              const dateString = format(date, "yyyy-MM-dd");
              const isTargetDay = targetDayIndex === index && isDayChanged;
              const hasEvents = events.length > 0;

              return (
                <div
                  className={cnTwMerge(
                    "flex px-2 pt-2 gap-2 flex-col h-full transition-colors duration-200",
                    hasEvents ? "pb-6" : "pb-2",
                    isToday(date) ? "bg-blue-50" : "",
                    isTargetDay ? "bg-blue-100/50" : "",
                    !isLastDay ? "border-r border-gray-200" : "",
                  )}
                  key={format(date, "yyyy-MM-dd")}
                  style={{ minHeight: "calc(100vh - 180px)" }}
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
