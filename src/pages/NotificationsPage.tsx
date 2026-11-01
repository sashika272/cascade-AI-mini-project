import React, { useState, useEffect } from 'react';
import { useNavigate } from '../router';
import { apiClient } from '../services/api';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCheck,
  Filter,
  ArrowRight,
  ExternalLink,
  Plus
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newSeverity, setNewSeverity] = useState('WARNING');
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    const data = await apiClient.getNotifications(filter);
    if (data && data.notifications) {
      setNotifications(data.notifications);
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    await apiClient.markNotificationRead(id);
    setNotifications(notifications.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await apiClient.markAllNotificationsRead();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDispatchNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newMessage) return;
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          message: newMessage,
          severity: newSeverity,
          serviceId: 'network-gateway'
        })
      });
      setShowDispatchModal(false);
      setNewTitle('');
      setNewMessage('');
      loadNotifications();
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
            <span>Alerts & SRE Incident Notifications</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            MachineMind AI Feature 11: Real-time telemetry breaches, configuration drifts, and decoy rejection alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white transition"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark All Read</span>
            </button>
          )}

          <button
            onClick={() => setShowDispatchModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Dispatch Alert</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
        <div className="flex items-center gap-1">
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filter === sev
                  ? 'bg-blue-600 text-white font-bold shadow-sm dark:bg-cyan-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-gray-400">
          Unread: <span className="text-red-600 dark:text-red-400 font-bold">{unreadCount}</span> / Total: {notifications.length}
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-gray-500 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0F172A]">
            No alerts found for selected severity level.
          </div>
        ) : (
          notifications.map(item => {
            const isCritical = item.severity === 'CRITICAL';
            const isWarning = item.severity === 'WARNING';

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 transition shadow-sm ${
                  item.read
                    ? 'border-slate-200 bg-white text-slate-700 dark:border-gray-800/80 dark:bg-[#0F172A]/70 dark:text-gray-300'
                    : 'border-blue-200 bg-blue-50/40 text-slate-900 shadow-sm dark:border-cyan-500/40 dark:bg-[#0F172A] dark:text-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 rounded-lg p-2 ${
                        isCritical
                          ? 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-950/80 dark:text-red-400 dark:border-red-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-800'
                          : 'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-950/80 dark:text-blue-400 dark:border-blue-800'
                      }`}
                    >
                      {isCritical ? (
                        <AlertOctagon className="h-4 w-4" />
                      ) : isWarning ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Info className="h-4 w-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</span>
                        {!item.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" />
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                            isCritical
                              ? 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
                              : isWarning
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                          }`}
                        >
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">{item.message}</p>
                      <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-slate-500 dark:text-gray-500">
                        <span>Service: <strong className="text-slate-800 dark:text-gray-300">{item.serviceId}</strong></span>
                        {item.incidentId && (
                          <span
                            onClick={() => navigate('/incidents')}
                            className="cursor-pointer text-blue-600 hover:underline dark:text-cyan-400 flex items-center gap-0.5 font-medium"
                          >
                            Incident: {item.incidentId} <ExternalLink className="h-2.5 w-2.5" />
                          </span>
                        )}
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!item.read && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        className="rounded-lg border border-slate-300 bg-white hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition"
                      >
                        Acknowledge
                      </button>
                    )}
                    {item.incidentId && (
                      <button
                        onClick={() => navigate('/root-cause')}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition"
                      >
                        <span>Investigate</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dispatch Custom Alert Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0F172A] p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono border-b border-slate-200 dark:border-gray-800 pb-2">
              Dispatch SRE Alert Notification
            </h3>
            <form onSubmit={handleDispatchNotification} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-gray-300">Alert Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Rate Limit Exhaustion"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-gray-300">Severity</label>
                <select
                  value={newSeverity}
                  onChange={e => setNewSeverity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:border-cyan-500"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="WARNING">WARNING</option>
                  <option value="INFO">INFO</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-gray-300">Message Description</label>
                <textarea
                  rows={3}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Describe the operational anomaly..."
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
                >
                  Publish Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
