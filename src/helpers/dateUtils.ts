import { format, formatDuration, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";

export const getEventTime = (timestamp: string) => {
  const [hours, minutes] = timestamp.split("T")[1].split(":");
  const hoursNum = parseInt(hours, 10);
  const formattedHours = hoursNum % 12 || 12;
  return `${formattedHours}:${minutes} ${hoursNum >= 12 ? "PM" : "AM"}`;
};

export const formatDurationTime = (duration: number) =>
  formatDuration(
    {
      hours: Math.floor(duration / 60),
      minutes: duration % 60,
    },
    { zero: false },
  );

export const formatEventDate = (timestamp: string) => {
  const date = parseISO(timestamp);
  return format(date, "d MMMM, EEEE", { locale: enUS });
};

export const createLocalTimestamp = (
  date: Date,
  hours: number,
  minutes: number,
) => {
  const localDate = parseISO(date.toISOString());
  localDate.setHours(hours, minutes, 0, 0);

  const utcDate = new Date(
    Date.UTC(
      localDate.getFullYear(),
      localDate.getMonth(),
      localDate.getDate(),
      localDate.getHours(),
      localDate.getMinutes(),
      0,
      0,
    ),
  );

  return utcDate.toISOString();
};
