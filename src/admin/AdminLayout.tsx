import React from 'react';
import { NavLink } from 'react-router-dom';
import { AdminProfile } from './adminApi';

export type AdminMetrics = {
  totalReports: number;
  underReview: number;
  verified: number;
  activeAlerts: number;
};

type AdminLayoutProps = {
  children: React.ReactNode;
  metrics: AdminMetrics;
  profile: AdminProfile | null;
  onSignOut: () => void;
};

const navItems = [
  { to: '/admin/reports', label: 'Reports', icon: 'assignment' },
  { to: '/admin/alerts', label: 'Alerts', icon: 'campaign' },
  { to: '/admin/incidents', label: 'Incidents', icon: 'warning' },
  { to: '/admin/safe-locations', label: 'Safe Locations', icon: 'shield' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, metrics, profile, onSignOut }) => {
  const metricItems = [
    { label: 'Total reports', value: metrics.totalReports, accent: 'text-slate-950' },
    { label: 'Under review', value: metrics.underReview, accent: 'text-amber-700' },
    { label: 'Verified', value: metrics.verified, accent: 'text-emerald-700' },
    { label: 'Active alerts', value: metrics.activeAlerts, accent: 'text-red-700' },
  ];

  return (
    <div className="h-screen overflow-y-auto bg-[#eef2f7] text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#002147] text-white flex items-center justify-center">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Safety Hub</p>
              <h1 className="text-lg font-bold">Admin</h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-[#002147] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="mb-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Signed in</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">{profile?.email || 'Admin'}</p>
            <p className="text-xs text-slate-500 capitalize">{profile?.role || 'authorized'}</p>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Operations Console</p>
                <h2 className="text-2xl font-bold text-slate-950">Campus safety administration</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:min-w-[560px]">
                {metricItems.map((item) => (
                  <div key={item.label} className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
                    <p className={`mt-1 text-2xl font-black ${item.accent}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${
                      isActive ? 'bg-[#002147] text-white' : 'bg-slate-100 text-slate-700'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={onSignOut}
                className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Sign out
              </button>
            </nav>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
