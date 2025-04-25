import { useState } from "react";
import { format } from "date-fns";

import { DayDropZone } from "@/components/DayDropZone";
import { DateHeader } from "@/components/DateHeader";
import { DaysNavigation } from "@/components/DaysNavigation";
import { EventCard } from "@/components/EventCard";
import { useAllEvents } from "@/hooks/useEvents";
import { useUpdateEventDate } from "@/hooks/useUpdateEventDate";
import type { Event } from "@/models";

export const DailyView = () => {
  const [activeDay, setActiveDay] = useState(format(new Date(), "yyyy-MM-dd"));
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const { data: eventsByDate } = useAllEvents();
  const { mutate: updateEventDate } = useUpdateEventDate();

  const handleDayChange = (daysToMove: number) => {
    try {
      const currentDate = new Date(activeDay);

      if (isNaN(currentDate.getTime())) {
        throw new Error("Invalid date");
      }

      currentDate.setDate(currentDate.getDate() + daysToMove);
      setActiveDay(format(currentDate, "yyyy-MM-dd"));
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

      currentDate.setHours(12, 0, 0, 0);
      updateEventDate({ id: eventId, timestamp: currentDate.toISOString() });
    } catch (error) {
      console.error("Error updating event date:", error);
    }
  };

  const dayEvents = eventsByDate?.[activeDay] || [];

  return (
    <div className="flex flex-col gap-4">
      <DaysNavigation activeDay={activeDay} setActiveDay={setActiveDay} />
      <div className="flex flex-col gap-4 p-4">
      <DateHeader date={activeDay} />
      <div className="grid grid-cols-1 gap-4">
        {dayEvents.length > 0 ? (
          dayEvents.map((event: Event) => (
            <EventCard
              key={event.id}
              {...event}
              onDayChange={handleDayChange}
              onDragStart={() => setDraggedEventId(event.id)}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No events scheduled for today
          </div>
        )}
      </div>
      <DayDropZone
        onDayChange={handleDayChange}
        onDrop={() => {
          if (draggedEventId) {
            handleEventDrop(draggedEventId);
            setDraggedEventId(null);
          }
        }}
      >
        {draggedEventId && (
          <div className="text-center text-gray-500 py-8">
            Drop here to move event
          </div>
        )}
      </DayDropZone>
      </div>
     
    </div>
  );
};
