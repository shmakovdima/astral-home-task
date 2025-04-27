import { DailyView } from "./DailyView";
import { WeeklyView } from "./WeeklyView";

export const ResponsiveKanban = () => (
  <div>
    <div className="block md:hidden overflow-hidden">
      <DailyView />
    </div>
    <div className="hidden md:block">
      <WeeklyView />
    </div>
  </div>
);
