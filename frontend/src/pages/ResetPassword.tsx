import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { authApi } from '@/api/authApi';
import Button from '@/components/ui/Button';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.resetPassword(token!, password);
      toast.success('Password updated. Please sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow mb-3">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">Set a new password</h1>
        </div>
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div>
            <label className="label-text">New password</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="At least 8 characters" />
          </div>
          <Button type="submit" loading={loading} className="w-full">Update password</Button>
        </form>
      </div>
    </div>
  );
}
