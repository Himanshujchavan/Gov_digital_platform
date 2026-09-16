import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';
import { Button } from '../../components/common/Button';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { getDefaultDashboard } from '../../utils/roleGuards';
import { Shield, KeyRound, UserCheck, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const [username, setUsername] = useState('citizen_rahul');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Calls auth service (direct or via gateway)
      const res = await authApi.login({ username, password });
      const authData = res.data;

      setAuth({
        user: authData.user,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      });

      // Route according to role
      const targetRoute = getDefaultDashboard(authData.user?.role);
      navigate(targetRoute);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-3xl shadow-xl mb-4">
          🏛️
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Government of Maharashtra
        </h2>
        <p className="mt-1 text-xs font-semibold text-orange-400 uppercase tracking-widest">
          महाराष्ट्र शासन • Interoperability Middleware
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Unified Access for Aaple Sarkar, MahaDBT & Mahabhumi
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white text-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          {error && <ErrorBanner message={error} />}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Username / Citizen ID
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-2.5 border border-slate-300 rounded-lg shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
                  placeholder="e.g. citizen_rahul"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-2.5 border border-slate-300 rounded-lg shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 text-sm font-bold bg-blue-700 hover:bg-blue-800 shadow-md"
                loading={loading}
              >
                Sign In to Platform <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>

          {/* Demo 1-Click Credentials for Judges & Evaluators */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              Quick Test Accounts (Click to Fill)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('citizen_rahul', 'password123')}
                className="p-2 text-center rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <span className="block text-xs font-bold text-blue-800">Citizen</span>
                <span className="text-[10px] text-blue-600">Rahul Sharma</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('officer_education', 'password123')}
                className="p-2 text-center rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <span className="block text-xs font-bold text-purple-800">Officer</span>
                <span className="text-[10px] text-purple-600">Education Desk</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('admin_user', 'password123')}
                className="p-2 text-center rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 transition-colors"
              >
                <span className="block text-xs font-bold text-teal-800">Admin</span>
                <span className="text-[10px] text-teal-600">System Trace</span>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/register"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              New citizen? Register your account here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
