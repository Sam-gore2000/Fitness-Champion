import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { authApi } from '@/api/authApi';
import api from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import PageLoader from '@/components/ui/PageLoader';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import AdminRoute from '@/routes/AdminRoute';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import VerifyEmail from '@/pages/VerifyEmail';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import Nutrition from '@/pages/Nutrition';
import Workouts from '@/pages/Workouts';
import BodyMeasurements from '@/pages/BodyMeasurements';
import AIChat from '@/pages/AIChat';
import Missions from '@/pages/Missions';
import Notifications from '@/pages/Notifications';
import Grocery from '@/pages/Grocery';
import Budget from '@/pages/Budget';
import CalendarPage from '@/pages/Calendar';
import Analytics from '@/pages/Analytics';
import Reports from '@/pages/Reports';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 } },
});

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    // Try silent refresh using the httpOnly cookie, then fetch the user
    (async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        useAuthStore.getState().setAccessToken(data.accessToken);
        const me = await authApi.me();
        setAuth(me.data.user, data.accessToken);
      } catch {
        // not authenticated — fine, user will see /login
      } finally {
        setChecked(true);
      }
    })();
  }, [setAuth]);

  if (!checked) return <PageLoader />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap>
          <Toaster position="top-center" toastOptions={{ className: 'text-sm font-medium' }} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/onboarding" element={<Onboarding />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/nutrition" element={<Nutrition />} />
                <Route path="/workouts" element={<Workouts />} />
                <Route path="/body" element={<BodyMeasurements />} />
                <Route path="/coach" element={<AIChat />} />
                <Route path="/missions" element={<Missions />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/grocery" element={<Grocery />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthBootstrap>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
