import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { groceryApi } from '@/api/groceryApi';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

export default function Grocery() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['grocery'], queryFn: () => groceryApi.list() });
  const lists = data?.data.groceryLists || [];
  const latest = lists[0];

  const generateMutation = useMutation({
    mutationFn: groceryApi.generate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grocery'] });
      toast.success('Grocery list generated from your recent meals');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ listId, idx }: { listId: string; idx: number }) => groceryApi.toggleItem(listId, idx),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grocery'] }),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">Grocery Planner</h2>
        <Button onClick={() => generateMutation.mutate()} loading={generateMutation.isPending}>
          <Sparkles size={16} /> Generate list
        </Button>
      </div>

      {!latest ? (
        <GlassCard>
          <EmptyState
            icon={<ShoppingCart size={22} />}
            title="No grocery list yet"
            description="Generate one automatically based on the meals you've logged this week."
            action={<Button onClick={() => generateMutation.mutate()}>Generate my list</Button>}
          />
        </GlassCard>
      ) : (
        <GlassCard>
          <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 mb-1">Week of {latest.weekOf}</h3>
          <p className="text-xs text-slate-400 mb-4">{latest.items.length} items</p>
          <div className="space-y-2">
            {latest.items.map((item, idx) => (
              <label key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleMutation.mutate({ listId: latest._id, idx })}
                  className="h-4 w-4 accent-brand-600 rounded"
                />
                <div className="flex-1">
                  <p className={`text-sm ${item.checked ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{item.name}</p>
                  <p className="text-[11px] text-slate-400">{item.quantity} &middot; {item.category}</p>
                </div>
              </label>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
