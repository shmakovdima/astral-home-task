"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isToday,
  set,
  startOfWeek,
} from "date-fns";

import { DropEventPlaceholder } from "@/components/shared/DropEventPlaceholder";
import { EdgeIndicator } from "@/components/shared/EdgeIndicator";
import { WeekDropZone } from "@/components/weekly/WeekDropZone";
import { WeekEventCard } from "@/components/weekly/WeekEventCard";
import { WeekNavigation } from "@/components/weekly/WeekNavigation";
import { cnTwMerge } from "@/helpers/cnTwMerge";
import { useAllEvents } from "@/hooks/api/useEvents";
import { useUpdateEventDate } from "@/hooks/api/useUpdateEventDate";
import { useToastContext } from "@/providers/ToastProvider";

type WeekDropZoneRef = {
  resetStates: () => void;
};

export const WeekView = () => {
  const generateWeeks = useCallback((currentDate: Date) => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, []);

  const { showToast } = useToastContext();
  const { data: eventsByDate } = useAllEvents();

  const { mutate: updateEventDate } = useUpdateEventDate({
    onError: () => {
      showToast(
        "API Error: Failed to update event date. Reload browser - msw service worker stopped working",
      );
    },
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  const [currentWeek, setCurrentWeek] = useState<Date[]>(
    generateWeeks(currentDate),
  );

  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [isDayChanged, setIsDayChanged] = useState(false);
  const [startDay, setStartDay] = useState<string | null>(null);
  const [targetDayIndex, setTargetDayIndex] = useState<number | null>(null);
  const [isNearLeftEdge, setIsNearLeftEdge] = useState(false);
  const [isNearRightEdge, setIsNearRightEdge] = useState(false);
  const [edgeProgress, setEdgeProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [draggedCardHeight, setDraggedCardHeight] = useState<number | null>(
    null,
  );

  const [weekOffset, setWeekOffset] = useState(0);
  const originalEventDateRef = useRef<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const weekDropZoneRef = useRef<WeekDropZoneRef | null>(null);

  useLayoutEffect(() => {
    setCurrentWeek(generateWeeks(currentDate));
  }, [currentDate, generateWeeks]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isDragging) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const rightEdgeThreshold = 50;
    const leftEdgeThreshold = 50;

    if (scrollLeft < leftEdgeThreshold) {
      setEdgeProgress(1 - scrollLeft / leftEdgeThreshold);
      setIsNearLeftEdge(true);
      setIsNearRightEdge(false);
    } else if (scrollWidth - (scrollLeft + clientWidth) < rightEdgeThreshold) {
      setEdgeProgress(
        1 - (scrollWidth - (scrollLeft + clientWidth)) / rightEdgeThreshold,
      );

      setIsNearRightEdge(true);
      setIsNearLeftEdge(false);
    } else {
      setIsNearLeftEdge(false);
      setIsNearRightEdge(false);
      setEdgeProgress(0);
    }
  }, [isDragging]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);

      if (!isDragging) {
        setEdgeProgress(0);
      }
    };
  }, [handleScroll, isDragging]);

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

    if (!isLeft && !isRight) {
      setEdgeProgress(0);
    }
  }, []);

  const handleWeekChangeProgress = useCallback((progress: number) => {
    setEdgeProgress(progress);
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

  useEffect(() => {
    const handleAppSwipeReset = () => {
      if (isProcessingDropRef.current) {
        return;
      }

      setIsDayChanged(false);
      setTargetDayIndex(null);

      setStartDay(null);
      setWeekOffset(0);
      originalEventDateRef.current = null;
      setIsDragging(false);
      setDraggedEventId(null);
      setDraggedCardHeight(null);

      handleEdgeChange(false, false);

      if (weekDropZoneRef.current) {
        weekDropZoneRef.current.resetStates();
      }
    };

    window.addEventListener("focus", handleAppSwipeReset);
    window.addEventListener("blur", handleAppSwipeReset);

    return () => {
      window.removeEventListener("focus", handleAppSwipeReset);
      window.removeEventListener("blur", handleAppSwipeReset);
    };
  }, [handleEdgeChange]);

  return (
    <div className="flex h-full flex-col">
      <WeekNavigation
        currentWeek={currentWeek}
        onNextWeek={handleNextWeek}
        onPrevWeek={handlePrevWeek}
        weekEnd={weekEnd}
        weekStart={weekStart}
      />

      <div className="relative flex-1 overflow-hidden">
        <div className="h-full overflow-x-auto" ref={scrollContainerRef}>
          <WeekDropZone
            onDayChange={handleDayChange}
            onDrop={(daysToMove: number) => {
              if (draggedEventId) {
                handleEventDrop(draggedEventId, daysToMove);
              }

              setIsDragging(false);
            }}
            onEdgeChange={handleEdgeChange}
            onResetTargetDay={() => {
              setIsDayChanged(false);
              setTargetDayIndex(null);
            }}
            onWeekChange={handleWeekChange}
            onWeekChangeProgress={handleWeekChangeProgress}
            ref={weekDropZoneRef}
          >
            <div className="grid h-full flex-1 grid-cols-7 gap-0 overflow-hidden px-12">
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
                      <DropEventPlaceholder
                        minHeight={draggedCardHeight || 140}
                      />
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
                          setIsDragging(true);
                        }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="relative">
              <EdgeIndicator
                edgeProgress={edgeProgress}
                isVisible={isNearLeftEdge}
                position="left"
                type="weekly"
              />
              <EdgeIndicator
                edgeProgress={edgeProgress}
                isVisible={isNearRightEdge}
                position="right"
                type="weekly"
              />
            </div>
          </WeekDropZone>
        </div>
      </div>
    </div>
  );
};
