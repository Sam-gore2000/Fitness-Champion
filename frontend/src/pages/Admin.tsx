import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Users, Apple, Bell, BrainCircuit, ShieldCheck } from 'lucide-react';
import { adminApi } from '@/api/adminApi';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';

const TABS = [
  { key: 'overview', label: 'Overview', icon: ShieldCheck },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'foods', label: 'Foods', icon: Apple },
  { key: 'notifications', label: 'Notify', icon: Bell },
  { key: 'prompts', label: 'AI Prompts', icon: BrainCircuit },
] as const;

export default function Admin() {
  const [tab, setTab] = useState<typeof TABS[number]['key']>('overview');
  const queryClient = useQueryClient();

  const { data: statsData } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminApi.stats(), enabled: tab === 'overview' });
  const [userQuery, setUserQuery] = useState('');
  const { data: usersData } = useQuery({ queryKey: ['admin-users', userQuery], queryFn: () => adminApi.listUsers(userQuery), enabled: tab === 'users' });
  const [foodQuery, setFoodQuery] = useState('');
  const { data: foodsData } = useQuery({ queryKey: ['admin-foods', foodQuery], queryFn: () => adminApi.listFoods(foodQuery), enabled: tab === 'foods' });
  const { data: promptsData } = useQuery({ queryKey: ['admin-prompts'], queryFn: () => adminApi.listPrompts(), enabled: tab === 'prompts' });

  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '' });
  const broadcastMutation = useMutation({
    mutationFn: adminApi.broadcast,
    onSuccess: (res: any) => toast.success(`Sent to ${res.data.count} users`),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.updateUser(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated');
    },
  });

  const [editingPrompt, setEditingPrompt] = useState<{ key: string; label: string; systemPrompt: string } | null>(null);
  const savePromptMutation = useMutation({
    mutationFn: adminApi.upsertPrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prompts'] });
      toast.success('Prompt saved');
      setEditingPrompt(null);
    },
  });

  const stats = statsData?.data.stats;
  const users = usersData?.data.users || [];
  const foods = foodsData?.data.foods || [];
  const prompts = promptsData?.data.prompts || [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <ShieldCheck size={20} /> Admin Panel
      </h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              tab === key ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid sm:grid-cols-3 gap-4">
          <GlassCard><p className="text-xs text-slate-500">Total Users</p><p className="text-2xl font-display font-bold">{stats?.totalUsers ?? '—'}</p></GlassCard>
          <GlassCard><p className="text-xs text-slate-500">Verified Users</p><p className="text-2xl font-display font-bold">{stats?.verifiedUsers ?? '—'}</p></GlassCard>
          <GlassCard><p className="text-xs text-slate-500">Foods in DB</p><p className="text-2xl font-display font-bold">{stats?.totalFoods ?? '—'}</p></GlassCard>
        </div>
      )}

      {tab === 'users' && (
        <GlassCard>
          <input placeholder="Search users..." className="input-field mb-4" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
          <div className="space-y-2">
            {users.map((u: any) => (
              <div key={u._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => updateRoleMutation.mutate({ id: u._id, role: e.target.value })}
                  className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {tab === 'foods' && (
        <GlassCard>
          <input placeholder="Search foods..." className="input-field mb-4" value={foodQuery} onChange={(e) => setFoodQuery(e.target.value)} />
          <div className="space-y-2">
            {foods.map((f: any) => (
              <div key={f._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{f.name}</span>
                <span className="text-xs text-slate-400">{f.calories} kcal / {f.servingSizeG}g</span>
              </div>
            ))}
            {foods.length === 0 && <p className="text-sm text-slate-400">No foods found. Add entries via the API to grow the reference database.</p>}
          </div>
        </GlassCard>
      )}

      {tab === 'notifications' && (
        <GlassCard className="max-w-md">
          <h3 className="font-display font-bold mb-3">Broadcast notification</h3>
          <div className="space-y-3">
            <input placeholder="Title" className="input-field" value={broadcastForm.title} onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })} />
            <textarea placeholder="Message" className="input-field min-h-[80px]" value={broadcastForm.message} onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })} />
            <Button onClick={() => broadcastMutation.mutate(broadcastForm)} loading={broadcastMutation.isPending} className="w-full">Send to all users</Button>
          </div>
        </GlassCard>
      )}

      {tab === 'prompts' && (
        <div className="grid md:grid-cols-2 gap-4">
          {prompts.map((p: any) => (
            <GlassCard key={p.key}>
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase mb-1">{p.key}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4 mb-3">{p.systemPrompt}</p>
              <Button variant="secondary" onClick={() => setEditingPrompt(p)}>Edit</Button>
            </GlassCard>
          ))}

          {editingPrompt && (
            <GlassCard className="md:col-span-2">
              <h3 className="font-display font-bold mb-3">Editing: {editingPrompt.key}</h3>
              <textarea
                className="input-field min-h-[160px]"
                value={editingPrompt.systemPrompt}
                onChange={(e) => setEditingPrompt({ ...editingPrompt, systemPrompt: e.target.value })}
              />
              <Button className="mt-3" onClick={() => savePromptMutation.mutate(editingPrompt)} loading={savePromptMutation.isPending}>Save prompt</Button>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
