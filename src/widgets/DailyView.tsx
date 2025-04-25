import { useState, useCallback } from "react";
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
  const [startDay, setStartDay] = useState<string | null>(null);
  const { data: eventsByDate } = useAllEvents();
  const { mutate: updateEventDate } = useUpdateEventDate();

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

  const handleEventDrop = useCallback((eventId: string, daysToMove: number) => {
    try {
      const baseDate = new Date(startDay || activeDay);
      
      if (isNaN(baseDate.getTime())) {
        throw new Error("Invalid date");
      }

      const newDate = addDays(baseDate, daysToMove);
      const normalizedDate = set(newDate, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });
      
      // Update the event date on the server
      updateEventDate({ id: eventId, timestamp: normalizedDate.toISOString() });
      
      // Update the active day to show the new date
      const formattedDate = format(newDate, "yyyy-MM-dd");
      setActiveDay(formattedDate);
    } catch (error) {
      console.error("Error updating event date:", error);
    } finally {
      setDraggedEventId(null);
      setIsDayChanged(false);
      setStartDay(null);
    }
  }, [startDay, activeDay, updateEventDate]);

  const dayEvents = eventsByDate?.[activeDay] || [];
  const isCurrentDay = isSameDay(new Date(activeDay), new Date());

  return (
    <div className="flex flex-col gap-4">
      <DaysNavigation activeDay={activeDay} setActiveDay={setActiveDay} />
      <div className="flex flex-col gap-4 p-4">
        <DateHeader date={activeDay} />
        <DayDropZone
          onDayChange={handleDayChange}
          onDrop={(daysToMove) => {
            if (draggedEventId) {
              handleEventDrop(draggedEventId, daysToMove);
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
                  onDragStart={() => {
                    setDraggedEventId(event.id);
                    setStartDay(activeDay);
                  }}
                  onDragEnd={(daysToMove) => handleEventDrop(event.id, daysToMove)}
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
