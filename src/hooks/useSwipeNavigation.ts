import { useCallback, useRef } from "react";

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
  const touchStartY = useRef<number | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const target = event.target as HTMLElement;
    const eventCard = target.closest(".event-card");

    if (eventCard) {
      // return;
    }

    event.preventDefault();
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
    targetRef.current = event.currentTarget as HTMLElement;
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!touchStartX.current || !touchStartY.current) return;

      event.preventDefault();
      const touchEndX = event.changedTouches[0].clientX;
      const touchEndY = event.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = Math.abs(touchEndY - touchStartY.current);

      if (deltaY < Math.abs(deltaX) / 2) {
        if (Math.abs(deltaX) >= minSwipeDistance) {
          onSwipe(deltaX > 0 ? "right" : "left");
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
      targetRef.current = null;
    },
    [minSwipeDistance, onSwipe],
  );

  return {
    handleTouchStart,
    handleTouchEnd,
  };
};
