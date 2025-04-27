import { useCallback, useEffect, useRef, useState } from "react";
import { addDays, format, isSameDay } from "date-fns";

import { DayEventCard } from "@/components/DayEventCard";
import { DayHeader } from "@/components/DayHeader";
import { DayNavigation } from "@/components/DayNavigation";
import { useAllEvents } from "@/hooks/api/useEvents";
import { useUpdateEventDate } from "@/hooks/api/useUpdateEventDate";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import type { Event } from "@/models";
import {
  DndContext,
  type DragMoveEvent,
  DragOverlay,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
  useDndMonitor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

const EDGE_THRESHOLD = 0.2;
const HOLD_DURATION = 1500;

const DragMonitor = ({
  onDayChange,
  onEdgeChange,
}: {
  onDayChange: (direction: "prev" | "next") => void;
  onEdgeChange?: (isLeft: boolean, isRight: boolean, progress?: number) => void;
}) => {
  const edgeTimeoutRef = useRef<number | null>(null);
  const lastTransitionTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastDeltaRef = useRef({ x: 0 });
  const lastDirectionRef = useRef<"prev" | "next" | null>(null);
  const wasInEdgeZoneRef = useRef(false);

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
    const isInEdgeZone = Math.abs(x) > threshold;

    // Reset timer when entering edge zone
    if (!wasInEdgeZoneRef.current && isInEdgeZone) {
      lastTransitionTimeRef.current = Date.now();
    }

    wasInEdgeZoneRef.current = isInEdgeZone;

    if (x > threshold) {
      newDirection = "next";

      const progress = Math.min(
        (Date.now() - lastTransitionTimeRef.current) / HOLD_DURATION,
        1,
      );

      onEdgeChange?.(false, true, progress);
    } else if (x < -threshold) {
      newDirection = "prev";

      const progress = Math.min(
        (Date.now() - lastTransitionTimeRef.current) / HOLD_DURATION,
        1,
      );

      onEdgeChange?.(true, false, progress);
    } else {
      newDirection = null;
      onEdgeChange?.(false, false, 0);
      wasInEdgeZoneRef.current = false;
    }

    if (newDirection === null && lastDirectionRef.current !== null) {
      clearTimers();
    }

    if (newDirection) {
      const currentTime = Date.now();

      const timeSinceLastTransition =
        currentTime - lastTransitionTimeRef.current;

      if (timeSinceLastTransition > HOLD_DURATION && !edgeTimeoutRef.current) {
        edgeTimeoutRef.current = window.setTimeout(() => {
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
      wasInEdgeZoneRef.current = false;
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
      wasInEdgeZoneRef.current = false;
      onEdgeChange?.(false, false, 0);
    },
    onDragCancel: () => {
      clearTimers();
      lastDeltaRef.current = { x: 0 };
      lastDirectionRef.current = null;
      wasInEdgeZoneRef.current = false;
      onEdgeChange?.(false, false, 0);
    },
  });

  useEffect(
    () => () => {
      clearTimers();
    },
    [],
  );

  return null;
};

export const DailyView = () => {
  const [activeDay, setActiveDay] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [draggedHeight, setDraggedHeight] = useState<number | null>(null);
  const [isNearLeftEdge, setIsNearLeftEdge] = useState(false);
  const [isNearRightEdge, setIsNearRightEdge] = useState(false);
  const dragOverlayRef = useRef<HTMLDivElement>(null);
  const { data: eventsByDate } = useAllEvents();
  const { mutate: updateEventDate } = useUpdateEventDate();
  const lastChangeRef = useRef<number>(0);
  const originalEventDateRef = useRef<string | null>(null);
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
  const isCurrentDay = isSameDay(new Date(activeDay), new Date());

  const showDropPlaceholder =
    activeEvent && originalEventDateRef.current !== activeDay;

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
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <DragMonitor
        onDayChange={handleDayChange}
        onEdgeChange={handleEdgeChange}
      />
      <div
        className="flex flex-col gap-4 min-h-[100dvh] relative"
        ref={ref}
      >
        <DayNavigation activeDay={activeDay} setActiveDay={setActiveDay} />
        <div className="flex flex-col gap-4 p-4 flex-1">
          <DayHeader date={activeDay} />
          <div className="grid grid-cols-1 gap-4">
            {showDropPlaceholder ? (
              <div
                className="rounded-lg border-2 border-dashed border-violet-200 bg-violet-50/50 flex items-center justify-center"
                style={{
                  minHeight: draggedHeight ? `${draggedHeight}px` : "226px",
                }}
              >
                <span className="text-sm font-medium text-violet-500">
                  Drop event here
                </span>
              </div>
            ) : null}
            {!showDropPlaceholder && dayEvents.length === 0 && (
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
            {dayEvents.map((event: Event) => (
              <DayEventCard key={event.id} {...event} />
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={null} modifiers={[]}>
          {activeEvent ? (
            <div className="shadow-lg opacity-50" ref={dragOverlayRef}>
              <DayEventCard {...activeEvent} isDragOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </div>
      {isNearLeftEdge ? (
        <div className="fixed left-0 min-h-[calc(100dvh_-_160px)] top-0 w-[100px] bg-gradient-to-r h-screen from-blue-500/20 to-transparent z-[100] flex items-start pt-[195px] justify-start">
          <div className="ml-4 relative">
            <div className="relative z-10">
              <div className="bg-blue-500 rounded-full p-2 text-white relative">
                <svg
                  className="absolute top-0 left-0 -rotate-90"
                  height="40"
                  width="40"
                >
                  <circle
                    cx="20"
                    cy="20"
                    fill="none"
                    r="19"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    fill="none"
                    r="19"
                    stroke="url(#gradient)"
                    strokeDasharray="120 120"
                    strokeDashoffset={120 - edgeProgress * 120}
                    strokeWidth="2"
                  />
                  <defs>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      id="gradient"
                      x1="20"
                      x2="20"
                      y1="0"
                      y2="40"
                    >
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
                <svg
                  className="w-6 h-6 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 12H5m7 7l-7-7 7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isNearRightEdge ? (
        <div className="fixed h-full min-h-[calc(100dvh_-_160px)] right-0 top-0 w-[100px] bg-gradient-to-l h-screen from-blue-500/20 to-transparent z-[100] flex items-start pt-[195px] justify-end">
          <div className="mr-4 relative">
            <div className="relative z-10">
              <div className="bg-blue-500 rounded-full p-2 text-white relative">
                <svg
                  className="absolute top-0 left-0 -rotate-90"
                  height="40"
                  width="40"
                >
                  <circle
                    cx="20"
                    cy="20"
                    fill="none"
                    r="19"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    fill="none"
                    r="19"
                    stroke="url(#gradient)"
                    strokeDasharray="120 120"
                    strokeDashoffset={120 - edgeProgress * 120}
                    strokeWidth="2"
                  />
                  <defs>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      id="gradient"
                      x1="20"
                      x2="20"
                      y1="0"
                      y2="40"
                    >
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
                <svg
                  className="w-6 h-6 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 12h14m-7-7l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </DndContext>
  );
};
