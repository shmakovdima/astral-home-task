import { memo } from "react";
import { format, parseISO } from "date-fns";

type Props = {
  date: string;
};

export const DayHeader = memo(({ date }: Props) => (
  <div className="relative mb-4 py-2">
    <div className="flex items-center">
      <h2 className="text-2xl font-bold text-gray-600">
        {format(parseISO(date), "EEE MMM d yyyy")}
      </h2>
      <div className="ml-4 h-[1.5px] flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" />
    </div>
  </div>
));

DayHeader.displayName = "DayHeader";
