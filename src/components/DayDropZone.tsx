import { useCallback, useRef, useState, useEffect } from "react";
import { useDrop } from "react-dnd";

type DayDropZoneProps = {
  children: React.ReactNode;
  onDayChange: (daysToMove: number) => void;
  onDrop?: (daysToMove: number) => void;
};

export const DayDropZone = ({
  children,
  onDayChange,
  onDrop,
}: DayDropZoneProps) => {
  const isDraggingRef = useRef(false);
  const lastDirectionRef = useRef<"left" | "right" | null>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const daysMovedRef = useRef(0);
  const [lastDragPosition, setLastDragPosition] = useState<number | null>(null);
  const dropTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function to prevent stuck states
  useEffect(() => {
    return () => {
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
    };
  }, []);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "event",
    drop: () => {
      const totalDaysMoved = daysMovedRef.current;
      cleanupDragState();
      onDrop?.(totalDaysMoved);
      return { daysToMove: totalDaysMoved };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const cleanupDragState = useCallback(() => {
    isDraggingRef.current = false;
    lastDirectionRef.current = null;
    setLastDragPosition(null);
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

  const stopScrolling = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        daysMovedRef.current = 0;
        setLastDragPosition(e.clientX);
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

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Add a small delay before cleanup to prevent stuck states
      if (dropTimeoutRef.current) {
        clearTimeout(dropTimeoutRef.current);
      }
      
      dropTimeoutRef.current = setTimeout(() => {
        cleanupDragState();
      }, 100);
    },
    [cleanupDragState],
  );

  return (
    <div
      className={`relative transition-colors duration-200 min-h-[calc(100vh_-_200px)] ${
        isOver ? "bg-blue-50" : ""
      }`}
      onClick={(e) => e.stopPropagation()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onTouchEnd={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      ref={drop as unknown as React.RefObject<HTMLDivElement>}
    >
      {children}
    </div>
  );
};
