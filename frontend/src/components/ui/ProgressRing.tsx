interface ProgressRingProps {
  value: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  unit?: string;
}

export default function ProgressRing({
  value,
  target,
  size = 120,
  strokeWidth = 10,
  color = '#4F46E5',
  trackColor = '#E2E8F0',
  label,
  unit = '',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(1, value / target) : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" className="dark:opacity-20" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">
            {Math.round(value)}
          </span>
          <span className="text-[10px] text-slate-400">/{target}{unit}</span>
        </div>
      </div>
      {label && <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>}
    </div>
  );
}
