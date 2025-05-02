import { memo } from "react";
import { format, parseISO } from "date-fns";

type Props = {
  date: string;
};

export const DayHeader = memo(({ date }: Props) => (
  <div className="py-2 mb-4 relative">
    <div className="flex items-center">
      <h2 className="text-2xl font-bold text-gray-600">
        {format(parseISO(date), "EEE MMM d yyyy")}
      </h2>
      <div className="flex-1 h-[1.5px] ml-4 bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" />
    </div>
  </div>
));

DayHeader.displayName = "DayHeader";
