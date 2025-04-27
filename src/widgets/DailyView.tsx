import { useState } from "react";
import { addDays, format, isSameDay } from "date-fns";

import { DayEventCard } from "@/components/DayEventCard";
import { DayHeader } from "@/components/DayHeader";
import { DaysNavigation } from "@/components/DaysNavigation";
import { useAllEvents } from "@/hooks/useEvents";
// import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useUpdateEventDate } from "@/hooks/useUpdateEventDate";
import type { Event } from "@/models";
import {
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

export const DailyView = () => {
  const [activeDay, setActiveDay] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const { data: eventsByDate } = useAllEvents();
  const { mutate: updateEventDate } = useUpdateEventDate();

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 0,
      tolerance: 0,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  /*
   *const handlePrevDay = () => {
   *  const baseDate = new Date(activeDay);
   *  const newDate = addDays(baseDate, -1);
   *  const formattedDate = format(newDate, "yyyy-MM-dd");
   *  setActiveDay(formattedDate);
   *};
   *
   *const handleNextDay = () => {
   *  const baseDate = new Date(activeDay);
   *  const newDate = addDays(baseDate, 1);
   *  const formattedDate = format(newDate, "yyyy-MM-dd");
   *  setActiveDay(formattedDate);
   *};
   *
   *const { ref } = useSwipeNavigation({
   *  onSwipe: (direction) => {
   *    if (direction === "right") {
   *      handlePrevDay();
   *    } else {
   *      handleNextDay();
   *    }
   *  },
   *  minSwipeDistance: 50,
   *});
   */

  const handleDayChange = (direction: "prev" | "next") => {
    const daysToMove = direction === "prev" ? -1 : 1;
    const baseDate = new Date(activeDay);
    const newDate = addDays(baseDate, daysToMove);
    const formattedDate = format(newDate, "yyyy-MM-dd");
    setActiveDay(formattedDate);
  };

  const handleDragStart = (event: any) => {
    const { active } = event;

    const draggedEvent = dayEvents.find(
      (e) => e.id === active.data.current?.id,
    );

    if (draggedEvent) {
      setActiveEvent(draggedEvent);
    }
  };

  const handleDragEnd = () => {
    setActiveEvent(null);
  };

  const dayEvents = eventsByDate?.[activeDay] || [];
  const isCurrentDay = isSameDay(new Date(activeDay), new Date());

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className="flex flex-col gap-4 min-h-[calc(100vh_-_200px)]">
        <DaysNavigation activeDay={activeDay} setActiveDay={setActiveDay} />
        <div className="flex flex-col gap-4 p-4">
          <DayHeader date={activeDay} />
          <div className="grid grid-cols-1 gap-4">
            {dayEvents.length > 0 ? (
              dayEvents.map((event: Event) => (
                <DayEventCard
                  key={event.id}
                  {...event}
                  onDayChange={handleDayChange}
                />
              ))
            ) : (
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
        </div>
      </div>
      <DragOverlay dropAnimation={null} modifiers={[]}>
        {activeEvent ? (
          <div className="shadow-lg opacity-50">
            <DayEventCard
              {...activeEvent}
              isDragOverlay
              onDayChange={handleDayChange}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
