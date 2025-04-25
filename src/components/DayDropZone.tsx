import { useCallback, useRef } from "react";
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

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "event",
    drop: () => {
      const totalDaysMoved = daysMovedRef.current;
      isDraggingRef.current = false;
      lastDirectionRef.current = null;
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      onDrop?.(totalDaysMoved);
      return { daysToMove: totalDaysMoved };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const startScrolling = useCallback(
    (direction: "left" | "right") => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }

      const move = direction === "left" ? -1 : 1;
      daysMovedRef.current += move;
      onDayChange(move);

      scrollIntervalRef.current = setInterval(() => {
        daysMovedRef.current += move;
        onDayChange(move);
      }, 200);
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

      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        daysMovedRef.current = 0;
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;

      let direction: "left" | "right" | null = null;

      if (x < width * 0.2) {
        direction = "left";
      } else if (x > width * 0.8) {
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
    },
    [startScrolling, stopScrolling],
  );

  return (
    <div
      className={`relative transition-colors duration-200 ${
        isOver ? "bg-blue-50" : ""
      }`}
      onClick={(e) => e.stopPropagation()}
      onDragOver={handleDragOver}
      onDragLeave={stopScrolling}
      onTouchEnd={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      ref={drop as unknown as React.RefObject<HTMLDivElement>}
    >
      {children}
    </div>
  );
};
