import React, { useState } from 'react';
import { useSRE } from '../context/SREContext';
import { useNavigate } from '../router';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Radio,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Server,
  Zap,
  RotateCcw
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const {
    services,
    counts,
    activeFilter,
    setActiveFilter,
    activeIncident,
    cascadeRisk,
    filteredServices
  } = useSRE();
  const navigate = useNavigate();

  const isResolved = activeIncident?.status === 'RESOLVED';

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle (matches PPT Slide 12) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold tracking-tight text-white uppercase font-mono">
              SRE Command Center Overview
            </h1>
            <span className="inline-flex items-center gap-1 rounded bg-cyan-500/10 px-2 py-0.5 text-[11px] font-bold text-cyan-400 border border-cyan-500/30">
              <Radio className="h-3 w-3 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time latency drift correlation & non-crashing propagating incident detection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/incident-replay')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900 text-xs font-medium text-gray-300 hover:bg-gray-800 transition"
          >
            <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
            <span>Replay Timeline</span>
          </button>
          <button
            onClick={() => navigate('/recovery-advisor')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Recovery Advisor</span>
          </button>
        </div>
      </div>

      {/* Main Alert Card (Exact match of PPT Slide 12) */}
      {!isResolved ? (
        <div className="relative overflow-hidden rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-950/50 via-[#1E1018] to-gray-950 p-5 shadow-2xl shadow-red-950/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span className="flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-white uppercase tracking-wider">
                  <AlertCircle className="h-3.5 w-3.5" />
                  CRITICAL CASCADE
                </span>
                <span className="rounded-md bg-red-950/80 px-2.5 py-0.5 font-mono text-[11px] font-bold text-red-300 border border-red-800/60">
                  Confidence: 98.6%
                </span>
                <span className="rounded-md bg-amber-950/80 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber-300 border border-amber-800/60">
                  🛡️ DECOY REJECTED: cfg-2001
                </span>
              </div>

              <h2 className="text-lg font-bold text-white tracking-wide">
                Propagating Cascade Rooted at Network Gateway
              </h2>

              <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
                Subtle latency drift began at <span className="font-mono text-cyan-300 font-semibold">T+00:48</span> following configuration change <span className="font-mono text-red-300 font-semibold">cfg-1003</span>. SRE intervention window recommended at <span className="font-mono text-amber-300 font-semibold">T+01:15 (10:42 AM)</span>.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => navigate('/root-cause')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-105 active:scale-95"
              >
                <span>AI Copilot Analysis</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Interactive Microservice Chain Flow */}
          <div className="mt-4 pt-3 border-t border-red-900/30 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-gray-400">Propagation Path:</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-red-900/60 text-red-200 border border-red-500/50 font-bold">
                network-gateway (T+42 Root)
              </span>
              <span className="text-gray-500">→</span>
              <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                auth-service (T+48)
              </span>
              <span className="text-gray-500">→</span>
              <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                checkout-service (T+75)
              </span>
              <span className="text-gray-500">→</span>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 line-through">
                payments-service (T+95 Decoy)
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-[#0B1E17] to-gray-950 p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  INCIDENT RESOLVED
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  All 17 Services Re-Stabilized
                </span>
              </div>
              <h2 className="text-base font-bold text-white">
                Cluster Restored: cfg-1003 Successfully Rolled Back
              </h2>
              <p className="text-xs text-gray-300">
                Proxy read timeout restored to 5000ms. Inflight retry queues flushed and SLO compliance verified at 99.98%.
              </p>
            </div>
            <button
              onClick={() => navigate('/validation')}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg"
            >
              View Verification Probes
            </button>
          </div>
        </div>
      )}

      {/* 6 Metric KPI Cards (Exact replica of PPT Slide 12) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* TOTAL SERVICES */}
        <div
          onClick={() => setActiveFilter('ALL')}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            activeFilter === 'ALL'
              ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500 shadow-lg shadow-cyan-500/10'
              : 'border-gray-800 bg-[#0F172A]/80 hover:bg-[#131D33] hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Services</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="font-mono text-2xl font-black text-white">{counts.total}</div>
          <div className="mt-2 text-[10px] text-cyan-400 font-medium">Click to show all</div>
        </div>

        {/* HEALTHY */}
        <div
          onClick={() => setActiveFilter('HEALTHY')}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            activeFilter === 'HEALTHY'
              ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500 shadow-lg shadow-emerald-500/10'
              : 'border-gray-800 bg-[#0F172A]/80 hover:bg-[#131D33] hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Healthy</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-black text-emerald-400">{counts.healthy}</div>
          <div className="mt-2 text-[10px] text-gray-400">Click to filter</div>
        </div>

        {/* DEGRADING */}
        <div
          onClick={() => setActiveFilter('DEGRADING')}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            activeFilter === 'DEGRADING'
              ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500 shadow-lg shadow-amber-500/10'
              : 'border-gray-800 bg-[#0F172A]/80 hover:bg-[#131D33] hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Degrading</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="font-mono text-2xl font-black text-amber-400">{counts.degrading}</div>
          <div className="mt-2 text-[10px] text-gray-400">Click to filter</div>
        </div>

        {/* CRITICAL OUTAGE */}
        <div
          onClick={() => setActiveFilter('CRITICAL_OUTAGE')}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            activeFilter === 'CRITICAL_OUTAGE'
              ? 'border-red-500 bg-red-950/30 ring-1 ring-red-500 shadow-lg shadow-red-500/10'
              : 'border-gray-800 bg-[#0F172A]/80 hover:bg-[#131D33] hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Critical Outage</span>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="font-mono text-2xl font-black text-red-500">{counts.critical}</div>
          <div className="mt-2 text-[10px] text-gray-400">Click to filter</div>
        </div>

        {/* CASCADE RISK */}
        <div
          onClick={() => navigate('/predictive')}
          className="cursor-pointer rounded-xl p-4 border border-gray-800 bg-[#0F172A]/80 hover:bg-[#131D33] hover:border-purple-500/50 transition-all"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Cascade Risk</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="font-mono text-2xl font-black text-purple-400">{cascadeRisk}%</div>
          <div className="mt-2 text-[10px] text-purple-400 font-medium">Propagating risk index</div>
        </div>

        {/* ACTIVE INCIDENTS */}
        <div
          onClick={() => navigate('/incidents')}
          className="cursor-pointer rounded-xl p-4 border border-gray-800 bg-[#0F172A]/80 hover:bg-[#131D33] hover:border-red-500/50 transition-all"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Incidents</span>
            <Zap className="h-4 w-4 text-red-400" />
          </div>
          <div className="font-mono text-2xl font-black text-white">{!isResolved ? 1 : 0}</div>
          <div className="mt-2 text-[10px] text-red-400 font-medium">
            {!isResolved ? 'SEV-1 Propagating' : 'Resolved'}
          </div>
        </div>
      </div>

      {/* Services Grid Matrix */}
      <div className="rounded-2xl border border-gray-800 bg-[#0F172A] overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-gray-800 gap-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Microservice Mesh Status Matrix
            </h3>
            <p className="text-[11px] text-gray-400">
              Showing {filteredServices.length} of {services.length} services ({activeFilter} filter applied)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dependency-map')}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-900 text-cyan-400 hover:bg-gray-800 transition font-medium flex items-center gap-1.5"
            >
              <span>View 3D Topology</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/70 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Service & Tier</th>
                <th className="py-3 px-3">Technology</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Response Time</th>
                <th className="py-3 px-3">P99 Latency</th>
                <th className="py-3 px-3">Error Rate</th>
                <th className="py-3 px-3">CPU Usage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {filteredServices.map(service => {
                const isRoot = service.id === 'network-gateway' && !isResolved;
                const isDecoy = service.id === 'payments-service' && !isResolved;

                return (
                  <tr
                    key={service.id}
                    className={`hover:bg-gray-900/60 transition-colors ${
                      isRoot ? 'bg-red-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{service.name}</span>
                        {isRoot && (
                          <span className="rounded bg-red-600/30 text-red-300 border border-red-500/50 px-1.5 py-0.2 text-[9px] font-sans font-bold">
                            ROOT CAUSE
                          </span>
                        )}
                        {isDecoy && (
                          <span className="rounded bg-amber-600/30 text-amber-300 border border-amber-500/50 px-1.5 py-0.2 text-[9px] font-sans font-bold">
                            DECOY REJECTED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-sans">{service.tier}</div>
                    </td>

                    <td className="py-3 px-3 text-gray-300 font-sans text-[11px]">
                      {service.technology}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                          service.status === 'HEALTHY'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : service.status === 'DEGRADING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            service.status === 'HEALTHY'
                              ? 'bg-emerald-400'
                              : service.status === 'DEGRADING'
                              ? 'bg-amber-400'
                              : 'bg-red-500'
                          }`}
                        />
                        {service.status}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          service.response_time_ms > 1000
                            ? 'text-red-400'
                            : service.response_time_ms > 200
                            ? 'text-amber-400'
                            : 'text-gray-300'
                        }`}
                      >
                        {service.response_time_ms} ms
                      </span>
                    </td>

                    <td className="py-3 px-3 text-gray-300">
                      {service.latency_p99_ms} ms
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          service.error_rate > 10
                            ? 'text-red-400'
                            : service.error_rate > 1
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {service.error_rate} %
                      </span>
                    </td>

                    <td className="py-3 px-3 text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              service.cpu_usage > 85 ? 'bg-red-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${service.cpu_usage}%` }}
                          />
                        </div>
                        <span className="text-[10px]">{service.cpu_usage}%</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          onClick={() => navigate('/root-cause')}
                          className="px-2 py-1 rounded bg-gray-900 border border-gray-700 hover:border-cyan-500 text-gray-300 hover:text-white text-[11px] transition"
                        >
                          RCA
                        </button>
                        <button
                          onClick={() => navigate('/monitoring')}
                          className="px-2 py-1 rounded bg-cyan-950/60 border border-cyan-800/80 hover:bg-cyan-900 text-cyan-300 text-[11px] transition"
                        >
                          Metrics
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
