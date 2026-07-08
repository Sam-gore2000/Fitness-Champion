import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Apple, Dumbbell, MessageCircle, Trophy } from 'lucide-react';

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/nutrition', icon: Apple, label: 'Food' },
  { to: '/workouts', icon: Dumbbell, label: 'Train' },
  { to: '/coach', icon: MessageCircle, label: 'Coach' },
  { to: '/missions', icon: Trophy, label: 'Missions' },
];

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-around py-2">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-medium ${
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
