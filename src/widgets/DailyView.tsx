import { useState, useCallback, useEffect, useRef, memo } from "react";
import { addDays, format, isSameDay } from "date-fns";

import { DayEventCard } from "@/components/DayEventCard";
import { DayHeader } from "@/components/DayHeader";
import { DaysNavigation } from "@/components/DaysNavigation";
import { useAllEvents } from "@/hooks/useEvents";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useUpdateEventDate } from "@/hooks/useUpdateEventDate";
import type { Event } from "@/models";
import {
  DndContext,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDndMonitor,
} from "@dnd-kit/core";

const EDGE_THRESHOLD = 0.2;
const HOLD_DURATION = 1500;

const DragMonitor = ({ onDayChange }: { onDayChange: (direction: "prev" | "next") => void }) => {
  const edgeTimeoutRef = useRef<number | null>(null);
  const lastTransitionTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastDeltaRef = useRef({ x: 0 });
  const lastDirectionRef = useRef<"prev" | "next" | null>(null);

  const clearTimers = () => {
    if (edgeTimeoutRef.current) {
      window.clearTimeout(edgeTimeoutRef.current);
      edgeTimeoutRef.current = null;
    }
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const checkPosition = () => {
    if (!onDayChange) return;

    const screenWidth = window.innerWidth;
    const threshold = screenWidth * EDGE_THRESHOLD;
    let newDirection: "prev" | "next" | null = null;

    const { x } = lastDeltaRef.current;

    if (x > threshold) {
      newDirection = "next";
    } else if (x < -threshold) {
      newDirection = "prev";
    } else {
      newDirection = null;
    }

    console.log("x", Date.now() - lastTransitionTimeRef.current, x, newDirection);

    if (newDirection === null && lastDirectionRef.current !== null) {
      clearTimers();
      lastTransitionTimeRef.current = Date.now();
    }

    if (newDirection) {
      const currentTime = Date.now();
      const timeSinceLastTransition = currentTime - lastTransitionTimeRef.current;

      if (timeSinceLastTransition > HOLD_DURATION && !edgeTimeoutRef.current) {
        edgeTimeoutRef.current = window.setTimeout(() => {
          console.log("changed");
          onDayChange(newDirection);
          lastTransitionTimeRef.current = Date.now();
          edgeTimeoutRef.current = null;
        }, 0);
      }
    }

    lastDirectionRef.current = newDirection;
    rafRef.current = requestAnimationFrame(checkPosition);
  };

  useDndMonitor({
    onDragStart: () => {
      lastTransitionTimeRef.current = Date.now();
      lastDeltaRef.current = { x: 0 };
      lastDirectionRef.current = null;
      clearTimers();
      rafRef.current = requestAnimationFrame(checkPosition);
    },
    onDragMove: (event: DragMoveEvent) => {
      lastDeltaRef.current = event.delta;
    },
    onDragEnd: () => {
      clearTimers();
      lastDeltaRef.current = { x: 0 };
      lastDirectionRef.current = null;
    },
    onDragCancel: () => {
      clearTimers();
      lastDeltaRef.current = { x: 0 };
      lastDirectionRef.current = null;
    }
  });

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  return null;
};

export const DailyView = memo(() => {
  const [activeDay, setActiveDay] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const { data: eventsByDate } = useAllEvents();
  const { mutate: updateEventDate } = useUpdateEventDate();
  const lastChangeRef = useRef<number>(0);
  const originalEventDateRef = useRef<string | null>(null);

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

  const handleDayChange = useCallback((direction: "prev" | "next") => {
    console.log("handleDayChange", direction, activeDay);
    const currentTime = Date.now();
    
    if (currentTime - lastChangeRef.current < 100) {
      return;
    }
    
    setActiveDay(currentActiveDay => {
      const daysToMove = direction === "prev" ? -1 : 1;
      const baseDate = new Date(currentActiveDay);
      const newDate = addDays(baseDate, daysToMove);
      return format(newDate, "yyyy-MM-dd");
    });
    
    lastChangeRef.current = currentTime;
  }, []);

  const { ref } = useSwipeNavigation({
    onSwipe: handleDayChange,
    minSwipeDistance: 50,
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedEvent = eventsByDate?.[activeDay]?.find(
      (e) => e.id === active.data.current?.id,
    );
    if (draggedEvent) {
      setActiveEvent(draggedEvent);
      originalEventDateRef.current = activeDay;
    }
  };

  const handleDragEnd = () => {
    const originalDate = originalEventDateRef.current;
    
    if (activeEvent && originalDate && originalDate !== activeDay) {
      updateEventDate({
        id: activeEvent.id,
        timestamp: `${activeDay}T${activeEvent.timestamp.split('T')[1]}`
      });
    }
    
    setActiveEvent(null);
    originalEventDateRef.current = null;
  };

  const dayEvents = eventsByDate?.[activeDay] || [];
  const isCurrentDay = isSameDay(new Date(activeDay), new Date());
  const showDropPlaceholder = activeEvent && originalEventDateRef.current !== activeDay;

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <DragMonitor onDayChange={handleDayChange} />
      <div ref={ref} className="flex flex-col gap-4 min-h-[calc(100vh_-_200px)]">
        <DaysNavigation activeDay={activeDay} setActiveDay={setActiveDay} />
        <div className="flex flex-col gap-4 p-4">
          <DayHeader date={activeDay} />
          <div className="grid grid-cols-1 gap-4">
            {showDropPlaceholder && (
              <div 
                className="rounded-lg border-2 border-dashed border-violet-200 bg-violet-50/50 h-[208px] flex items-center justify-center"
              >
                <span className="text-sm font-medium text-violet-500">
                  Drop event here
                </span>
              </div>
            )}
            {dayEvents.length > 0 ? (
              dayEvents.map((event: Event) => (
                <DayEventCard
                  key={event.id}
                  {...event}
                  onDayChange={() => null}
                />
              ))
            ) : !showDropPlaceholder ? (
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
            ) : null}
          </div>
        </div>
      </div>
      <DragOverlay dropAnimation={null} modifiers={[]}>
        {activeEvent ? (
          <div className="shadow-lg opacity-90">
            <DayEventCard
              {...activeEvent}
              isDragOverlay
              onDayChange={() => null}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
});
