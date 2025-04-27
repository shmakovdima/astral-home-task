import { format, isToday } from "date-fns";

import { WeekHeader } from "@/components/WeekHeader";
import { cnTwMerge } from "@/helpers/cnTwMerge";

type Props = {
  currentWeek: Date[];
  weekStart: Date;
  weekEnd: Date;
  onNextWeek: () => void;
  onPrevWeek: () => void;
};

export const WeekNavigation = ({
  currentWeek,
  weekStart,
  weekEnd,
  onNextWeek,
  onPrevWeek,
}: Props) => (
  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white overflow-hidden">
    <WeekHeader
      onNextWeek={onNextWeek}
      onPrevWeek={onPrevWeek}
      weekEnd={weekEnd}
      weekStart={weekStart}
    />

    <div className="grid grid-cols-7 gap-0">
      {currentWeek.map((date) => (
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
          <span className="text-xl font-bold mt-1">{date.getDate()}</span>
        </div>
      ))}
    </div>
  </div>
);
