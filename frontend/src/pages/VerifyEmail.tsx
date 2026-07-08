import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { authApi } from '@/api/authApi';
import Spinner from '@/components/ui/Spinner';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    authApi.verifyEmail(token!).then(() => setStatus('success')).catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 px-4">
      <div className="glass-card p-8 w-full max-w-sm flex flex-col items-center text-center">
        {status === 'loading' && <Spinner size={32} />}
        {status === 'success' && (
          <>
            <CheckCircle2 size={40} className="text-success-500 mb-3" />
            <h1 className="font-display font-bold text-lg mb-2">Email verified</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">You're all set. Sign in to continue.</p>
            <Link to="/login" className="btn-primary">Go to sign in</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={40} className="text-danger-500 mb-3" />
            <h1 className="font-display font-bold text-lg mb-2">Link invalid or expired</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Please request a new verification email.</p>
            <Link to="/login" className="btn-secondary">Back to sign in</Link>
          </>
        )}
      </div>
    </div>
  );
}
