import React, { useState } from 'react';
import { useSRE } from '../context/SREContext';
import { DependencyGraph3D } from '../components/3d/DependencyGraph3D';
import { ServiceNode } from '../types';
import {
  Network,
  Maximize2,
  Layers,
  Activity,
  ShieldAlert,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Info
} from 'lucide-react';
import { useNavigate } from '../router';

export const DependencyMapPage: React.FC = () => {
  const { services, dependencies, activeIncident } = useSRE();
  const [selectedService, setSelectedService] = useState<ServiceNode | null>(services[0] || null);
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const navigate = useNavigate();

  const edges = dependencies?.edges || [];

  const handleSelect = (service: ServiceNode) => {
    setSelectedService(service);
  };

  // Compute blast radius: find all transitive dependents of selectedService
  const computeBlastRadius = (startId: string): string[] => {
    const visited = new Set<string>();
    const queue = [startId];
    visited.add(startId);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const outgoing = edges.filter(e => e.source === curr).map(e => e.target);
      for (const target of outgoing) {
        if (!visited.has(target)) {
          visited.add(target);
          queue.push(target);
        }
      }
    }
    return Array.from(visited);
  };

  const blastRadius = selectedService ? computeBlastRadius(selectedService.id) : [];

  return (
    <div className="space-y-6">
      {/* Page Title & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Network className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
            <span>Service Dependency Graph & Blast Radius Analysis</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Module 1: 17 Microservices, 19 Directed Dependency Edges, and Upstream Ingress Propagation Topology
          </p>
        </div>

        {/* 2D vs 3D Perspective Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 dark:bg-gray-900 dark:border-gray-800 text-xs">
            <button
              onClick={() => setViewMode('3D')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                viewMode === '3D'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>3D Interactive Mesh</span>
            </button>
            <button
              onClick={() => setViewMode('2D')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                viewMode === '2D'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>2D Topological Flow</span>
            </button>
          </div>
        </div>
      </div>

      {/* Case-Study Chain Ribbon */}
      <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-4 dark:border-cyan-500/30 dark:bg-cyan-950/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-400 font-mono flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span>Evaluated Case-Study Ingress Chain</span>
          </span>
          <span className="text-[10px] text-slate-500 dark:text-gray-400 font-mono">
            Propagation: Upstream Ingress → Downstream Settlement
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {[
            {
              id: 'network-gateway',
              name: 'network-gateway',
              role: 'Candidate Root Cause (T+42)',
              color: 'border-red-500 bg-red-100 text-red-900 dark:border-red-500 dark:bg-red-950/60 dark:text-red-200 ring-2 ring-red-400'
            },
            {
              id: 'auth-service',
              name: 'auth-service',
              role: 'Onset Symptom (T+48)',
              color: 'border-amber-500 bg-amber-100 text-amber-900 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-200'
            },
            {
              id: 'checkout-service',
              name: 'checkout-service',
              role: 'Cascade Extension (T+75)',
              color: 'border-amber-500 bg-amber-100 text-amber-900 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-200'
            },
            {
              id: 'payments-service',
              name: 'payments-service',
              role: 'Downstream Decoy Rejected (T+95)',
              color: 'border-yellow-600 bg-yellow-100 text-yellow-900 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-200'
            }
          ].map((node, i) => (
            <div
              key={node.id}
              onClick={() => {
                const s = services.find(x => x.id === node.id);
                if (s) handleSelect(s);
              }}
              className={`p-3 rounded-lg border cursor-pointer hover:scale-102 transition shadow-sm ${node.color}`}
            >
              <div className="text-[10px] text-slate-600 dark:text-gray-400 font-mono font-semibold">Tier {i + 1}</div>
              <div className="font-bold text-xs font-mono">{node.name}</div>
              <div className="text-[10px] mt-1 opacity-90">{node.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Visualization Canvas */}
      {viewMode === '3D' ? (
        <DependencyGraph3D
          services={services}
          edges={edges}
          onSelectService={handleSelect}
          selectedServiceId={selectedService?.id}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 dark:border-gray-800 dark:bg-[#0F172A]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-gray-800">
            <h3 className="text-xs font-bold text-slate-700 dark:text-gray-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span>2D Service Dependency Hierarchy & Directed Edge Flow</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500 dark:text-gray-400">
              17 Nodes • Directed RPC Calls (Upstream → Downstream)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map(s => {
              const isSelected = selectedService?.id === s.id;
              const isRootCause = s.id === 'network-gateway';
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition select-none ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-500/50 dark:bg-cyan-950/40 dark:border-cyan-400'
                      : isRootCause
                      ? 'border-red-500 bg-red-50 hover:border-red-600 dark:bg-red-950/30 dark:border-red-600'
                      : s.status === 'CRITICAL_OUTAGE'
                      ? 'border-red-300 bg-red-50/50 hover:border-red-400 dark:border-red-800 dark:bg-red-950/20'
                      : s.status === 'DEGRADING'
                      ? 'border-amber-300 bg-amber-50 hover:border-amber-400 dark:border-amber-800 dark:bg-amber-950/20'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
                      <span>{s.name}</span>
                      {isRootCause && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-red-700 text-white">
                          ROOT
                        </span>
                      )}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'HEALTHY'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : s.status === 'DEGRADING'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300'
                      }`}
                    >
                      {s.status === 'CRITICAL_OUTAGE' ? 'OUTAGE' : s.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-gray-400 mb-1.5">
                    {s.technology} • Port {s.port} • Centrality: <strong className="text-purple-600 dark:text-purple-400">{s.centrality_score}</strong>
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-gray-400 font-mono pt-1.5 border-t border-slate-200 dark:border-gray-800">
                    <span className="font-semibold text-slate-700 dark:text-gray-300">Outgoing Calls: </span>
                    {s.calls && s.calls.length > 0 ? (
                      <span className="text-cyan-700 dark:text-cyan-400 font-bold">{s.calls.map(c => `→ ${c}`).join(' ')}</span>
                    ) : (
                      <span className="text-slate-400 dark:text-gray-500 italic">Terminal Node</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Service Details & Downstream Blast Radius Inspector */}
      {selectedService && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg space-y-4 dark:border-gray-800 dark:bg-[#0F172A]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800 gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-900 dark:text-white font-mono">
                  Selected Node Telemetry & Blast Radius: {selectedService.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Port {selectedService.port} • {selectedService.technology} • Tier: {selectedService.tier}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-100 text-cyan-800 border border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800">
              {blastRadius.length} Total Impacted Services in Blast Radius
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-gray-800 dark:bg-gray-950/70">
              <span className="text-[10px] text-slate-500 dark:text-gray-400 uppercase block">Response Time</span>
              <span className={`text-base font-bold ${selectedService.response_time_ms > 500 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {selectedService.response_time_ms} ms
              </span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-gray-800 dark:bg-gray-950/70">
              <span className="text-[10px] text-slate-500 dark:text-gray-400 uppercase block">P99 Latency</span>
              <span className={`text-base font-bold ${selectedService.latency_p99_ms > 1000 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {selectedService.latency_p99_ms} ms
              </span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-gray-800 dark:bg-gray-950/70">
              <span className="text-[10px] text-slate-500 dark:text-gray-400 uppercase block">Error Rate</span>
              <span className={`text-base font-bold ${selectedService.error_rate > 5 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {selectedService.error_rate}%
              </span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-gray-800 dark:bg-gray-950/70">
              <span className="text-[10px] text-slate-500 dark:text-gray-400 uppercase block">Centrality Index</span>
              <span className="text-base font-bold text-purple-600 dark:text-purple-400">
                {selectedService.centrality_score}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-gray-800">
            <p className="text-xs text-slate-600 dark:text-gray-300">
              Failure propagation path along directed call edges originating from <strong className="font-mono text-slate-900 dark:text-white">{selectedService.id}</strong>:
            </p>

            <div className="flex flex-wrap gap-2">
              {blastRadius.map(svcId => {
                const isOrigin = svcId === selectedService.id;
                return (
                  <span
                    key={svcId}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold border ${
                      isOrigin
                        ? 'border-cyan-400 bg-cyan-100 text-cyan-900 dark:border-cyan-500 dark:bg-cyan-950 dark:text-cyan-200'
                        : 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'
                    }`}
                  >
                    {svcId} {isOrigin ? '(Selected Origin)' : '↓ Downstream Dependent'}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
