import React from 'react';
import { NavLink } from '../../router';
import { useAuth } from '../../context/AuthContext';
import { useSRE } from '../../context/SREContext';
import {
  LayoutDashboard,
  Activity,
  Network,
  AlertTriangle,
  ShieldAlert,
  Target,
  Sliders,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  TrendingUp,
  Archive,
  BarChart3,
  Settings,
  ShieldCheck,
  UserCheck,
  Boxes,
  Bell,
  BookOpen,
  User
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { counts, activeIncident } = useSRE();

  const isResolved = activeIncident?.status === 'RESOLVED';

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Live Monitoring', path: '/monitoring', icon: Activity, badge: counts.total.toString() },
    { name: 'Dependency Map', path: '/dependency-map', icon: Network },
    { name: '3D Digital Twin', path: '/digital-twin', icon: Boxes },
    {
      name: 'Incidents',
      path: '/incidents',
      icon: AlertTriangle,
      badge: !isResolved ? '1' : undefined,
      badgeColor: 'bg-red-500'
    },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: !isResolved ? '3' : undefined, badgeColor: 'bg-red-500' },
    { name: 'Anomaly Detection', path: '/anomalies', icon: ShieldAlert },
    { name: 'Root Cause Analysis', path: '/root-cause', icon: Target },
    { name: 'Config Changes', path: '/config-analysis', icon: Sliders },
    { name: 'Incident Replay', path: '/incident-replay', icon: RotateCcw },
    { name: 'AI Recovery Advisor', path: '/recovery-advisor', icon: Sparkles, highlight: true },
    { name: 'Failure Simulation', path: '/simulation', icon: Flame },
    { name: 'Recovery Validation', path: '/validation', icon: CheckCircle2 },
    { name: 'Predictive Analysis', path: '/predictive', icon: TrendingUp },
    { name: 'Incident History', path: '/history', icon: Archive },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Admin Dashboard', path: '/admin', icon: ShieldCheck },
    { name: 'User Profile', path: '/profile', icon: User },
    { name: 'Documentation', path: '/docs', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="flex flex-col w-64 border-r border-slate-200 bg-white text-slate-700 dark:border-gray-800 dark:bg-[#0B0F17] dark:text-gray-300 min-h-[calc(100vh-4rem)] transition-colors duration-150">
      {/* Section Header */}
      <div className="px-5 pt-4 pb-2 text-[10px] font-bold tracking-widest text-slate-400 dark:text-gray-400 uppercase font-mono">
        Command Navigation
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto max-h-[calc(100vh-14rem)]">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-700 border-l-2 border-cyan-500 font-semibold dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    item.highlight
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : 'text-slate-400 group-hover:text-slate-700 dark:text-gray-400 dark:group-hover:text-gray-200'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
                    item.badgeColor || 'bg-slate-200 text-slate-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Role Control Panel (RBAC Quick Switcher) */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 dark:border-gray-800/80 dark:bg-gray-950/60 mt-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>Active Role</span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30">
            {user?.role || 'SRE Engineer'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => switchRole('Admin')}
            className={`py-1 text-[10px] font-medium rounded transition cursor-pointer ${
              user?.role === 'Admin'
                ? 'bg-purple-100 text-purple-700 border border-purple-300 dark:bg-purple-600/40 dark:text-purple-200 dark:border-purple-500/50'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => switchRole('SRE Engineer')}
            className={`py-1 text-[10px] font-medium rounded transition cursor-pointer ${
              user?.role === 'SRE Engineer'
                ? 'bg-cyan-100 text-cyan-800 border border-cyan-300 dark:bg-cyan-600/40 dark:text-cyan-200 dark:border-cyan-500/50'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
            }`}
          >
            SRE
          </button>
          <button
            onClick={() => switchRole('Viewer')}
            className={`py-1 text-[10px] font-medium rounded transition cursor-pointer ${
              user?.role === 'Viewer'
                ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-600/40 dark:text-amber-200 dark:border-amber-500/50'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Viewer
          </button>
        </div>
      </div>
    </aside>
  );
};
