import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calendarApi } from '@/api/calendarApi';
import GlassCard from '@/components/ui/GlassCard';

const STATUS_COLORS: Record<string, string> = {
  green: 'bg-success-500',
  yellow: 'bg-warning-400',
  red: 'bg-danger-400',
  pending: 'bg-slate-200 dark:bg-slate-700',
};

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-12

  const { data } = useQuery({ queryKey: ['calendar', year, month], queryFn: () => calendarApi.getMonth(year, month) });
  const days = data?.data.days || {};

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const goPrev = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1);
  };
  const goNext = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <button onClick={goPrev} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft size={18} /></button>
          <h3 className="font-display font-bold text-slate-800 dark:text-slate-100">
            {new Date(year, month - 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={goNext} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronRight size={18} /></button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-[11px] text-slate-400 font-semibold mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />;
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const status = days[dateStr] || 'pending';
            return (
              <div key={idx} className="aspect-square flex flex-col items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-medium text-slate-600 dark:text-slate-300">
                {day}
                <span className={`mt-1 h-1.5 w-1.5 rounded-full ${STATUS_COLORS[status]}`} />
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-6 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success-500" /> Goal achieved</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-warning-400" /> Partial</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger-400" /> Missed</span>
        </div>
      </GlassCard>
    </div>
  );
}
