import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { cnTwMerge } from "@/helpers/cnTwMerge";

type DayInfo = {
  name: string;
  number: number;
  date: Date;
};

type Props = {
  activeDay: string;
  setActiveDay: (day: string) => void;
};

export const DaysNavigation = ({ activeDay, setActiveDay }: Props) => {
  const [days, setDays] = useState<DayInfo[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(6);
  const [isAnimating, setIsAnimating] = useState(false);

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const activeDate = activeDay ? new Date(activeDay) : new Date();

    const weekDays = Array.from({ length: 13 }, (_, i) => {
      const day = new Date(activeDate);
      day.setDate(activeDate.getDate() + (i - 6));

      return {
        name: day.toLocaleDateString("en-US", { weekday: "short" }),
        number: day.getDate(),
        date: day,
      };
    }) satisfies DayInfo[];

    setDays(weekDays);
    setSelectedDay(6); // Always set selected day to center
  }, [activeDay]);

  const handleDayClick = (index: number) => {
    if (isAnimating) return;

    setIsAnimating(true);
    const selectedDate = days[index].date;
    setActiveDay(formatDate(selectedDate));
    
    // Reset animation state after a short delay
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const dayVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-6 text-white overflow-hidden">
      <h1 className="text-2xl font-bold mb-4">Your Schedule</h1>

      <div className="relative">
        <motion.div
          animate="visible"
          className="flex gap-2"
          initial="hidden"
          onAnimationComplete={() => setIsAnimating(false)}
          variants={containerVariants}
        >
          <AnimatePresence>
            {days.map((day, index) => {
              const isHidden = Math.abs(index - 6) > 3;
              if (isHidden) return null;

              return (
                <motion.div
                  className={cnTwMerge(
                    "flex flex-col items-center cursor-pointer p-2 rounded-lg min-w-[calc(14.2857%-0.5rem)]",
                    index === 6
                      ? "bg-indigo-600"
                      : "bg-blue-400 bg-opacity-50 hover:bg-opacity-75",
                  )}
                  key={day.date.toISOString()}
                  layout
                  onClick={() => handleDayClick(index)}
                  transition={{
                    damping: 30,
                    stiffness: 500,
                    type: "spring",
                  }}
                  variants={dayVariants}
                >
                  <span className="text-sm">{day.name}</span>
                  <span className="text-xl font-bold mt-1">{day.number}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
