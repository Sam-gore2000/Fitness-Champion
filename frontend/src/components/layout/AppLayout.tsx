import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/nutrition': 'Nutrition Tracker',
  '/workouts': 'Workout Tracker',
  '/body': 'Body Measurements',
  '/coach': 'AI Coach',
  '/missions': 'Daily Missions',
  '/calendar': 'Calendar',
  '/analytics': 'Analytics',
  '/grocery': 'Grocery Planner',
  '/budget': 'Budget Meal Planner',
  '/notifications': 'Notifications',
  '/admin': 'Admin Panel',
};

export default function AppLayout() {
  const location = useLocation();
  const title = TITLES[location.pathname] || 'AI Fitness Companion';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} />
        <main className="px-4 sm:px-8 py-6 pb-24 lg:pb-8 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
