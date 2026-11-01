import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSRE } from '../../context/SREContext';
import {
  Activity,
  Sun,
  Moon,
  Search,
  Bell,
  LogOut,
  Sparkles,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from '../../router';

interface HeaderProps {
  onOpenCopilot?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCopilot }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery, activeIncident, cascadeRisk } = useSRE();
  const navigate = useNavigate();

  const isResolved = activeIncident?.status === 'RESOLVED';

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md text-slate-800 dark:border-gray-800 dark:bg-[#0B0F17]/95 dark:text-gray-100 transition-colors duration-150">
      {/* Brand Logo & Subtitle */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => navigate('/')}
          className="flex cursor-pointer items-center gap-2.5 transition-transform hover:scale-105"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-base font-extrabold tracking-wider text-slate-900 dark:text-white">CASCADE</span>
              <span className="rounded bg-cyan-50 text-cyan-600 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30 px-1.5 py-0.5 font-mono text-xs font-semibold">
                AI // SRE
              </span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-gray-400">
              Observability Command Center
            </div>
          </div>
        </div>
      </div>

      {/* Incident Status Alert Banner */}
      <div className="hidden lg:flex items-center shrink-0">
        {!isResolved ? (
          <div
            onClick={() => navigate('/incidents')}
            className="flex cursor-pointer items-center gap-2.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-1 text-xs font-medium text-red-700 shadow-inner transition-all hover:bg-red-100 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
            <span className="font-semibold tracking-wide text-red-700 dark:text-red-200">
              SEV-1 CASCADING OUTAGE DETECTED
            </span>
            <span className="h-3 w-px bg-red-300 dark:bg-red-500/40" />
            <span className="font-mono text-red-600 dark:text-red-400 font-bold">Risk: {cascadeRisk}%</span>
          </div>
        ) : (
          <div
            onClick={() => navigate('/incidents')}
            className="flex cursor-pointer items-center gap-2.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-medium text-emerald-700 shadow-inner dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            <span className="font-semibold tracking-wide text-emerald-800 dark:text-emerald-200">
              ALL 17 SERVICES OPERATIONAL
            </span>
            <span className="h-3 w-px bg-emerald-300 dark:bg-emerald-500/40" />
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">SLO Compliance: 99.98%</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mx-3 hidden md:block w-48 lg:w-64 shrink-0">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search microservices..."
          className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-200 dark:placeholder-gray-500 shadow-sm"
        />
      </div>

      {/* Right Controls: Copilot button, Theme toggle, Notification bell, User info, Sign out */}
      <div className="flex items-center gap-3">
        {/* Launch AI Copilot Engine Button */}
        <button
          onClick={() => {
            if (onOpenCopilot) onOpenCopilot();
            else navigate('/root-cause');
          }}
          className="hidden sm:flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold !text-white text-white shadow-md shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/30 active:scale-95 cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-100" />
          <span className="!text-white text-white font-medium">Launch AI Copilot Engine</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-500" />}
        </button>

        {/* Notification Bell */}
        <div
          onClick={() => navigate('/notifications')}
          className="relative cursor-pointer rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <Bell className="h-4 w-4" />
          {!isResolved && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              3
            </span>
          )}
        </div>

        {/* User Profile Card */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-gray-800">
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 cursor-pointer group"
              title="View Profile & Credentials"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full border border-slate-300 dark:border-gray-700 object-cover group-hover:border-cyan-500 transition"
              />
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-800 group-hover:text-cyan-600 dark:text-gray-200 dark:group-hover:text-cyan-300 transition">{user.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-gray-400">{user.title}</div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="ml-1 text-xs text-slate-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition flex items-center gap-1 p-1 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-[11px]">Sign out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
