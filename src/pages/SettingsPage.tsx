import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSRE } from '../context/SREContext';
import {
  Settings,
  Sun,
  Moon,
  Shield,
  Bell,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Globe,
  Save,
  FileText,
  User,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from '../router';

export const SettingsPage: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { livePolling, setLivePolling } = useSRE();
  const navigate = useNavigate();

  const [slackWebhook, setSlackWebhook] = useState('https://hooks.slack.com/services/T000/B000/XXXX');
  const [pagerDutyKey, setPagerDutyKey] = useState('pd-live-cascade-sre-8492');
  const [latencyThreshold, setLatencyThreshold] = useState(250);
  const [errorThreshold, setErrorThreshold] = useState(5.0);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-cyan-400" />
          <span>SRE Command Center Settings & Preferences</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Page 16: Appearance themes, role permissions, alert dispatch webhooks, and telemetry thresholds
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Configuration saved successfully. Alerting thresholds updated across the cluster.</span>
        </div>
      )}

      {/* Theme Settings */}
      <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-mono">Appearance & Theme</h3>
            <p className="text-xs text-gray-400">Toggle between professional SRE dark and high-contrast light modes</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-xs font-semibold text-white hover:bg-gray-800 transition"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-400" />}
            <span>Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </div>

      {/* Active Role & Access Control */}
      <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-mono">Role-Based Access Control (RBAC)</h3>
            <p className="text-xs text-gray-400">Switch current active profile and authorization level</p>
          </div>
          <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800">
            {user?.role}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Admin', 'SRE Engineer', 'Viewer'] as const).map(r => (
            <div
              key={r}
              onClick={() => switchRole(r)}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                user?.role === r
                  ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500'
                  : 'border-gray-800 bg-gray-900/60 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-white">{r}</span>
                {user?.role === r && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
              </div>
              <p className="text-[11px] text-gray-400">
                {r === 'Admin'
                  ? 'Full cluster command: triage, shadow drift rollback, and user management.'
                  : r === 'SRE Engineer'
                  ? 'Reliability engineering: RCA engine, recovery simulations, and chaos tests.'
                  : 'Read-only telemetry monitoring, incident replay, and report downloads.'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Alerting Webhooks Form */}
      <form onSubmit={handleSave} className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-5">
        <h3 className="text-sm font-bold text-white uppercase font-mono pb-3 border-b border-gray-800">
          Automated Smart Incident Webhooks
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Slack Incoming Webhook URL</label>
            <input
              type="text"
              value={slackWebhook}
              onChange={e => setSlackWebhook(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white font-mono outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">PagerDuty Integration Routing Key</label>
            <input
              type="text"
              value={pagerDutyKey}
              onChange={e => setPagerDutyKey(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white font-mono outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Ingress Latency Anomaly Threshold (ms)
            </label>
            <input
              type="number"
              value={latencyThreshold}
              onChange={e => setLatencyThreshold(parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white font-mono outline-none focus:border-cyan-500"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">Default: 250ms (Trigger for SEV-1 alert)</span>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Error Rate Critical Threshold (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={errorThreshold}
              onChange={e => setErrorThreshold(parseFloat(e.target.value))}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white font-mono outline-none focus:border-cyan-500"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">Default: 5.0% sustained error rate</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pollingCheck"
              checked={livePolling}
              onChange={e => setLivePolling(e.target.checked)}
              className="rounded accent-cyan-500"
            />
            <label htmlFor="pollingCheck" className="text-xs text-gray-300 cursor-pointer">
              Enable real-time background telemetry stream polling
            </label>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Enterprise Compliance, Privacy & Governance Links */}
      <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase font-mono border-b border-gray-800 pb-2">
          Enterprise Compliance & Governance Resources
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div
            onClick={() => navigate('/profile')}
            className="p-3.5 rounded-xl border border-gray-800 bg-gray-950/70 hover:border-cyan-500/50 cursor-pointer transition space-y-1 group"
          >
            <div className="flex items-center justify-between text-cyan-400">
              <User className="h-4 w-4" />
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
            </div>
            <div className="text-xs font-bold text-white">SRE User Profile</div>
            <p className="text-[10px] text-gray-400">Account info, SSH tokens & contact keys</p>
          </div>

          <div
            onClick={() => navigate('/admin')}
            className="p-3.5 rounded-xl border border-gray-800 bg-gray-950/70 hover:border-purple-500/50 cursor-pointer transition space-y-1 group"
          >
            <div className="flex items-center justify-between text-purple-400">
              <ShieldCheck className="h-4 w-4" />
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
            </div>
            <div className="text-xs font-bold text-white">Admin Dashboard</div>
            <p className="text-[10px] text-gray-400">Role permissions & cluster lockdown</p>
          </div>

          <div
            onClick={() => navigate('/privacy')}
            className="p-3.5 rounded-xl border border-gray-800 bg-gray-950/70 hover:border-emerald-500/50 cursor-pointer transition space-y-1 group"
          >
            <div className="flex items-center justify-between text-emerald-400">
              <Shield className="h-4 w-4" />
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
            </div>
            <div className="text-xs font-bold text-white">Privacy & Consent</div>
            <p className="text-[10px] text-gray-400">Telemetry scope & data boundaries</p>
          </div>

          <div
            onClick={() => navigate('/docs')}
            className="p-3.5 rounded-xl border border-gray-800 bg-gray-950/70 hover:border-blue-500/50 cursor-pointer transition space-y-1 group"
          >
            <div className="flex items-center justify-between text-blue-400">
              <BookOpen className="h-4 w-4" />
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
            </div>
            <div className="text-xs font-bold text-white">SRE Runbooks</div>
            <p className="text-[10px] text-gray-400">IEEE architecture & troubleshooting</p>
          </div>
        </div>
      </div>
    </div>
  );
};
