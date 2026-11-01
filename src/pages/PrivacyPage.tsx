import React, { useState } from 'react';
import { ShieldCheck, Lock, EyeOff, Server, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const [telemetryEnabled, setTelemetryEnabled] = useState(true);
  const [rcaTracingEnabled, setRcaTracingEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('cascade_cookie_consent', JSON.stringify({
      essential: true,
      telemetry: telemetryEnabled,
      aiAnalytics: rcaTracingEnabled,
      updatedAt: new Date().toISOString()
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-cyan-400" />
          <span>Privacy & SRE Telemetry Data Governance</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          MachineMind AI Feature 2: Enterprise data privacy, telemetry compliance, and telemetry storage preferences
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Telemetry privacy preferences updated successfully.</span>
        </div>
      )}

      {/* Core Privacy Commitments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <EyeOff className="h-4 w-4" />
            <h3 className="text-xs font-bold font-mono uppercase">Zero PII Ingested</h3>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            All traces, spans, and metrics are stripped of user passwords, credit card tokens, and email payloads at ingress proxies.
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-400">
            <Lock className="h-4 w-4" />
            <h3 className="text-xs font-bold font-mono uppercase">Cryptographic Hashing</h3>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            All configuration states and parameters are fingerprinted using SHA-256 before anomaly comparison, preventing cleartext leaks.
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Server className="h-4 w-4" />
            <h3 className="text-xs font-bold font-mono uppercase">SOC-2 & GDPR Compliant</h3>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Meets enterprise operational standards for incident data residency, audit trail immutability, and 30-day retention policies.
          </p>
        </div>
      </div>

      {/* Detailed Privacy Breakdown */}
      <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase font-mono border-b border-gray-800 pb-2">
          1. Telemetry Collection Scope
        </h3>
        <p className="text-xs text-gray-300 leading-relaxed">
          CASCADE // AI collects systems-level operational telemetry to detect cascading failures. This includes:
        </p>
        <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1">
          <li><strong>Resource Utilization:</strong> CPU load percentage, heap memory allocation, disk I/O throughput.</li>
          <li><strong>Network Metrics:</strong> P50/P90/P99 latency, request rates (RPS), HTTP 4xx and 5xx error distribution.</li>
          <li><strong>Topology Edges:</strong> Inter-service RPC call rates and connection pool saturation.</li>
          <li><strong>Configuration Revisions:</strong> Service config change timestamps, parameter diffs, and deployer author IDs.</li>
        </ul>

        <h3 className="text-sm font-bold text-white uppercase font-mono border-b border-gray-800 pb-2 pt-2">
          2. Machine Learning Anomaly Detection Data Usage
        </h3>
        <p className="text-xs text-gray-300 leading-relaxed">
          Scikit-learn Isolation Forest and Monte Carlo simulations process metrics locally within your cluster boundary.
          No operational telemetry or topology graphs are shared with external third-party model providers.
        </p>

        <h3 className="text-sm font-bold text-white uppercase font-mono border-b border-gray-800 pb-2 pt-2">
          3. Manage Observability Consent
        </h3>
        <div className="space-y-3 rounded-lg border border-gray-800 bg-gray-950/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white">Live Metrics Telemetry Stream</span>
              <p className="text-[11px] text-gray-400">Stream 1-second interval Prometheus metrics for live status dashboards.</p>
            </div>
            <input
              type="checkbox"
              checked={telemetryEnabled}
              onChange={e => setTelemetryEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-cyan-500 focus:ring-0"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
            <div>
              <span className="text-xs font-semibold text-white">AI Root Cause Tracing & Causal Graphs</span>
              <p className="text-[11px] text-gray-400">Allow AI Engine to correlate configuration changes and dependency edges.</p>
            </div>
            <input
              type="checkbox"
              checked={rcaTracingEnabled}
              onChange={e => setRcaTracingEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-cyan-500 focus:ring-0"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold text-xs hover:bg-cyan-500 transition shadow"
            >
              Update Privacy Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
