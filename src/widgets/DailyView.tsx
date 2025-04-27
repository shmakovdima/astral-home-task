import { useState, useCallback, useEffect, useRef, memo } from "react";
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
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDndMonitor,
} from "@dnd-kit/core";

const EDGE_THRESHOLD = 0.3;
const HOLD_DURATION = 300;

const DragMonitor = ({ onDayChange }: { onDayChange: (direction: "prev" | "next") => void }) => {
  const edgeTimeoutRef = useRef<number | null>(null);
  const lastDirectionRef = useRef<"prev" | "next" | null>(null);
  const hasChangedDayRef = useRef(false);
  const dragStartTimeRef = useRef(0);

  useDndMonitor({
    onDragStart: () => {
      dragStartTimeRef.current = Date.now();
      hasChangedDayRef.current = false;
    },
    onDragMove: (event) => {
      if (!onDayChange || hasChangedDayRef.current) return;

      const { delta } = event;
      const screenWidth = window.innerWidth;
      const threshold = screenWidth * EDGE_THRESHOLD;
      let newDirection: "prev" | "next" | null = null;

      console.log("delta", delta);

      if (delta.x > threshold) {
        newDirection = "next";
      } else if (delta.x < -threshold) {
        newDirection = "prev";
      }

      if (newDirection !== lastDirectionRef.current || !newDirection) {
        if (edgeTimeoutRef.current) {
          window.clearTimeout(edgeTimeoutRef.current);
          edgeTimeoutRef.current = null;
        }
        hasChangedDayRef.current = false;
      }

      if (newDirection && !edgeTimeoutRef.current && !hasChangedDayRef.current) {
        const holdStartTime = Date.now();
        const pointerHoldDuration = holdStartTime - dragStartTimeRef.current;

        if (pointerHoldDuration > HOLD_DURATION) {
          edgeTimeoutRef.current = window.setTimeout(() => {
            onDayChange(newDirection!);
            hasChangedDayRef.current = true;

            setTimeout(() => {
              hasChangedDayRef.current = false;
            }, 300);
          }, 100);
        }
      }

      lastDirectionRef.current = newDirection;
    },
    onDragEnd: () => {
      if (edgeTimeoutRef.current) {
        window.clearTimeout(edgeTimeoutRef.current);
        edgeTimeoutRef.current = null;
      }
      lastDirectionRef.current = null;
      hasChangedDayRef.current = false;
    },
    onDragCancel: () => {
      if (edgeTimeoutRef.current) {
        window.clearTimeout(edgeTimeoutRef.current);
        edgeTimeoutRef.current = null;
      }
      lastDirectionRef.current = null;
      hasChangedDayRef.current = false;
    }
  });

  return null;
};

export const DailyView = memo(() => {
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

  const handleDayChange = (direction: "prev" | "next") => {
    const daysToMove = direction === "prev" ? -1 : 1;
    const baseDate = new Date(activeDay);
    const newDate = addDays(baseDate, daysToMove);
    const formattedDate = format(newDate, "yyyy-MM-dd");
    setActiveDay(formattedDate);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedEvent = eventsByDate?.[activeDay]?.find(
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
      <DragMonitor onDayChange={handleDayChange} />
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
          <div className="shadow-lg opacity-90">
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
});
