import { format } from "date-fns";
import { motion } from "framer-motion";

type Props = {
  weekStart: Date;
  weekEnd: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
};

export const WeeksHeader = ({
  weekStart,
  weekEnd,
  onPrevWeek,
  onNextWeek,
}: Props) => (
  <div className="flex items-center justify-between mb-4">
    <motion.button
      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
      onClick={onPrevWeek}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg
        className="w-6 h-6"
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

    <div className="text-center">
      <h2 className="text-xl font-semibold">
        {format(weekStart, "d MMMM")} - {format(weekEnd, "d MMMM")}
      </h2>
      <p className="text-sm text-white/80">{format(weekEnd, "yyyy")}</p>
    </div>

    <motion.button
      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
      onClick={onNextWeek}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg
        className="w-6 h-6"
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
