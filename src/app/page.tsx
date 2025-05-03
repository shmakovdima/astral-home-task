import { DayView } from "@/widgets/DayView";
import { WeekView } from "@/widgets/WeekView";

const Home = () => (
  <div>
    <div className="block overflow-hidden md:hidden">
      <DayView />
    </div>
    <div className="hidden md:block">
      <WeekView />
    </div>
  </div>
);

export default Home;
