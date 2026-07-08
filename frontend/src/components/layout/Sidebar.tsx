import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Apple, Dumbbell, Ruler, MessageCircle, Trophy,
  Bell, ShoppingCart, Wallet, CalendarDays, BarChart3, ShieldCheck, Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/nutrition', icon: Apple, label: 'Nutrition' },
  { to: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { to: '/body', icon: Ruler, label: 'Body' },
  { to: '/coach', icon: MessageCircle, label: 'AI Coach' },
  { to: '/missions', icon: Trophy, label: 'Missions' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/grocery', icon: ShoppingCart, label: 'Grocery' },
  { to: '/budget', icon: Wallet, label: 'Budget Planner' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-slate-200/70 dark:border-slate-800/70 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
          <Sparkles size={18} className="text-white" />
        </div>
        <span className="font-display font-bold text-slate-800 dark:text-slate-100 text-[15px] leading-tight">
          AI Fitness<br /><span className="text-brand-600 dark:text-brand-400">Companion</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`
            }
          >
            <ShieldCheck size={18} />
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="mt-4 px-3 py-3 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/60 dark:from-brand-900/30 dark:to-brand-900/10 text-xs">
        <p className="font-semibold text-brand-700 dark:text-brand-300">Level {user?.level ?? 1}</p>
        <p className="text-brand-600/70 dark:text-brand-400/70">{user?.streakDays ?? 0} day streak 🔥</p>
      </div>
    </aside>
  );
}
