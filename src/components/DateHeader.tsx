import { useMemo } from "react";

type DateHeaderProps = {
  date: string;
};

export const DateHeader = ({ date }: DateHeaderProps) => {
  const formattedDate = useMemo(() => {
    const dateObj = new Date(date);
    const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    const month = dateObj.toLocaleDateString("en-US", { month: "short" });
    const day = dateObj.getDate();

    const year = dateObj.getFullYear();

    return `${weekday} ${month} ${day} ${year}`;
  }, [date]);

  if (!date) return null;

  return (
    <div className="py-2 mb-4">
      <h2 className="text-2xl font-bold text-gray-700">{formattedDate}</h2>
    </div>
  );
};
