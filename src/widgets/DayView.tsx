"use client";

import { useCallback, useRef, useState } from "react";
import {
  DndContext,
  type DragMoveEvent,
  DragOverlay,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { addDays, format, isSameDay, parseISO } from "date-fns";

import { DayDragMonitor } from "@/components/daily/DayDragMonitor";
import { DayEventCard } from "@/components/daily/DayEventCard";
import { DayHeader } from "@/components/daily/DayHeader";
import { DayNavigation } from "@/components/daily/DayNavigation";
import { DropEventPlaceholder } from "@/components/shared/DropEventPlaceholder";
import { EdgeIndicator } from "@/components/shared/EdgeIndicator";
import { useAllEvents } from "@/hooks/api/useEvents";
import { useUpdateEventDate } from "@/hooks/api/useUpdateEventDate";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import type { Event } from "@/models";
import { useToastContext } from "@/providers/ToastProvider";

export const DayView = () => {
  const { showToast } = useToastContext();
  const [activeDay, setActiveDay] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [draggedHeight, setDraggedHeight] = useState<number | null>(null);
  const [isNearLeftEdge, setIsNearLeftEdge] = useState(false);
  const [isNearRightEdge, setIsNearRightEdge] = useState(false);
  const lastChangeRef = useRef<number>(0);
  const originalEventDateRef = useRef<string | null>(null);
  const { data: eventsByDate } = useAllEvents();

  const { mutate: updateEventDate } = useUpdateEventDate({
    onError: () => {
      showToast(
        "API Error: Failed to update event date. Reload browser - msw service worker stopped working",
      );
    },
  });

  const [edgeProgress, setEdgeProgress] = useState(0);

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
    const currentTime = Date.now();

    if (currentTime - lastChangeRef.current < 100) {
      return;
    }

    setActiveDay((currentActiveDay) => {
      const daysToMove = direction === "prev" ? -1 : 1;
      const baseDate = parseISO(currentActiveDay);
      const newDate = addDays(baseDate, daysToMove);

      return format(newDate, "yyyy-MM-dd");
    });

    lastChangeRef.current = currentTime;
  }, []);

  const { ref } = useSwipeNavigation({
    onSwipe: handleDayChange,
    minSwipeDistance: 50,
  });

  const handleDragMove = (event: DragMoveEvent) => {
    const { active } = event;

    if (active.rect.current.translated) {
      setDraggedHeight(active.rect.current.translated.height);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    const draggedEvent = eventsByDate?.[activeDay]?.find(
      (e) => e.id === active.data.current?.id,
    );

    if (draggedEvent) {
      setActiveEvent(draggedEvent);
      originalEventDateRef.current = activeDay;

      if (active.rect.current.initial) {
        setDraggedHeight(active.rect.current.initial.height);
      }
    }
  };

  const handleDragEnd = () => {
    const originalDate = originalEventDateRef.current;

    if (activeEvent && originalDate && originalDate !== activeDay) {
      updateEventDate({
        id: activeEvent.id,
        timestamp: `${activeDay}T${activeEvent.timestamp.split("T")[1]}`,
      });
    }

    setActiveEvent(null);
    setDraggedHeight(null);
    originalEventDateRef.current = null;
  };

  const dayEvents = eventsByDate?.[activeDay] || [];
  const isCurrentDay = isSameDay(parseISO(activeDay), new Date());

  const showDropPlaceholder =
    !!activeEvent && (originalEventDateRef.current || "") !== activeDay;

  const handleEdgeChange = useCallback(
    (isLeft: boolean, isRight: boolean, progress: number = 0) => {
      setIsNearLeftEdge(isLeft);
      setIsNearRightEdge(isRight);
      setEdgeProgress(progress);
    },
    [],
  );

  return (
    <DndContext
      id="daily-view-dnd"
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <DayDragMonitor
        onDayChange={handleDayChange}
        onEdgeChange={handleEdgeChange}
      />
      <div className="pb-safe relative flex min-h-dvh flex-col gap-4" ref={ref}>
        <DayNavigation activeDay={activeDay} setActiveDay={setActiveDay} />
        <div className="flex flex-col gap-4 p-4">
          <DayHeader date={activeDay} />
          <div className="grid grid-cols-1 gap-4">
            {showDropPlaceholder ? (
              <DropEventPlaceholder minHeight={draggedHeight || 226} />
            ) : null}
            {!showDropPlaceholder && dayEvents.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <div className="flex flex-col items-center gap-4">
                  <svg
                    className="h-8 w-8 text-gray-400"
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
            {dayEvents.map((event: Event) => (
              <DayEventCard
                disabledAnimation={showDropPlaceholder}
                key={`${event.id}-${showDropPlaceholder}`}
                {...event}
              />
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={null} modifiers={[]}>
          {activeEvent ? (
            <div className="opacity-50 shadow-lg">
              <DayEventCard {...activeEvent} disabledAnimation />
            </div>
          ) : null}
        </DragOverlay>
      </div>
      <div className="relative">
        <EdgeIndicator
          edgeProgress={edgeProgress}
          isVisible={isNearLeftEdge}
          position="left"
          type="daily"
        />
        <EdgeIndicator
          edgeProgress={edgeProgress}
          isVisible={isNearRightEdge}
          position="right"
          type="daily"
        />
      </div>
    </DndContext>
  );
};
