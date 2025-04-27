import { DailyView } from "./DailyView";
import { WeeklyCalendarView } from "./WeeklyCalendarView";

export const ResponsiveKanban = () => (
  <div>
    <div className="block md:hidden overflow-hidden">
      <DailyView />
    </div>
    <div className="hidden md:block">
      <WeeklyCalendarView />
    </div>
  </div>
);
