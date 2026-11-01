import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { AnomalyItem } from '../types';
import { ShieldAlert, AlertTriangle, AlertCircle, Filter, Sparkles, CheckCircle2 } from 'lucide-react';

export const AnomalyDetectionPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [sensitivity, setSensitivity] = useState<number>(0.05);

  useEffect(() => {
    async function fetchAnomalies() {
      setLoading(true);
      const data = await apiClient.getAnomalies(undefined, severityFilter !== 'ALL' ? severityFilter : undefined);
      if (data && data.anomalies) {
        setAnomalies(data.anomalies);
      }
      setLoading(false);
    }
    fetchAnomalies();
  }, [severityFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-cyan-400" />
            <span>Anomaly Detection & Telemetry Analysis</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Module 2: Isolation Forest machine learning & statistical persistence filters for non-crashing latency drift
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-gray-400" />
          <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800 text-xs">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(s => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1 rounded font-semibold transition ${
                  severityFilter === s
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model Parameters Card */}
      <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-white uppercase font-mono tracking-wider">
              Scikit-Learn IsolationForest Pipeline
            </span>
          </div>
          <p className="text-gray-400">
            Features: <code className="text-cyan-300 font-mono">response_time_ms</code>, <code className="text-cyan-300 font-mono">latency_p99_ms</code>, <code className="text-cyan-300 font-mono">error_rate</code>, <code className="text-cyan-300 font-mono">cpu_usage</code>. Evaluates 15s persistence sliding window.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] text-gray-500 block uppercase font-bold">Contamination Sensitivity</span>
            <input
              type="range"
              min="0.01"
              max="0.20"
              step="0.01"
              value={sensitivity}
              onChange={e => setSensitivity(parseFloat(e.target.value))}
              className="accent-cyan-500 w-32 cursor-pointer"
            />
            <span className="font-mono text-cyan-400 ml-2 font-bold">{sensitivity}</span>
          </div>

          <div className="border-l border-gray-800 pl-4">
            <span className="text-[10px] text-gray-500 block uppercase font-bold">First Persistent Onset</span>
            <span className="font-mono text-red-400 font-bold">T+48 (10:41:48 AM)</span>
          </div>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-3">
        {anomalies.map(item => (
          <div
            key={item.id}
            className={`rounded-xl border p-4 transition-all ${
              item.severity === 'CRITICAL'
                ? 'border-red-500/40 bg-red-950/20'
                : item.severity === 'HIGH'
                ? 'border-amber-500/40 bg-amber-950/20'
                : 'border-blue-500/30 bg-blue-950/20'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-800/60 gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    item.severity === 'CRITICAL'
                      ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                      : item.severity === 'HIGH'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                      : 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                  }`}
                >
                  {item.severity}
                </span>
                <span className="font-mono text-sm font-bold text-white">{item.service_id}</span>
                <span className="font-mono text-xs text-gray-400">@ {item.time_offset}</span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-gray-400">
                  Anomaly Score: <strong className="text-cyan-400 font-bold">{(item.anomaly_score * 100).toFixed(1)}%</strong>
                </span>
                {item.is_persistent && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-700">
                    <CheckCircle2 className="h-3 w-3" /> Sustained
                  </span>
                )}
              </div>
            </div>

            {/* Evidence & Metrics Breakdown */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="md:col-span-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Detection Evidence
                </span>
                <p className="text-gray-300 leading-relaxed font-sans">{item.evidence}</p>
              </div>

              <div className="bg-gray-950/50 p-2.5 rounded-lg border border-gray-800 font-mono">
                <span className="text-[10px] text-gray-400 block font-sans">Observed Latency</span>
                <div className="font-bold text-cyan-400">{item.metrics.response_time_ms} ms</div>
                <div className="text-[10px] text-gray-500">P99: {item.metrics.latency_p99_ms} ms</div>
              </div>

              <div className="bg-gray-950/50 p-2.5 rounded-lg border border-gray-800 font-mono">
                <span className="text-[10px] text-gray-400 block font-sans">Error & Utilization</span>
                <div className="font-bold text-red-400">{item.metrics.error_rate} % errors</div>
                <div className="text-[10px] text-gray-500">CPU: {item.metrics.cpu_usage} %</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
