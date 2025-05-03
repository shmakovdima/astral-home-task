import { useState } from "react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  weekStart: Date;
  weekEnd: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
};

export const WeekHeader = ({
  weekStart,
  weekEnd,
  onPrevWeek,
  onNextWeek,
}: Props) => {
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePrevWeek = () => {
    if (isAnimating) return;
    setDirection("right");
    setIsAnimating(true);
    onPrevWeek();

    setTimeout(() => {
      setIsAnimating(false);
    }, 100);
  };

  const handleNextWeek = () => {
    if (isAnimating) return;
    setDirection("left");
    setIsAnimating(true);
    onNextWeek();

    setTimeout(() => {
      setIsAnimating(false);
    }, 100);
  };

  const variants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "left" ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "left" ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className="mb-4 flex items-center justify-between">
      <motion.button
        className="rounded-lg p-2 transition-colors hover:bg-white/10"
        onClick={handlePrevWeek}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M15 19l-7-7 7-7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      </motion.button>

      <div className="w-68 overflow-hidden text-center">
        <AnimatePresence custom={direction} initial={false} mode="wait">
          <motion.div
            animate="center"
            custom={direction}
            exit="exit"
            initial="enter"
            key={weekStart.toString()}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 45,
              mass: 0.8,
            }}
            variants={variants}
          >
            <h2 className="text-xl font-semibold">
              {format(weekStart, "d MMMM")} - {format(weekEnd, "d MMMM")}
            </h2>
            <p className="text-sm text-white/80">{format(weekEnd, "yyyy")}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.button
        className="rounded-lg p-2 transition-colors hover:bg-white/10"
        onClick={handleNextWeek}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 5l7 7-7 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      </motion.button>
    </div>
  );
};
