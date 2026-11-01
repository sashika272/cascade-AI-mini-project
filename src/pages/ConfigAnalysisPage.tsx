import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { ConfigChange, SabotageDrop } from '../types';
import { Sliders, ShieldAlert, AlertTriangle, FileCode, Plus, CheckCircle2 } from 'lucide-react';

export const ConfigAnalysisPage: React.FC = () => {
  const [changes, setChanges] = useState<ConfigChange[]>([]);
  const [sabotageDrops, setSabotageDrops] = useState<SabotageDrop[]>([]);
  const [activeTab, setActiveTab] = useState<'approved' | 'sabotage'>('approved');
  const [showAddModal, setShowAddModal] = useState(false);

  // New config audit form state
  const [newSvc, setNewSvc] = useState('network-gateway');
  const [newParam, setNewParam] = useState('');
  const [newVal, setNewVal] = useState('');

  useEffect(() => {
    async function load() {
      const cData = await apiClient.getConfigChanges();
      if (cData && cData.changes) setChanges(cData.changes);
      const sData = await apiClient.getSabotageDrops();
      if (sData && sData.unauthorized_drifts) setSabotageDrops(sData.unauthorized_drifts);
    }
    load();
  }, []);

  const handleAddAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParam || !newVal) return;
    const added: ConfigChange = {
      change_id: `cfg-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      time_offset: 'T+NOW',
      service_id: newSvc,
      parameter: newParam,
      old_value: 'N/A',
      new_value: newVal,
      author: 'Current SRE Lead',
      change_type: 'manual_override',
      approved: 'true',
      risk_score: '0.10',
      notes: 'SRE audit entry recorded directly from Command Center.'
    };
    setChanges([added, ...changes]);
    setShowAddModal(false);
    setNewParam('');
    setNewVal('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
            <span>Configuration Drift & Sabotage Detection</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Module 4: Correlating configuration drift, GitOps audit trails, and unauthorized sabotage drops
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Record Config Change</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('approved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'approved'
              ? 'bg-blue-50 text-blue-700 border border-blue-300 font-bold dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/50'
          }`}
        >
          <FileCode className="h-4 w-4" />
          <span>Approved Configuration History ({changes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sabotage')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'sabotage'
              ? 'bg-red-50 text-red-700 border border-red-300 font-bold dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/50'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Sabotage & Shadow Drift Injections ({sabotageDrops.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'approved' ? (
        <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0F172A] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 dark:bg-gray-950/80 text-[10px] uppercase font-bold text-slate-700 dark:text-gray-400 tracking-wider border-b border-slate-200 dark:border-gray-800">
                <tr>
                  <th className="py-3 px-4">Change ID & Time</th>
                  <th className="py-3 px-3">Target Service</th>
                  <th className="py-3 px-3">Parameter</th>
                  <th className="py-3 px-3">Old Value</th>
                  <th className="py-3 px-3">New Value</th>
                  <th className="py-3 px-3">Author</th>
                  <th className="py-3 px-3">Risk</th>
                  <th className="py-3 px-4">Verdict / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60">
                {changes.map(ch => {
                  const isRoot = ch.change_id === 'cfg-1003';
                  const isDecoy = ch.change_id === 'cfg-2001';

                  return (
                    <tr
                      key={ch.change_id}
                      className={`transition ${
                        isRoot
                          ? 'bg-red-50/80 hover:bg-red-100/80 dark:bg-red-950/20 dark:hover:bg-red-950/30 font-bold'
                          : isDecoy
                          ? 'bg-amber-50/80 hover:bg-amber-100/80 dark:bg-amber-950/15 dark:hover:bg-amber-950/25'
                          : 'hover:bg-slate-50 dark:hover:bg-gray-900/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="text-slate-900 dark:text-white font-bold">{ch.change_id}</div>
                        <div className="text-[10px] text-slate-500 dark:text-gray-400 font-sans">{ch.time_offset}</div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-medium text-blue-700 dark:text-cyan-300">
                        {ch.service_id}
                      </td>

                      <td className="py-3 px-3 text-slate-800 dark:text-gray-200">{ch.parameter}</td>

                      <td className="py-3 px-3 text-slate-400 dark:text-gray-400 line-through">{ch.old_value}</td>

                      <td className="py-3 px-3">
                        <span className={`font-bold ${isRoot ? 'text-red-600 font-extrabold dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                          {ch.new_value}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-gray-300 font-sans text-[11px]">{ch.author}</td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            parseFloat(ch.risk_score) > 0.8
                              ? 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40'
                              : parseFloat(ch.risk_score) > 0.3
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                          }`}
                        >
                          {ch.risk_score}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-sans text-[11px]">
                        {isRoot && (
                          <span className="text-red-700 dark:text-red-400 font-bold block">
                            PRIMARY ROOT CAUSE CANDIDATE
                          </span>
                        )}
                        {isDecoy && (
                          <span className="text-amber-800 dark:text-amber-400 font-bold block">
                            DOWNSTREAM DECOY (REJECTED)
                          </span>
                        )}
                        <span className="text-slate-600 dark:text-gray-400">{ch.notes}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-950/20 p-4 text-xs text-red-800 dark:text-red-200">
            <strong>Security Alert:</strong> The following configuration records were detected from <code className="font-mono bg-red-100 dark:bg-red-900/50 px-1 py-0.5 rounded">sabotage_drops/config_change_addition.csv</code>. They represent shadow parameters injected directly outside authorized GitOps pull requests.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sabotageDrops.map(sab => (
              <div
                key={sab.change_id}
                className="rounded-xl border border-red-200 dark:border-red-500/40 bg-white dark:bg-gray-950/80 p-4 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-600 font-mono text-[10px] font-bold text-white">
                      {sab.threat_level} THREAT
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{sab.change_id}</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-semibold">{sab.source}</span>
                </div>

                <div className="text-xs font-mono space-y-1">
                  <div>
                    <span className="text-slate-500 dark:text-gray-500 font-sans">Target: </span>
                    <span className="text-blue-700 dark:text-cyan-300 font-bold">{sab.service_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-gray-500 font-sans">Parameter: </span>
                    <span className="text-slate-900 dark:text-white">{sab.parameter}</span>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="text-slate-500 dark:text-gray-500 font-sans text-[10px]">Old: </span>
                      <span className="line-through text-slate-400 dark:text-gray-400 text-xs">{sab.old_value}</span>
                    </div>
                    <div>
                      <span className="text-red-700 dark:text-red-400 font-sans text-[10px]">Shadow Value: </span>
                      <span className="text-red-700 dark:text-red-400 font-bold text-xs">{sab.new_value}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-gray-400 font-sans pt-1 border-t border-slate-200 dark:border-gray-800/80">
                  {sab.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Record Config Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0F172A] p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono mb-4">
              Record Configuration Change Audit
            </h3>
            <form onSubmit={handleAddAudit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-gray-300 mb-1">Target Microservice</label>
                <select
                  value={newSvc}
                  onChange={e => setNewSvc(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="network-gateway">network-gateway</option>
                  <option value="auth-service">auth-service</option>
                  <option value="checkout-service">checkout-service</option>
                  <option value="payments-service">payments-service</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-gray-300 mb-1">Parameter Name</label>
                <input
                  type="text"
                  value={newParam}
                  onChange={e => setNewParam(e.target.value)}
                  placeholder="e.g. proxy_read_timeout_ms"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-gray-300 mb-1">New Value</label>
                <input
                  type="text"
                  value={newVal}
                  onChange={e => setNewVal(e.target.value)}
                  placeholder="e.g. 5000ms"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-sm"
                >
                  Save to Audit Trail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
