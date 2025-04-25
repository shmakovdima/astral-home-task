import { useMemo } from "react";
import { format } from "date-fns";

type DateHeaderProps = {
  date: string;
};

export const DateHeader = ({ date }: DateHeaderProps) => {
  const formattedDate = useMemo(() => {
    if (!date) return "";
    return format(new Date(date), "EEE MMM d yyyy");
  }, [date]);

  if (!date) return null;

  return (
    <div className="py-2 mb-4">
      <h2 className="text-2xl font-bold text-gray-700">{formattedDate}</h2>
    </div>
  );
};
