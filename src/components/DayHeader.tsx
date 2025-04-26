import { useMemo } from "react";
import { format } from "date-fns";

type DayHeaderProps = {
  date: string;
};

export const DayHeader = ({ date }: DayHeaderProps) => {
  const formattedDate = useMemo(() => {
    if (!date) return "";
    return format(new Date(date), "EEE MMM d yyyy");
  }, [date]);

  if (!date) return null;

  return (
    <div className="py-2 mb-4 relative">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold text-gray-600">{formattedDate}</h2>
        <div className="flex-1 h-[1.5px] ml-4 bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" />
      </div>
    </div>
  );
};
