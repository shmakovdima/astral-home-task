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

import { WeekDropZone } from "@/components/WeekDropZone";
import { WeekEventCard } from "@/components/WeekEventCard";
import { WeekNavigation } from "@/components/WeekNavigation";
import { cnTwMerge } from "@/helpers/cnTwMerge";
import { useAllEvents } from "@/hooks/api/useEvents";
import { useUpdateEventDate } from "@/hooks/api/useUpdateEventDate";

export const WeeklyView = () => {
  const { data: eventsByDate } = useAllEvents();
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [isDayChanged, setIsDayChanged] = useState(false);
  const [startDay, setStartDay] = useState<string | null>(null);
  const [targetDayIndex, setTargetDayIndex] = useState<number | null>(null);
  const [isNearLeftEdge, setIsNearLeftEdge] = useState(false);
  const [isNearRightEdge, setIsNearRightEdge] = useState(false);

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

    setTimeout(() => {
      setIsDayChanged(false);
      setTargetDayIndex(null);
    }, 100);
  }, []);

  const handleEdgeChange = useCallback((isLeft: boolean, isRight: boolean) => {
    setIsNearLeftEdge(isLeft);
    setIsNearRightEdge(isRight);
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
      console.error("Error changing day:", error);
    }
  };

  const isProcessingDropRef = useRef(false);

  const handleEventDrop = useCallback(
    (eventId: string, daysToMove: number) => {
      try {
        if (isProcessingDropRef.current) {
          return;
        }

        if (daysToMove === 0) {
          setIsDayChanged(false);
          setTargetDayIndex(null);
          return;
        }

        isProcessingDropRef.current = true;

        const event = Object.values(eventsByDate || {})
          .flat()
          .find((e) => e.id === eventId);

        if (!event) {
          console.error("Event not found");
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
          console.error("Source day not found");
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

          updateEventDate({
            id: eventId,
            timestamp: normalizedDate.toISOString(),
          });
        } else {
          console.error("Target index is outside the week range:", targetIndex);
        }
      } catch (error) {
        console.error("Error updating date:", error);
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
      <WeekNavigation
        currentWeek={currentWeek}
        onNextWeek={handleNextWeek}
        onPrevWeek={handlePrevWeek}
        weekEnd={weekEnd}
        weekStart={weekStart}
      />

      <div className="flex-1 overflow-hidden px-6 relative">
        <WeekDropZone
          onDayChange={handleDayChange}
          onDrop={(daysToMove: number) => {
            if (draggedEventId) {
              handleEventDrop(draggedEventId, daysToMove);
            }
          }}
          onEdgeChange={handleEdgeChange}
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
                  style={{ minHeight: "calc(100dvh - 180px)" }}
                >
                  {isTargetDay && !isNearRightEdge && !isNearLeftEdge ? (
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
                          Drop event to this day
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
        </WeekDropZone>
      </div>
      {isNearLeftEdge ? (
        <div className="fixed left-0 top-0 w-[100px] bg-gradient-to-r h-screen min-h-[calc(100dvh_-_180px)] from-blue-500/20 to-transparent z-[100] flex items-end pb-[60px] justify-start">
          <div className="ml-4 bg-blue-500 rounded-full p-2 text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15 19l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
        </div>
      ) : null}

      {isNearRightEdge ? (
        <div className="fixed right-0 top-0 w-[100px] bg-gradient-to-l min-h-[calc(100dvh_-_180px)] h-screen from-blue-500/20 to-transparent z-[100] flex items-end pb-[60px] justify-end">
          <div className="mr-4 bg-blue-500 rounded-full p-2 text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 5l7 7-7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
        </div>
      ) : null}
    </div>
  );
};
