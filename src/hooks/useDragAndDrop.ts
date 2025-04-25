import { useCallback, useRef, useState } from "react";
import { addDays, format, parseISO, subDays } from "date-fns";

type DragAndDropProps = {
  onDayChange: (newDate: string) => void;
  currentDate: string;
  threshold?: number;
  holdTime?: number;
};

export const useDragAndDrop = ({
  onDayChange,
  currentDate,
  threshold = 100,
  holdTime = 1500,
}: DragAndDropProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);

  const handleDragStart = useCallback((event: React.DragEvent) => {
    setIsDragging(true);
    startPositionRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }, []);

  const handleDrag = useCallback(
    (event: React.DragEvent) => {
      if (!startPositionRef.current) return;

      const deltaX = event.clientX - startPositionRef.current.x;
      const deltaY = event.clientY - startPositionRef.current.y;

      setDragPosition({ x: deltaX, y: deltaY });

      // Check if we're near the screen edge
      const screenWidth = window.innerWidth;
      const isNearLeftEdge = event.clientX < threshold;
      const isNearRightEdge = event.clientX > screenWidth - threshold;

      if (isNearLeftEdge || isNearRightEdge) {
        if (!holdTimerRef.current) {
          holdTimerRef.current = setTimeout(() => {
            const currentDateObj = parseISO(currentDate);
            const newDate = isNearLeftEdge
              ? subDays(currentDateObj, 1)
              : addDays(currentDateObj, 1);
            onDayChange(format(newDate, "yyyy-MM-dd"));
            holdTimerRef.current = null;
          }, holdTime);
        }
      } else {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
      }
    },
    [currentDate, onDayChange, threshold, holdTime],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragPosition({ x: 0, y: 0 });
    startPositionRef.current = null;
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  return {
    isDragging,
    dragPosition,
    handleDragStart,
    handleDrag,
    handleDragEnd,
  };
}; 