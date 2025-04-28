import { useEffect, useRef } from "react";
import { type DragMoveEvent, useDndMonitor } from "@dnd-kit/core";

const EDGE_THRESHOLD = 0.2;
const HOLD_DURATION = 1500;

export const DayDragMonitor = ({
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
