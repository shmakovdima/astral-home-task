import { useCallback, useEffect, useRef, useState } from "react";
import { useDrop } from "react-dnd";

type DayDropZoneDailyProps = {
  children: React.ReactNode;
  onDayChange: (daysToMove: number) => void;
  onDrop?: (daysToMove: number) => void;
};

export const DayDropZoneDaily = ({
  children,
  onDayChange,
  onDrop,
}: DayDropZoneDailyProps) => {
  const isDraggingRef = useRef(false);
  const lastDirectionRef = useRef<"left" | "right" | null>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const daysMovedRef = useRef(0);
  const [lastDragPosition, setLastDragPosition] = useState<number | null>(null);
  const dropTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const draggedEventId = useRef<string | null>(null);
  const isOverDropZone = useRef(false);

  useEffect(
    () => () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }

      if (dropTimeoutRef.current) {
        clearTimeout(dropTimeoutRef.current);
      }

      isDraggingRef.current = false;
      lastDirectionRef.current = null;
      setLastDragPosition(null);
      daysMovedRef.current = 0;
      touchStartX.current = null;
      touchStartY.current = null;
      draggedEventId.current = null;
      isOverDropZone.current = false;
    },
    [],
  );

  const cleanupDragState = useCallback(() => {
    isDraggingRef.current = false;
    lastDirectionRef.current = null;
    setLastDragPosition(null);
    touchStartX.current = null;
    touchStartY.current = null;
    draggedEventId.current = null;
    isOverDropZone.current = false;

    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    if (dropTimeoutRef.current) {
      clearTimeout(dropTimeoutRef.current);
      dropTimeoutRef.current = null;
    }

    daysMovedRef.current = 0;
  }, []);

  const stopScrolling = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleDragEnd = () => {
      if (!draggedEventId.current) return;

      const eventCard = document.querySelector(
        `.event-card[data-event-id="${draggedEventId.current}"]`,
      ) as HTMLElement;

      if (eventCard) {
        eventCard.style.transform = "";
        eventCard.style.opacity = "";
      }

      cleanupDragState();
      onDrop?.(0);
    };

    const handleTouchEndGlobal = () => {
      stopScrolling();
      cleanupDragState();
      onDrop?.(0);
    };

    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("touchend", handleTouchEndGlobal);

    return () => {
      document.removeEventListener("dragend", handleDragEnd);
      document.removeEventListener("touchend", handleTouchEndGlobal);
    };
  }, [stopScrolling, cleanupDragState, onDrop]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "event",
    drop: () => {
      if (!isDraggingRef.current) return;
      const totalDaysMoved = daysMovedRef.current;
      cleanupDragState();
      onDrop?.(totalDaysMoved);
      return { daysToMove: totalDaysMoved };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  useEffect(() => {
    isOverDropZone.current = isOver;
  }, [isOver]);

  const startScrolling = useCallback(
    (direction: "left" | "right") => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }

      const move = direction === "left" ? -1 : 1;
      daysMovedRef.current += move;
      onDayChange(daysMovedRef.current);

      scrollIntervalRef.current = setInterval(() => {
        daysMovedRef.current += move;
        onDayChange(daysMovedRef.current);
      }, 500);
    },
    [onDayChange],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        daysMovedRef.current = 0;
        setLastDragPosition(e.clientX);
        
        const target = e.target as HTMLElement;
        const eventCard = target.closest(".event-card") as HTMLElement;
        if (eventCard) {
          const eventId = eventCard.dataset.eventId;
          if (eventId) {
            draggedEventId.current = eventId;
            eventCard.style.transform = "scale(0.95)";
            eventCard.style.opacity = "0.8";
          }
        }
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;

      if (lastDragPosition !== null) {
        const movement = e.clientX - lastDragPosition;

        if (Math.abs(movement) > 5) {
          let direction: "left" | "right" | null = null;

          if (x < width * 0.2 || movement < 0) {
            direction = "left";
          } else if (x > width * 0.8 || movement > 0) {
            direction = "right";
          }

          if (direction) {
            if (direction !== lastDirectionRef.current) {
              lastDirectionRef.current = direction;
              startScrolling(direction);
            }
          } else {
            stopScrolling();
          }
        }
      }

      setLastDragPosition(e.clientX);
    },
    [startScrolling, stopScrolling, lastDragPosition],
  );

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const eventCard = target.closest(".event-card") as HTMLElement;
    if (!eventCard) return;

    const eventId = eventCard.dataset.eventId;
    if (!eventId) return;

    draggedEventId.current = eventId;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDraggingRef.current = true;
    daysMovedRef.current = 0;
    lastDirectionRef.current = null;

    eventCard.style.transform = "scale(0.95)";
    eventCard.style.opacity = "0.8";
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (
        !isDraggingRef.current ||
        !touchStartX.current ||
        !touchStartY.current
      ) {
        return;
      }

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = Math.abs(touch.clientY - touchStartY.current);

      if (deltaY < Math.abs(deltaX) / 2) {
        e.preventDefault();

        if (Math.abs(deltaX) > 5) {
          let direction: "left" | "right" | null = null;

          if (deltaX < 0) {
            direction = "left";
          } else if (deltaX > 0) {
            direction = "right";
          }

          if (direction) {
            if (direction !== lastDirectionRef.current) {
              lastDirectionRef.current = direction;
              startScrolling(direction);
            }
          } else {
            stopScrolling();
          }
        }
      }
    },
    [startScrolling, stopScrolling],
  );

  const handleTouchEnd = () => {
    if (!draggedEventId.current) return;

    const eventCard = document.querySelector(
      `.event-card[data-event-id="${draggedEventId.current}"]`,
    ) as HTMLElement;

    if (eventCard) {
      eventCard.style.transform = "";
      eventCard.style.opacity = "";
    }

    if (daysMovedRef.current !== 0) {
      onDrop?.(daysMovedRef.current);
    }

    draggedEventId.current = null;
    isDraggingRef.current = false;
    touchStartX.current = null;
    touchStartY.current = null;
    daysMovedRef.current = 0;
    lastDirectionRef.current = null;
    stopScrolling();
  };

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (dropTimeoutRef.current) {
        clearTimeout(dropTimeoutRef.current);
      }

      dropTimeoutRef.current = setTimeout(() => {
        if (!isOverDropZone.current) {
          cleanupDragState();
          onDrop?.(0);
        }
      }, 100);
    },
    [cleanupDragState, onDrop],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isDraggingRef.current) return;

      const totalDaysMoved = daysMovedRef.current;
      cleanupDragState();
      onDrop?.(totalDaysMoved);
    },
    [cleanupDragState, onDrop],
  );

  return (
    <div
      className={`relative transition-colors duration-200  ${
        isOver ? "bg-blue-50" : ""
      }`}
      onClick={(e) => e.stopPropagation()}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      ref={drop as unknown as React.RefObject<HTMLDivElement>}
    >
      {children}
    </div>
  );
};
