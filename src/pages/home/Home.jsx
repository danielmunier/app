import './Home.css';
import WaterTracker from '../../components/WaterTracker/WaterTracker';
import QuickTasks from '../../components/QuickTasks/QuickTasks';
import QuickNotes from '../../components/QuickNotes/QuickNotes';
import MiniPomodoro from '../../components/MiniPomodoro/MiniPomodoro';

export default function Home() {
  return (
    <div className="home-container">
      {/* Linha 1: Widgets pequenos */}
      <div className="home-row home-row-small">
        <MiniPomodoro />
        <WaterTracker />
      </div>

      {/* Linha 2: Widgets maiores */}
      <div className="home-row home-row-large">
        <QuickTasks />
        <QuickNotes />
      </div>
    </div>
  );
}
