import { DailyView } from "@/widgets/DailyView";
import { WeeklyView } from "@/widgets/WeeklyView";

const Home = () => (
  <div>
    <div className="block md:hidden overflow-hidden">
      <DailyView />
    </div>
    <div className="hidden md:block">
      <WeeklyView />
    </div>
  </div>
);

export default Home;
