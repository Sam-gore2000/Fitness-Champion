import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Wallet, Sparkles } from 'lucide-react';
import { budgetApi } from '@/api/budgetApi';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';

export default function Budget() {
  const [budget, setBudget] = useState(8000);
  const [plan, setPlan] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => budgetApi.generatePlan(budget, 'INR'),
    onSuccess: (res) => {
      setPlan(res.data.plan);
      toast.success(res.data.offline ? 'Generated using the offline planner (AI unavailable)' : 'Budget meal plan generated');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Could not generate plan'),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">Budget Meal Planner</h2>

      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={18} className="text-brand-600" />
          <h3 className="font-display font-bold text-slate-800 dark:text-slate-100">Monthly grocery budget</h3>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={2000}
            max={25000}
            step={500}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="flex-1 accent-brand-600"
          />
          <span className="font-display font-bold text-lg text-slate-800 dark:text-slate-100 w-28 text-right">₹{budget.toLocaleString('en-IN')}</span>
        </div>
        <Button onClick={() => mutation.mutate()} loading={mutation.isPending} className="w-full mt-4">
          <Sparkles size={16} /> Generate high-protein plan
        </Button>
      </GlassCard>

      {plan && (
        <GlassCard>
          <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 mb-3">Your 7-day plan</h3>
          <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{plan}</div>
        </GlassCard>
      )}
    </div>
  );
}
