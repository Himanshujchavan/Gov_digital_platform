import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Layers, FileText, ShieldCheck, LogOut, User, Bell } from 'lucide-react';

export function CitizenLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Available Services', path: '/citizen/services', icon: Layers },
    { label: 'My Applications', path: '/citizen/applications', icon: FileText },
    { label: 'Consent Requests', path: '/citizen/consent', icon: ShieldCheck },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Maha Gov Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-lg shadow-inner">
                🏛️
              </div>
              <div>
                <span className="text-xs font-semibold text-orange-400 uppercase tracking-widest block">
                  Government of Maharashtra • महाराष्ट्र शासन
                </span>
                <span className="text-sm font-bold text-white tracking-tight">
                  Citizen Digital Services Portal (Aaple Sarkar / MahaDBT)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-xs font-bold text-blue-300">
                  {user?.fullName?.charAt(0) || 'C'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white">{user?.fullName || 'Citizen'}</div>
                  <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Verified Citizen
                  </div>
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

        {/* Sub-Navigation Bar */}
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
                      ? 'bg-blue-600 text-white shadow-xs'
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>Maharashtra Interoperability Middleware Platform • Unified Citizen Interface</p>
        <p className="mt-1 text-[11px] text-slate-400">
          Integrated with Aaple Sarkar, MahaDBT 2.0, Mahabhumi Land Records & MDM Entity Linkage Engine
        </p>
      </footer>
    </div>
  );
}
