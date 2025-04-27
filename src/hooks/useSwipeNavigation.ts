import { useCallback, useEffect, useRef } from "react";

type SwipeDirection = "prev" | "next";

type SwipeNavigationProps = {
  onSwipe: (direction: SwipeDirection) => void;
  minSwipeDistance?: number;
  isDisabled?: boolean;
};

export const useSwipeNavigation = ({
  onSwipe,
  minSwipeDistance = 50,
  isDisabled = false,
}: SwipeNavigationProps) => {
  const touchStartX = useRef<number | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const isSwiping = useRef(false);

  const resetState = useCallback(() => {
    touchStartX.current = null;
    isSwiping.current = false;
  }, []);

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (isDisabled) return;
      if (document.querySelector(".bg-black\\/40")) return;
      touchStartX.current = event.touches[0].clientX;
      isSwiping.current = true;
    },
    [isDisabled],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (isDisabled || !isSwiping.current || !touchStartX.current) return;
      if (document.querySelector(".bg-black\\/40")) return;

      const touchEndX = event.touches[0].clientX;
      const deltaX = touchEndX - touchStartX.current;

      if (Math.abs(deltaX) > minSwipeDistance) {
        event.preventDefault();
      }
    },
    [minSwipeDistance, isDisabled],
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (isDisabled || !isSwiping.current || !touchStartX.current) return;
      if (document.querySelector(".bg-black\\/40")) return;

      const touchEndX = event.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX.current;

      if (Math.abs(deltaX) >= minSwipeDistance) {
        onSwipe(deltaX > 0 ? "prev" : "next");
      }

      resetState();
    },
    [minSwipeDistance, onSwipe, resetState, isDisabled],
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
