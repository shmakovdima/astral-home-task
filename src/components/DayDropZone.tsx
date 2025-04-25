import { useCallback, useRef } from "react";
import { useDrop } from "react-dnd";

type DayDropZoneProps = {
  children: React.ReactNode;
  onDayChange: (daysToMove: number) => void;
  onDrop?: () => void;
};

export const DayDropZone = ({
  children,
  onDayChange,
  onDrop,
}: DayDropZoneProps) => {
  const lastChangeTimeRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const lastDirectionRef = useRef<"left" | "right" | null>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "event",
    drop: () => {
      isDraggingRef.current = false;
      lastDirectionRef.current = null;
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      onDrop?.();
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const startScrolling = useCallback(
    (direction: "left" | "right") => {
      if (scrollIntervalRef.current) return;

      scrollIntervalRef.current = setInterval(() => {
        onDayChange(direction === "left" ? -1 : 1);
      }, 300);
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
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;

      let direction: "left" | "right" | null = null;

      if (x < width * 0.25) {
        direction = "left";
      } else if (x > width * 0.75) {
        direction = "right";
      }

      if (direction && direction !== lastDirectionRef.current) {
        lastDirectionRef.current = direction;
        startScrolling(direction);
      } else if (!direction) {
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
