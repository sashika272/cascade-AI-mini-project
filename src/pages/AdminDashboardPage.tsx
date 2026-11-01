import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import {
  ShieldAlert,
  Users,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  UserPlus,
  Trash2,
  Activity,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [lockdown, setLockdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('SRE Engineer');
  const [inviteTitle, setInviteTitle] = useState('Reliability Engineer');

  // Search & Filter
  const [userSearch, setUserSearch] = useState('');
  const [auditSeverity, setAuditSeverity] = useState('ALL');

  // Message alert
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [userData, auditData, statusData] = await Promise.all([
      apiClient.getAdminUsers(),
      apiClient.getAuditLogs(),
      apiClient.getSystemStatus()
    ]);
    if (userData && userData.users) setUsers(userData.users);
    if (auditData && auditData.auditLogs) setAuditLogs(auditData.auditLogs);
    if (statusData) {
      setSystemStatus(statusData);
      setLockdown(statusData.systemLockdown);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await apiClient.updateAdminUserRole(userId, newRole);
    setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
    setMessage(`Updated role to ${newRole} for user.`);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (window.confirm(`Are you sure you want to deactivate and remove ${name}?`)) {
      await apiClient.deleteAdminUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setMessage(`User ${name} has been removed.`);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiClient.inviteAdminUser({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      title: inviteTitle
    });
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    loadData();
    setMessage(`Invited ${inviteName} as ${inviteRole}.`);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleToggleLockdown = async () => {
    const res = await apiClient.toggleLockdown();
    setLockdown(res.systemLockdown);
    setMessage(res.message);
    setTimeout(() => setMessage(null), 4000);
    loadData();
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAudits = auditLogs.filter(a => {
    if (auditSeverity !== 'ALL' && a.severity !== auditSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-purple-400" />
            <span>Admin Command Dashboard & RBAC Governance</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            MachineMind AI Feature 5: Multi-tenant user administration, cluster lockdown, and security audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleLockdown}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow ${
              lockdown
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {lockdown ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            <span>{lockdown ? 'Release Lockdown' : 'Emergency Lockdown'}</span>
          </button>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite SRE</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Cluster Health & Lockdown Banner */}
      {lockdown && (
        <div className="p-4 rounded-xl border border-red-500/60 bg-red-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
            <div>
              <div className="text-xs font-bold uppercase text-red-200 tracking-wider">
                SYSTEM LOCKDOWN ACTIVE
              </div>
              <p className="text-[11px] text-red-300">
                All production configuration modifications, canary pushes, and auto-deployments are frozen.
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleLockdown}
            className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
          >
            Release Lockdown
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">Total SRE Users</div>
          <div className="text-2xl font-extrabold text-white mt-1">{users.length}</div>
          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="text-purple-400 font-semibold">{users.filter(u => u.role === 'Admin').length} Admin</span> · {users.filter(u => u.role === 'SRE Engineer').length} SRE
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">Microservices Monitored</div>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1">{systemStatus?.microservicesTotal || 17}</div>
          <div className="text-[10px] text-gray-400 mt-1">Full ingress chain topology</div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">Backend Memory Heap</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{systemStatus?.memoryUsageMB || 48} MB</div>
          <div className="text-[10px] text-gray-400 mt-1">Node {systemStatus?.nodeVersion || 'v26.12.1'}</div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">Security Compliance</div>
          <div className="text-sm font-bold text-white mt-2">ISO-27001 / SOC-2</div>
          <div className="text-[10px] text-emerald-400 mt-1">Active verified status</div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              <span>SRE Platform Users & Role Assignment</span>
            </h3>
            <p className="text-xs text-gray-400">Configure permission tiers: Admin (Full Access), SRE Engineer (Remediate), Viewer (Read-only)</p>
          </div>

          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
            <input
              type="text"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="Search user..."
              className="w-full rounded-lg border border-gray-800 bg-gray-950 py-1.5 pl-8 pr-3 text-xs text-white placeholder-gray-500 outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-800 text-[10px] font-bold uppercase text-gray-400">
              <tr>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role Tier</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-900/40 transition">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="h-7 w-7 rounded-full object-cover border border-gray-700"
                      />
                      <div>
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-[10px] text-gray-400">{u.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-300">{u.email}</td>
                  <td className="py-3 px-3">
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      className="rounded border border-gray-800 bg-gray-950 px-2 py-1 text-xs text-white outline-none focus:border-cyan-500"
                    >
                      <option value="Admin">Admin</option>
                      <option value="SRE Engineer">SRE Engineer</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      title="Deactivate User"
                      className="text-gray-500 hover:text-red-400 transition p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Logs */}
      <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span>Immutable Security & Operations Audit Trail</span>
            </h3>
            <p className="text-xs text-gray-400">Chronological ledger of logins, role elevation, simulations, and config lockouts</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-gray-500" />
            <select
              value={auditSeverity}
              onChange={e => setAuditSeverity(e.target.value)}
              className="rounded-lg border border-gray-800 bg-gray-950 px-2.5 py-1 text-xs text-white outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {filteredAudits.map(log => (
            <div
              key={log.id}
              className="flex items-center justify-between rounded-lg border border-gray-800/80 bg-gray-950/60 p-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                      log.severity === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : log.severity === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : log.severity === 'MEDIUM'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="font-semibold text-gray-300">{log.actor}</span>
                </div>
                <div className="text-gray-400 text-[11px]">{log.details}</div>
              </div>
              <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1 whitespace-nowrap">
                <Clock className="h-3 w-3" />
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono border-b border-gray-800 pb-2">
              Invite SRE Team Member
            </h3>
            <form onSubmit={handleInviteUser} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder="e.g. Rachel Zane"
                  required
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300">Work Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="rachel.zane@sre.corp"
                  required
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300">Job Title</label>
                <input
                  type="text"
                  value={inviteTitle}
                  onChange={e => setInviteTitle(e.target.value)}
                  placeholder="Reliability Specialist"
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300">Role Tier</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                >
                  <option value="SRE Engineer">SRE Engineer</option>
                  <option value="Viewer">Viewer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-700 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
