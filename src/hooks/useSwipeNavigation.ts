import { useCallback, useEffect, useRef } from "react";

type SwipeDirection = "left" | "right";

type SwipeNavigationProps = {
  onSwipe: (direction: SwipeDirection) => void;
  minSwipeDistance?: number;
};

export const useSwipeNavigation = ({
  onSwipe,
  minSwipeDistance = 50,
}: SwipeNavigationProps) => {
  const touchStartX = useRef<number | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const isSwiping = useRef(false);

  const resetState = useCallback(() => {
    touchStartX.current = null;
    isSwiping.current = false;
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
    isSwiping.current = true;
  }, []);

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!isSwiping.current || !touchStartX.current) return;

      const touchEndX = event.touches[0].clientX;
      const deltaX = touchEndX - touchStartX.current;

      if (Math.abs(deltaX) > minSwipeDistance) {
        event.preventDefault();
      }
    },
    [minSwipeDistance],
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!isSwiping.current || !touchStartX.current) return;

      const touchEndX = event.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX.current;

      if (Math.abs(deltaX) >= minSwipeDistance) {
        onSwipe(deltaX > 0 ? "right" : "left");
      }

      resetState();
    },
    [minSwipeDistance, onSwipe, resetState],
  );

  const handleTouchCancel = useCallback(() => {
    resetState();
  }, [resetState]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart);
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd);
    element.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel]);

  return {
    ref: elementRef,
  };
};
