import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import {
  User,
  Shield,
  Key,
  Lock,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user, switchRole } = useAuth();

  // Profile Form States
  const [name, setName] = useState(user?.name || 'Alex Mercer');
  const [title, setTitle] = useState(user?.title || 'Lead SRE Architect');
  const [email, setEmail] = useState(user?.email || 'alex.mercer@sre.corp');
  const [bio, setBio] = useState('Enterprise SRE specialist focused on distributed systems reliability, service mesh observability, and automated cascading failure mitigation.');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [timezone, setTimezone] = useState('America/New_York (UTC-5)');
  const [pagerdutyKey, setPagerdutyKey] = useState('pd-live-cascade-sre-8492');
  const [sshKey, setSshKey] = useState('ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICASCADE_SRE_KEY_2026');

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status feedback
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await apiClient.getUserProfile();
      if (res && res.user) {
        setName(res.user.name || name);
        setTitle(res.user.title || title);
        setEmail(res.user.email || email);
        if (res.user.bio) setBio(res.user.bio);
        if (res.user.phone) setPhone(res.user.phone);
        if (res.user.timezone) setTimezone(res.user.timezone);
        if (res.user.pagerdutyKey) setPagerdutyKey(res.user.pagerdutyKey);
        if (res.user.sshKey) setSshKey(res.user.sshKey);
      }
    }
    load();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await apiClient.updateUserProfile({
      name,
      title,
      bio,
      phone,
      timezone,
      pagerdutyKey,
      sshKey
    });
    setLoading(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }

    const res = await apiClient.changePassword({ currentPassword, newPassword });
    if (res && res.error) {
      setPasswordStatus({ type: 'error', message: res.error });
    } else {
      setPasswordStatus({ type: 'success', message: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordStatus(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-white flex items-center gap-2">
          <User className="h-5 w-5 text-cyan-400" />
          <span>User Profile & SRE Account Management</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          MachineMind AI Feature 4: Profile identity, security credentials, alerting keys, and role settings
        </p>
      </div>

      {profileSaved && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Profile updated and synchronized with backend registry.</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
            alt={name}
            className="h-20 w-20 rounded-2xl border-2 border-cyan-500/40 object-cover shadow-lg"
          />
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{name}</h2>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                {user?.role || 'SRE Engineer'}
              </span>
            </div>
            <p className="text-xs text-gray-300">{title}</p>
            <p className="text-[11px] text-gray-400 flex items-center gap-4 pt-1">
              <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-gray-500" /> {email}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-gray-500" /> {timezone}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Edit Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono border-b border-gray-800 pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-cyan-400" />
              <span>Personal Information & Bio</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2 text-xs text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300">Direct Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-gray-300">Timezone</label>
                <select
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                >
                  <option value="America/New_York (UTC-5)">America/New_York (UTC-5)</option>
                  <option value="America/Los_Angeles (UTC-8)">America/Los_Angeles (UTC-8)</option>
                  <option value="Europe/London (UTC+0)">Europe/London (UTC+0)</option>
                  <option value="Asia/Kolkata (UTC+5:30)">Asia/Kolkata (UTC+5:30)</option>
                  <option value="Asia/Tokyo (UTC+9)">Asia/Tokyo (UTC+9)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-gray-300">Professional Bio & SRE Responsibilities</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800/80 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition shadow"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>

          {/* SRE Integrations & SSH Keys */}
          <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono border-b border-gray-800 pb-2 flex items-center gap-2">
              <Key className="h-4 w-4 text-cyan-400" />
              <span>SRE Telemetry & Escalation Keys</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-300">PagerDuty SRE Routing Key</label>
                <input
                  type="text"
                  value={pagerdutyKey}
                  onChange={e => setPagerdutyKey(e.target.value)}
                  className="mt-1 w-full font-mono rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300">Cluster Telemetry SSH Public Key</label>
                <textarea
                  rows={2}
                  value={sshKey}
                  onChange={e => setSshKey(e.target.value)}
                  className="mt-1 w-full font-mono rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-[11px] text-gray-200 outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security Credentials & Password */}
        <div className="space-y-6">
          <form onSubmit={handleChangePassword} className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono border-b border-gray-800 pb-2 flex items-center gap-2">
              <Lock className="h-4 w-4 text-cyan-400" />
              <span>Change Security Password</span>
            </h3>

            {passwordStatus && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  passwordStatus.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}
              >
                {passwordStatus.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{passwordStatus.message}</span>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-gray-300">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-300">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-300">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-gray-800 px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-gray-700 hover:text-white transition"
            >
              Update Password
            </button>
          </form>

          {/* Quick RBAC Switcher */}
          <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white uppercase font-mono border-b border-gray-800 pb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span>Simulate Role Authorization</span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Quickly test the UI under different permission profiles.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => switchRole('Admin')}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  user?.role === 'Admin'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => switchRole('SRE Engineer')}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  user?.role === 'SRE Engineer'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                SRE
              </button>
              <button
                type="button"
                onClick={() => switchRole('Viewer')}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  user?.role === 'Viewer'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Viewer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
