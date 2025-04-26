import { useCallback, useState } from "react";
import { addDays, format, isSameDay, set } from "date-fns";

import { DateHeader } from "@/components/DateHeader";
import { DayDropZoneDaily } from "@/components/DayDropZoneDaily";
import { DaysNavigation } from "@/components/DaysNavigation";
import { EventCard } from "@/components/EventCard";
import { useAllEvents } from "@/hooks/useEvents";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useUpdateEventDate } from "@/hooks/useUpdateEventDate";
import type { Event } from "@/models";

export const DailyView = () => {
  const [activeDay, setActiveDay] = useState(format(new Date(), "yyyy-MM-dd"));
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [isDayChanged, setIsDayChanged] = useState(false);
  const [startDay, setStartDay] = useState<string | null>(null);
  const { data: eventsByDate } = useAllEvents();
  const { mutate: updateEventDate } = useUpdateEventDate();

  const { ref } = useSwipeNavigation({
    onSwipe: (direction) => {
      const daysToMove = direction === "right" ? -1 : 1;
      const baseDate = new Date(activeDay);
      const newDate = addDays(baseDate, daysToMove);
      const formattedDate = format(newDate, "yyyy-MM-dd");
      setActiveDay(formattedDate);
    },
  });

  const handleDayChange = (daysToMove: number) => {
    try {
      if (!startDay) {
        setStartDay(activeDay);
      }

      const baseDate = new Date(startDay || activeDay);
      const newDate = addDays(baseDate, daysToMove);

      if (isNaN(baseDate.getTime())) {
        throw new Error("Invalid date after modification");
      }

      const formattedDate = format(newDate, "yyyy-MM-dd");
      setActiveDay(formattedDate);
      setIsDayChanged(true);
    } catch (error) {
      console.error("Error changing day:", error);
    }
  };

  const handleEventDrop = useCallback(
    (eventId: string, daysToMove: number) => {
      try {
        let targetDate: Date;

        if (daysToMove === 0) {
          // If dropped outside zone, use current active day
          targetDate = new Date(activeDay);
        } else {
          // Otherwise calculate new date based on movement
          const baseDate = new Date(startDay || activeDay);

          if (isNaN(baseDate.getTime())) {
            throw new Error("Invalid date");
          }

          targetDate = addDays(baseDate, daysToMove);
        }

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

        // Only update activeDay if we actually moved the event
        if (daysToMove !== 0) {
          const formattedDate = format(targetDate, "yyyy-MM-dd");
          setActiveDay(formattedDate);
        }
      } catch (error) {
        console.error("Error updating event date:", error);
      } finally {
        setDraggedEventId(null);
        setIsDayChanged(false);
        setStartDay(null);
      }
    },
    [startDay, activeDay, updateEventDate],
  );

  const dayEvents = eventsByDate?.[activeDay] || [];
  const isCurrentDay = isSameDay(new Date(activeDay), new Date());

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh_-_200px)]" ref={ref}>
      <DaysNavigation activeDay={activeDay} setActiveDay={setActiveDay} />
      <div className="flex flex-col gap-4 p-4">
        <DateHeader date={activeDay} />
        <DayDropZoneDaily
          onDayChange={handleDayChange}
          onDrop={(daysToMove) => {
            if (draggedEventId) {
              handleEventDrop(draggedEventId, daysToMove);
            }
          }}
        >
          <div className="grid grid-cols-1 gap-4">
            {isDayChanged && draggedEventId ? (
              <div className="text-center text-gray-500 py-28 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50">
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-8 h-8 text-blue-400"
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
                  <span className="text-sm font-medium text-blue-600">
                    Drop here to move event
                  </span>
                </div>
              </div>
            ) : null}

            {dayEvents.length > 0
              ? dayEvents.map((event: Event) => (
                  <EventCard
                    key={event.id}
                    {...event}
                    onDragEnd={(daysToMove) =>
                      handleEventDrop(event.id, daysToMove)
                    }
                    onDragStart={() => {
                      setDraggedEventId(event.id);
                      setStartDay(activeDay);
                    }}
                  />
                ))
              : !draggedEventId && (
                  <div className="text-center text-gray-500 py-8">
                    <div className="flex flex-col items-center gap-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-600">
                        {isCurrentDay
                          ? "No events scheduled for today"
                          : "No events scheduled for this day"}
                      </span>
                    </div>
                  </div>
                )}
          </div>
        </DayDropZoneDaily>
      </div>
    </div>
  );
};
