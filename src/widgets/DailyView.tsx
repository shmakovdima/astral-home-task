import { useState } from "react";
import { format, addDays, set, isSameDay } from "date-fns";

import { DateHeader } from "@/components/DateHeader";
import { DayDropZone } from "@/components/DayDropZone";
import { DaysNavigation } from "@/components/DaysNavigation";
import { EventCard } from "@/components/EventCard";
import { useAllEvents } from "@/hooks/useEvents";
import { useUpdateEventDate } from "@/hooks/useUpdateEventDate";
import type { Event } from "@/models";

export const DailyView = () => {
  const [activeDay, setActiveDay] = useState(format(new Date(), "yyyy-MM-dd"));
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [isDayChanged, setIsDayChanged] = useState(false);
  const { data: eventsByDate } = useAllEvents();
  const { mutate: updateEventDate } = useUpdateEventDate();

  const handleDayChange = (daysToMove: number) => {
    try {
      const currentDate = new Date(activeDay);
      const newDate = addDays(currentDate, daysToMove);

      if (isNaN(currentDate.getTime())) {
        throw new Error("Invalid date after modification");
      }

      const formattedDate = format(newDate, "yyyy-MM-dd");
      setActiveDay(formattedDate);
      setIsDayChanged(true);
    } catch (error) {
      console.error("Error changing day:", error);
    }
  };

  const handleEventDrop = (eventId: string) => {
    try {
      const currentDate = new Date(activeDay);

      if (isNaN(currentDate.getTime())) {
        throw new Error("Invalid date");
      }

      const newDate = set(currentDate, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });
      updateEventDate({ id: eventId, timestamp: newDate.toISOString() });
    } catch (error) {
      console.error("Error updating event date:", error);
    } finally {
      setDraggedEventId(null);
      setIsDayChanged(false);
    }
  };

  const dayEvents = eventsByDate?.[activeDay] || [];
  const isCurrentDay = isSameDay(new Date(activeDay), new Date());

  return (
    <div className="flex flex-col gap-4">
      <DaysNavigation activeDay={activeDay} setActiveDay={setActiveDay} />
      <div className="flex flex-col gap-4 p-4">
        <DateHeader date={activeDay} />
        <DayDropZone
          onDayChange={handleDayChange}
          onDrop={() => {
            if (draggedEventId) {
              handleEventDrop(draggedEventId);
            }
          }}
        >
          <div className="grid grid-cols-1 gap-4">
            {isDayChanged && draggedEventId && (
              <div className="text-center text-gray-500 py-8 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-sm font-medium text-blue-600">Drop here to move event</span>
                </div>
              </div>
            )}

            {dayEvents.length > 0 ? (
              dayEvents.map((event: Event) => (
                <EventCard
                  key={event.id}
                  {...event}
                  onDayChange={handleDayChange}
                  onDragStart={() => setDraggedEventId(event.id)}
                />
              ))
            ) : !draggedEventId && (
              <div className="text-center text-gray-500 py-8">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-sm font-medium text-gray-600">
                    {isCurrentDay ? "No events scheduled for today" : "No events scheduled for this day"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </DayDropZone>
      </div>
    </div>
  );
};
