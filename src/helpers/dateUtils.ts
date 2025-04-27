import { formatDuration } from "date-fns";

export const formatDurationTime = (duration: number) =>
  formatDuration(
    {
      hours: Math.floor(duration / 60),
      minutes: duration % 60,
    },
    { zero: false },
  );
