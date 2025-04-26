import { useEffect, useState } from "react";
import { format, isToday } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

import { WeeksHeader } from "@/components/WeeksHeader";
import { cnTwMerge } from "@/helpers/cnTwMerge";

type WeeksNavigationProps = {
  currentWeek: Date[];
  weekStart: Date;
  weekEnd: Date;
  onNextWeek: () => void;
  onPrevWeek: () => void;
};

export const WeeksNavigation = ({
  currentWeek,
  weekStart,
  weekEnd,
  onNextWeek,
  onPrevWeek,
}: WeeksNavigationProps) => {
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedWeek, setDisplayedWeek] = useState(currentWeek);

  useEffect(() => {
    if (!isAnimating) {
      setDisplayedWeek(currentWeek);
    }
  }, [currentWeek, isAnimating]);

  const handlePrevWeek = () => {
    if (isAnimating) return;
    setDirection("right");
    setIsAnimating(true);
    onPrevWeek();
  };

  const handleNextWeek = () => {
    if (isAnimating) return;
    setDirection("left");
    setIsAnimating(true);
    onNextWeek();
  };

  const variants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "left" ? 500 : -500,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "left" ? -500 : 500,
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white overflow-hidden">
        <WeeksHeader
          onNextWeek={handleNextWeek}
          onPrevWeek={handlePrevWeek}
          weekEnd={weekEnd}
          weekStart={weekStart}
        />

        <div className="overflow-hidden">
          <AnimatePresence
            custom={direction}
            initial={false}
            mode="wait"
            onExitComplete={() => setIsAnimating(false)}
          >
            <motion.div
              animate="center"
              className="grid grid-cols-7 gap-0"
              custom={direction}
              exit="exit"
              initial="enter"
              key={weekStart.toString()}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.4,
              }}
              variants={variants}
            >
              {displayedWeek.map((date) => (
                <div
                  className={cnTwMerge(
                    "flex flex-col items-center justify-center transition-colors duration-200 py-2 px-3 rounded-lg mx-1",
                    isToday(date)
                      ? "bg-gradient-to-br from-indigo-600 to-violet-600"
                      : "bg-gray-100/10",
                  )}
                  key={format(date, "yyyy-MM-dd")}
                >
                  <span className="text-sm">{format(date, "EEE")}</span>
                  <span className="text-xl font-bold mt-1">
                    {date.getDate()}
                  </span>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
