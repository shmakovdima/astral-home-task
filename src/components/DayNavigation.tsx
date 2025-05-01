import { useEffect, useState } from "react";
import { addDays, format, startOfDay } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

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

export const DayNavigation = ({ activeDay, setActiveDay }: Props) => {
  const [days, setDays] = useState<DayInfo[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const formatDate = (date: Date): string => format(date, "yyyy-MM-dd");

  useEffect(() => {
    const activeDate = activeDay ? new Date(activeDay) : new Date();

    const weekDays = Array.from({ length: 13 }, (_, i) => {
      const day = addDays(startOfDay(activeDate), i - 6);

      return {
        name: format(day, "EEE"),
        number: day.getDate(),
        date: day,
      };
    }) satisfies DayInfo[];

    setDays(weekDays);
  }, [activeDay]);

  const handleDayClick = (index: number) => {
    if (isAnimating) return;

    setIsAnimating(true);
    const selectedDate = days[index].date;

    setActiveDay(formatDate(selectedDate));

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
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white overflow-hidden">
      <h1 className="text-2xl font-bold mb-4">Your Schedule</h1>

      <div className="relative w-full">
        <motion.div
          animate="visible"
          className="flex justify-between w-full gap-2"
          initial="hidden"
          onAnimationComplete={() => setIsAnimating(false)}
          variants={containerVariants}
        >
          <AnimatePresence mode="popLayout">
            {days.map((day, index) => {
              const isHidden = Math.abs(index - 6) > 3;
              if (isHidden) return null;

              return (
                <motion.div
                  className={cnTwMerge(
                    "flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer py-2 px-3 rounded-lg w-[calc(100%/7)] min-w-0 h-16",
                    index === 6
                      ? "bg-gradient-to-br from-indigo-600 to-violet-600"
                      : "bg-gray-100/10 hover:bg-indigo-600/10",
                  )}
                  exit={{ opacity: 0 }}
                  key={formatDate(day.date)}
                  layout
                  layoutId={`day-${formatDate(day.date)}`}
                  onClick={() => handleDayClick(index)}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 0.5,
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
