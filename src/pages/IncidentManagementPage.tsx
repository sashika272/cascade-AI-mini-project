import React, { useState, useEffect } from 'react';
import { useSRE } from '../context/SREContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import { Incident } from '../types';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Send,
  MessageSquare,
  ArrowRight,
  User,
  Radio,
  FileText
} from 'lucide-react';
import { useNavigate } from '../router';

export const IncidentManagementPage: React.FC = () => {
  const { activeIncident, refreshData, counts } = useSRE();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await apiClient.getIncidents();
      if (data && data.incidents) {
        setIncidents(data.incidents);
        setSelectedIncident(data.incidents[0]);
      }
    }
    load();
  }, [activeIncident]);

  const handleStatusChange = async (newStatus: 'INVESTIGATING' | 'MITIGATING' | 'RESOLVED') => {
    if (!selectedIncident) return;
    setUpdating(true);
    try {
      await fetch(`/api/incidents/${selectedIncident.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, author: user?.name || 'SRE Lead' })
      });
      await refreshData();
      setSelectedIncident({
        ...selectedIncident,
        status: newStatus,
        notes: [
          ...selectedIncident.notes,
          {
            author: user?.name || 'SRE Lead',
            timestamp: new Date().toLocaleTimeString(),
            text: `Incident status updated to ${newStatus}`
          }
        ]
      });
    } catch {
      // Local fallback
      setSelectedIncident({
        ...selectedIncident,
        status: newStatus
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedIncident) return;
    const noteObj = {
      author: user?.name || 'SRE Responder',
      timestamp: new Date().toLocaleTimeString(),
      text: newNote.trim()
    };
    try {
      await fetch(`/api/incidents/${selectedIncident.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteObj)
      });
    } catch {}

    setSelectedIncident({
      ...selectedIncident,
      notes: [...selectedIncident.notes, noteObj]
    });
    setNewNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Incident Management & Response Triage</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Module 7: Active SEV-1 incident workflow, status escalation, responder audit notes, and post-mortem
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/recovery-advisor')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition"
          >
            <span>Execute AI Recovery</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Incident Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-4">
          <div className="text-[10px] uppercase font-bold text-red-300 font-mono">Active Cascading Outages</div>
          <div className="mt-1 font-mono text-2xl font-black text-red-400">
            {selectedIncident?.status === 'RESOLVED' ? 0 : 1}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">SEV-1 Critical Severity</div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4">
          <div className="text-[10px] uppercase font-bold text-gray-400 font-mono">Affected Microservices</div>
          <div className="mt-1 font-mono text-2xl font-black text-white">
            {selectedIncident?.status === 'RESOLVED' ? 0 : counts.critical} <span className="text-xs text-gray-500">/ 17</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Blast radius depth: 4 tiers</div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4">
          <div className="text-[10px] uppercase font-bold text-gray-400 font-mono">Root Cause Attribution</div>
          <div className="mt-1 font-mono text-sm font-bold text-cyan-400 truncate">
            cfg-1003 @ network-gateway
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Confidence: 98.6%</div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4">
          <div className="text-[10px] uppercase font-bold text-gray-400 font-mono">Decoy Status</div>
          <div className="mt-1 font-mono text-sm font-bold text-amber-400 truncate">
            cfg-2001 (Disqualified)
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Symptom trap avoided</div>
        </div>
      </div>

      {/* Selected Incident Detail Card */}
      {selectedIncident && (
        <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-gray-800 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-red-600 text-white font-mono text-xs font-bold">
                  {selectedIncident.severity}
                </span>
                <span className="font-mono text-xs text-gray-400">{selectedIncident.id}</span>
                <span className="text-gray-500">•</span>
                <span className="text-xs text-gray-400 font-sans">
                  Detected at: {new Date(selectedIncident.createdAt).toUTCString()}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">{selectedIncident.title}</h2>
              <p className="text-xs text-gray-300 font-sans leading-relaxed max-w-3xl">
                {selectedIncident.currentSummary}
              </p>
            </div>

            {/* Status Change Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono uppercase font-bold mr-1">Triage:</span>
              {(['INVESTIGATING', 'MITIGATING', 'RESOLVED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  disabled={updating}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                    selectedIncident.status === st
                      ? st === 'RESOLVED'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : st === 'MITIGATING'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline and Notes Dual Column */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline Sequence */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span>Incident Chronology</span>
              </h3>

              <div className="space-y-2 border-l-2 border-gray-800 pl-4">
                {selectedIncident.timeline.map((item, idx) => (
                  <div key={idx} className="relative text-xs">
                    <div
                      className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${
                        item.status === 'TRIGGER'
                          ? 'bg-red-500 ring-2 ring-red-500/30'
                          : item.status === 'DECOY'
                          ? 'bg-amber-500'
                          : item.status === 'CRITICAL' || item.status === 'COLLAPSE'
                          ? 'bg-red-600'
                          : 'bg-cyan-500'
                      }`}
                    />
                    <div className="font-mono text-cyan-400 font-bold">{item.time}</div>
                    <div className="text-gray-300 font-sans">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Responder Notes & Post-Mortem Log */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-cyan-400" />
                <span>SRE Responder Notes</span>
              </h3>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
                {selectedIncident.notes.map((note, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-800 bg-gray-950/60 p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        {note.author}
                      </span>
                      <span className="text-gray-500 font-mono">{note.timestamp}</span>
                    </div>
                    <p className="text-gray-300 font-sans leading-relaxed">{note.text}</p>
                  </div>
                ))}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Record responder triage note..."
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Send className="h-3 w-3" />
                  <span>Log</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
