import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Activity, ShieldCheck, Users, BarChart3, LogOut } from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'System Stats & SLA', path: '/admin/system-stats', icon: Activity },
    { label: 'Central Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
    { label: 'MDM Duplicate Review', path: '/admin/duplicates', icon: Users },
    { label: 'Data Quality Dashboard', path: '/admin/data-quality', icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-lg">
                🛡️
              </div>
              <div>
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest block">
                  Central Interoperability Platform • मध्यवर्ती प्रशासन
                </span>
                <span className="text-sm font-bold text-white tracking-tight">
                  Middleware Administration, Traceability & Quality Control
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <div className="w-7 h-7 rounded-full bg-teal-600/30 border border-teal-400/40 flex items-center justify-center text-xs font-bold text-teal-300">
                  A
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white">{user?.fullName || 'Administrator'}</div>
                  <div className="text-[10px] text-teal-400 font-mono">Platform Admin</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/60 border-t border-slate-800 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>Maharashtra Interoperability Middleware • Central Administrator & Audit Console</p>
      </footer>
    </div>
  );
}
