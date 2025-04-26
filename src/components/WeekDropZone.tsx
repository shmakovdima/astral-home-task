import { useCallback, useEffect, useRef } from "react";
import { useDrop } from "react-dnd";

type WeekDropZoneProps = {
  children: React.ReactNode;
  onDayChange: (daysToMove: number) => void;
  onDrop: (daysToMove: number) => void;
  onWeekChange?: (direction: "prev" | "next") => void;
  onEdgeChange?: (isLeft: boolean, isRight: boolean) => void;
};

export const WeekDropZone = ({
  children,
  onDayChange,
  onDrop,
  onWeekChange,
  onEdgeChange,
}: WeekDropZoneProps) => {
  const startX = useRef<number | null>(null);
  const daysToMove = useRef<number>(0);
  const weekChangeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasDroppedRef = useRef(false);
  const edgeThreshold = 50;
  const weekChangeRef = useRef<"prev" | "next" | null>(null);

  const handleEdgeChange = useCallback(
    (left: boolean, right: boolean) => {
      onEdgeChange?.(left, right);
    },
    [onEdgeChange],
  );

  useEffect(() => {
    const handleDragEnd = () => {
      startX.current = null;
      daysToMove.current = 0;
      weekChangeRef.current = null;
      handleEdgeChange(false, false);
      hasDroppedRef.current = false;
      onDayChange(0);
      onEdgeChange?.(false, false);
    };

    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, [handleEdgeChange, onDayChange, onEdgeChange]);

  useEffect(
    () => () => {
      if (weekChangeTimerRef.current) {
        clearTimeout(weekChangeTimerRef.current);
      }
    },
    [],
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "event",
      hover: (_, monitor) => {
        if (!monitor.isOver()) {
          hasDroppedRef.current = false;
          handleEdgeChange(false, false);
          return;
        }

        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;

        if (startX.current === null) {
          startX.current = clientOffset.x;
          return;
        }

        const deltaX = clientOffset.x - startX.current;
        const dayWidth = window.innerWidth / 7;
        const newDaysToMove = Math.round(deltaX / dayWidth);

        const isLeftEdge = clientOffset.x < edgeThreshold;

        const isRightEdge =
          clientOffset.x > window.innerWidth - edgeThreshold - 1;

        handleEdgeChange(isLeftEdge, isRightEdge);

        if (isLeftEdge && onWeekChange) {
          if (!weekChangeTimerRef.current) {
            weekChangeTimerRef.current = setTimeout(() => {
              onWeekChange("prev");
              weekChangeRef.current = "prev";
              startX.current = clientOffset.x;
              weekChangeTimerRef.current = null;
            }, 500);
          }
        } else if (isRightEdge && onWeekChange) {
          if (!weekChangeTimerRef.current) {
            weekChangeTimerRef.current = setTimeout(() => {
              onWeekChange("next");
              weekChangeRef.current = "next";
              startX.current = clientOffset.x;
              weekChangeTimerRef.current = null;
            }, 500);
          }
        } else if (weekChangeTimerRef.current) {
          clearTimeout(weekChangeTimerRef.current);
          weekChangeTimerRef.current = null;
        }

        if (newDaysToMove !== daysToMove.current) {
          daysToMove.current = newDaysToMove;
          onDayChange(newDaysToMove);
        }
      },
      drop: (_, monitor) => {
        if (!monitor.isOver()) {
          startX.current = null;
          daysToMove.current = 0;
          weekChangeRef.current = null;
          handleEdgeChange(false, false);
          hasDroppedRef.current = false;
          onDayChange(0);
          return { daysToMove: 0 };
        }

        if (weekChangeTimerRef.current) {
          clearTimeout(weekChangeTimerRef.current);
          weekChangeTimerRef.current = null;
        }

        let finalDaysToMove = daysToMove.current;

        if (weekChangeRef.current === "prev") {
          finalDaysToMove = -7 + (finalDaysToMove % 7);
        } else if (weekChangeRef.current === "next") {
          finalDaysToMove = 7 + (finalDaysToMove % 7);
        }

        const result = { daysToMove: finalDaysToMove };

        if (!hasDroppedRef.current) {
          hasDroppedRef.current = true;
          onDrop(finalDaysToMove);

          setTimeout(() => {
            hasDroppedRef.current = false;
          }, 200);
        }

        startX.current = null;
        daysToMove.current = 0;
        weekChangeRef.current = null;
        handleEdgeChange(false, false);

        return result;
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [handleEdgeChange, onDayChange, onDrop, onWeekChange],
  );

  return (
    <div
      className={`w-full h-full relative ${isOver ? "bg-blue-50/30" : ""}`}
      ref={drop as unknown as React.RefObject<HTMLDivElement>}
    >
      {children}
    </div>
  );
};
