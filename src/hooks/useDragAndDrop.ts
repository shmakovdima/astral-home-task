import { useCallback, useRef, useState } from "react";
import { addDays, format, parseISO, subDays } from "date-fns";

type DragAndDropProps = {
  onDayChange: (newDate: string) => void;
  currentDate: string;
  threshold?: number;
  holdTime?: number;
  scrollInterval?: number;
  onDragEnd?: (newDate: string) => void;
};

export const useDragAndDrop = ({
  onDayChange,
  currentDate,
  threshold = 100,
  holdTime = 1500,
  scrollInterval = 300,
  onDragEnd,
}: DragAndDropProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);
  const isScrollingRef = useRef(false);
  const lastDateRef = useRef<string>(currentDate);
  const directionRef = useRef<"left" | "right" | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const isMenuMovingRef = useRef(false);
  const isEdgeHoldingRef = useRef(false);

  const startScrolling = useCallback(
    (direction: "left" | "right") => {
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;
      directionRef.current = direction;
      lastScrollTimeRef.current = Date.now();
      isMenuMovingRef.current = true;
      isEdgeHoldingRef.current = true;

      const scroll = () => {
        if (!directionRef.current || !isEdgeHoldingRef.current) return;

        const now = Date.now();
        if (now - lastScrollTimeRef.current < scrollInterval) return;
        lastScrollTimeRef.current = now;

        const currentDateObj = parseISO(lastDateRef.current);

        const newDate =
          directionRef.current === "left"
            ? subDays(currentDateObj, 1)
            : addDays(currentDateObj, 1);

        const formattedDate = format(newDate, "yyyy-MM-dd");
        lastDateRef.current = formattedDate;
        onDayChange(formattedDate);
      };

      scroll();
      scrollIntervalRef.current = setInterval(scroll, scrollInterval);
    },
    [onDayChange, scrollInterval],
  );

  const stopScrolling = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    isScrollingRef.current = false;
    directionRef.current = null;
    isMenuMovingRef.current = false;
    isEdgeHoldingRef.current = false;
  }, []);

  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      setIsDragging(true);

      startPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      lastDateRef.current = currentDate;
      isMenuMovingRef.current = false;
      isEdgeHoldingRef.current = false;
    },
    [currentDate],
  );

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
            startScrolling(isNearLeftEdge ? "left" : "right");
            holdTimerRef.current = null;
          }, holdTime);
        }
      } else {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }

        isEdgeHoldingRef.current = false;
        stopScrolling();
      }
    },
    [holdTime, startScrolling, stopScrolling, threshold],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragPosition({ x: 0, y: 0 });
    startPositionRef.current = null;

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    stopScrolling();

    if (onDragEnd && lastDateRef.current !== currentDate) {
      onDragEnd(lastDateRef.current);
    }
  }, [currentDate, onDragEnd, stopScrolling]);

  return {
    isDragging,
    dragPosition,
    handleDragStart,
    handleDrag,
    handleDragEnd,
  };
};
