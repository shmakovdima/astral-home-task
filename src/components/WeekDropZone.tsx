import { useCallback, useEffect, useRef } from "react";
import { useDrop } from "react-dnd";

const WEEK_CHANGE_DELAY = 1500;

type Props = {
  children: React.ReactNode;
  onDayChange: (daysToMove: number) => void;
  onDrop: (daysToMove: number) => void;
  onEdgeChange: (isLeft: boolean, isRight: boolean) => void;
  onWeekChange?: (direction: "prev" | "next") => void;
  onWeekChangeProgress?: (progress: number) => void;
};

export const WeekDropZone = ({
  children,
  onDayChange,
  onDrop,
  onEdgeChange,
  onWeekChange,
  onWeekChangeProgress,
}: Props) => {
  const startX = useRef<number | null>(null);
  const daysToMove = useRef<number>(0);
  const weekChangeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasDroppedRef = useRef(false);
  const edgeThreshold = 60;
  const weekChangeRef = useRef<"prev" | "next" | null>(null);

  const handleEdgeChange = useCallback(
    (left: boolean, right: boolean) => {
      onEdgeChange(left, right);
    },
    [onEdgeChange],
  );

  const startWeekChangeTimer = useCallback(
    (direction: "prev" | "next", clientX: number) => {
      if (weekChangeTimerRef.current) return;

      const isInLeftEdge = clientX < edgeThreshold;
      const isInRightEdge = clientX > window.innerWidth - edgeThreshold - 1;

      weekChangeTimerRef.current = setTimeout(() => {
        if (onWeekChange) {
          onWeekChange(direction);
          weekChangeRef.current = direction;
          startX.current = clientX;
        }

        weekChangeTimerRef.current = null;

        if (
          (direction === "prev" && isInLeftEdge) ||
          (direction === "next" && isInRightEdge)
        ) {
          startWeekChangeTimer(direction, clientX);
        }
      }, WEEK_CHANGE_DELAY);
    },
    [onWeekChange],
  );

  useEffect(() => {
    const handleDragEnd = () => {
      startX.current = null;
      daysToMove.current = 0;
      weekChangeRef.current = null;
      handleEdgeChange(false, false);
      hasDroppedRef.current = false;
      onDayChange(0);
      onEdgeChange(false, false);
    };

    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, [handleEdgeChange, onDayChange, onEdgeChange]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;
    let startTime = 0;

    const updateProgress = () => {
      if (!startTime) return;

      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / WEEK_CHANGE_DELAY);
      onWeekChangeProgress?.(progress);

      if (progress < 1) {
        progressInterval = setTimeout(updateProgress, 16);
      }
    };

    const startProgressTimer = () => {
      startTime = Date.now();
      updateProgress();
    };

    const stopProgressTimer = () => {
      if (progressInterval) {
        clearTimeout(progressInterval);
        progressInterval = null;
      }

      startTime = 0;
      onWeekChangeProgress?.(0);
    };

    if (weekChangeTimerRef.current) {
      startProgressTimer();
    } else {
      stopProgressTimer();
    }

    return () => {
      if (progressInterval) {
        clearTimeout(progressInterval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onWeekChangeProgress, weekChangeTimerRef.current]);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "event",
      hover: (_, monitor) => {
        if (!monitor.isOver()) {
          hasDroppedRef.current = false;
          handleEdgeChange(false, false);

          if (weekChangeTimerRef.current) {
            clearTimeout(weekChangeTimerRef.current);
            weekChangeTimerRef.current = null;
          }

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

        if (isLeftEdge) {
          startWeekChangeTimer("prev", clientOffset.x);
        } else if (isRightEdge) {
          startWeekChangeTimer("next", clientOffset.x);
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
