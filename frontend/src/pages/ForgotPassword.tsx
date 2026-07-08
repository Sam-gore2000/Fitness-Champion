import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react';
import { authApi } from '@/api/authApi';
import Button from '@/components/ui/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow mb-3">
            <KeyRound size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">Reset password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-center">
            We'll email you a secure link to reset it
          </p>
        </div>

        <div className="glass-card p-6">
          {sent ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
              </div>
              <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
