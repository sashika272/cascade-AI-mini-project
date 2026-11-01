import React, { useState } from 'react';
import { useSRE } from '../context/SREContext';
import { useTheme } from '../context/ThemeContext';
import { DependencyGraph3D } from '../components/3d/DependencyGraph3D';
import { ServiceNode } from '../types';
import { initialDependencyEdges } from '../services/api';
import {
  Boxes,
  Zap,
  RotateCcw,
  Play,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Maximize2,
  Camera,
  Activity,
  Layers,
  Sparkles,
  Box,
  Server,
  Network,
  Cpu,
  HardDrive,
  Clock,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  X,
  Radio,
  FileCode2,
  ShieldAlert,
  Info
} from 'lucide-react';

export const DigitalTwinPage: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { services, dependencies, applyRecoveryAction, activeIncident } = useSRE();
  const safeServices = services || [];
  const safeEdges = dependencies?.edges || initialDependencyEdges || [];

  // When no node is selected, show clean placeholder below the diagram
  const [selectedService, setSelectedService] = useState<ServiceNode | null>(null);

  // Digital Twin Simulation State
  const [twinStateServices, setTwinStateServices] = useState<ServiceNode[]>(safeServices);
  const [activeFailureScenario, setActiveFailureScenario] = useState<string | null>('cfg-1003-cascading');
  const [simulating, setSimulating] = useState(false);
  const [propagationStep, setPropagationStep] = useState<number>(3); // 0=normal, 1=onset, 2=gateway+auth, 3=total collapse
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');

  // Camera preset tag - Default to full mesh bird's-eye view so all 4 tiers are visible
  const [cameraView, setCameraView] = useState<'default' | 'ingress' | 'security' | 'database'>('default');

  // Search & Filter for Cluster Service Details Section
  const [tableSearch, setTableSearch] = useState<string>('');
  const [tableStatusFilter, setTableStatusFilter] = useState<'ALL' | 'HEALTHY' | 'DEGRADING' | 'CRITICAL_OUTAGE'>('ALL');

  const handleSelectService = (srv: ServiceNode) => {
    setSelectedService(srv);
  };

  // Inject failure scenario in the digital twin
  const handleInjectFailure = (scenario: string) => {
    setActiveFailureScenario(scenario);
    setSimulating(true);

    if (scenario === 'clean-state') {
      // Set all healthy
      setTwinStateServices(
        twinStateServices.map(s => ({
          ...s,
          status: 'HEALTHY',
          response_time_ms: 28.0,
          latency_p99_ms: 45.0,
          error_rate: 0.0,
          cpu_usage: 25.0
        }))
      );
      setPropagationStep(0);
      setSimulating(false);
      return;
    }

    if (scenario === 'cfg-1003-cascading') {
      // Simulate cascading failure sequence
      setPropagationStep(1);
      setTimeout(() => setPropagationStep(2), 600);
      setTimeout(() => {
        setPropagationStep(3);
        setSimulating(false);
      }, 1200);

      setTwinStateServices(
        twinStateServices.map(s => {
          if (
            s.id === 'network-gateway' ||
            s.id === 'auth-service' ||
            s.id === 'checkout-service' ||
            s.id === 'payments-service'
          ) {
            return { ...s, status: 'CRITICAL_OUTAGE', error_rate: 35.0, latency_p99_ms: 2900.0, cpu_usage: 94.0 };
          }
          if (s.id === 'logging-aggregator') {
            return { ...s, status: 'HEALTHY', error_rate: 0.0, latency_p99_ms: 38.0 };
          }
          return { ...s, status: 'CRITICAL_OUTAGE', error_rate: 22.0 };
        })
      );
    } else if (scenario === 'db-partition') {
      // Database isolate
      setTwinStateServices(
        twinStateServices.map(s => {
          if (s.id === 'postgres-primary' || s.id === 'redis-orders' || s.id === 'mongo-catalog') {
            return { ...s, status: 'CRITICAL_OUTAGE', error_rate: 65.0, latency_p99_ms: 5000.0 };
          }
          if (s.id === 'checkout-service' || s.id === 'order-fulfillment') {
            return { ...s, status: 'DEGRADING', error_rate: 18.0, latency_p99_ms: 1800.0 };
          }
          return { ...s, status: 'HEALTHY' };
        })
      );
      setSimulating(false);
    }
  };

  // Run Virtual Recovery in Digital Twin
  const handleSimulateTwinRecovery = async () => {
    setSimulating(true);
    await applyRecoveryAction('quick-rollback');
    setTwinStateServices(
      twinStateServices.map(s => ({
        ...s,
        status: 'HEALTHY',
        response_time_ms: 32.0,
        latency_p99_ms: 52.0,
        error_rate: 0.01,
        cpu_usage: 32.0
      }))
    );
    setActiveFailureScenario('recovered');
    setPropagationStep(0);
    setSimulating(false);
  };

  const failingCount = twinStateServices.filter(s => s.status === 'CRITICAL_OUTAGE').length;
  const degradingCount = twinStateServices.filter(s => s.status === 'DEGRADING').length;
  const healthyCount = twinStateServices.filter(s => s.status === 'HEALTHY').length;

  // Root Cause Diagnosis Helper for Selected Service
  const getRootCauseInfo = (svc: ServiceNode) => {
    if (svc.id === 'network-gateway') {
      return {
        type: 'PRIMARY_ROOT_CAUSE',
        badge: 'PRIMARY ROOT CAUSE',
        badgeColor: 'border-red-500 bg-red-950/80 text-red-200',
        changeId: 'cfg-1003',
        description:
          'Rate-limit throttle drop (200 r/s → 10 r/s) and buffer reduction deployed at T+42. Confirmed true root cause with 95.0% causality confidence (Granger causality & Temporal invariant).'
      };
    }
    if (svc.id === 'payments-service') {
      return {
        type: 'REJECTED_DECOY',
        badge: 'REJECTED DECOY ANOMALY',
        badgeColor: 'border-amber-500 bg-amber-950/80 text-amber-200',
        changeId: 'cfg-2001',
        description:
          'Payment gateway timeout adjustment deployed at T+95. Rejected as decoy anomaly because it occurred after anomaly onset (T+48) and was caused by upstream buffer starvation.'
      };
    }
    if (svc.status === 'CRITICAL_OUTAGE') {
      return {
        type: 'CASCADED_VICTIM',
        badge: 'CASCADING FAILURE VICTIM',
        badgeColor: 'border-orange-500 bg-orange-950/70 text-orange-200',
        changeId: 'N/A (Propagation)',
        description:
          'Transitive failure propagation along directed RPC dependency chain originating from network-gateway ingress collapse.'
      };
    }
    if (svc.status === 'DEGRADING') {
      return {
        type: 'DEGRADING_SYMPTOM',
        badge: 'DEGRADED PERFORMANCE',
        badgeColor: 'border-yellow-500 bg-yellow-950/70 text-yellow-200',
        changeId: 'N/A (Upstream Queue)',
        description:
          'Experiencing backpressure and thread pool congestion due to failing upstream dependencies.'
      };
    }
    return {
      type: 'HEALTHY',
      badge: 'NOMINAL BASELINE',
      badgeColor: 'border-emerald-500 bg-emerald-950/70 text-emerald-200',
      changeId: 'N/A',
      description: 'Operating within normal SLA bounds and error budget thresholds.'
    };
  };

  // Filtered services for Section 4
  const filteredClusterServices = twinStateServices.filter(s => {
    const matchesStatus = tableStatusFilter === 'ALL' || s.status === tableStatusFilter;
    const q = tableSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.technology.toLowerCase().includes(q) ||
      s.tier.toLowerCase().includes(q) ||
      String(s.port).includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* =========================================================================
          SECTION 1: PAGE HEADER AND CONTROLS
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
            <span>3D Digital Twin Simulation & Virtual Testbed</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            MachineMind AI Feature 10: High-fidelity 3D microservice topology, failure injection, and real-time blast radius modeling
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateTwinRecovery}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Simulate Twin Recovery</span>
          </button>
        </div>
      </div>

      {/* Control Bar: View presets & Failure triggers */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0F172A] shadow-sm">
        {/* Perspective Preset & Mode Toggle */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400 font-mono flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Camera className="h-3 w-3 text-blue-600 dark:text-cyan-400" />
              <span>Perspective & Engine</span>
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('3D')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                  viewMode === '3D' ? 'bg-blue-600 text-white dark:bg-cyan-500 dark:text-black' : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                3D
              </button>
              <button
                onClick={() => setViewMode('2D')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                  viewMode === '2D' ? 'bg-blue-600 text-white dark:bg-cyan-500 dark:text-black' : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                2D
              </button>
            </div>
          </label>
          <div className="flex rounded-lg bg-slate-100 dark:bg-gray-950 p-1 border border-slate-200 dark:border-gray-800 text-xs">
            <button
              onClick={() => setCameraView('default')}
              className={`flex-1 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                cameraView === 'default' ? 'bg-blue-600 text-white dark:bg-cyan-600' : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Full Mesh
            </button>
            <button
              onClick={() => setCameraView('ingress')}
              className={`flex-1 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                cameraView === 'ingress' ? 'bg-blue-600 text-white dark:bg-cyan-600' : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Ingress Chain
            </button>
            <button
              onClick={() => setCameraView('database')}
              className={`flex-1 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                cameraView === 'database' ? 'bg-blue-600 text-white dark:bg-cyan-600' : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Data Layer
            </button>
          </div>
        </div>

        {/* Chaos Failure Injector */}
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400 font-mono flex items-center gap-1">
            <Flame className="h-3 w-3 text-red-500" />
            <span>Inject Virtual Failure Scenario</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleInjectFailure('cfg-1003-cascading')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                activeFailureScenario === 'cfg-1003-cascading'
                  ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-950/80 dark:border-red-500 dark:text-red-200'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              cfg-1003 Ingress Cascade
            </button>
            <button
              onClick={() => handleInjectFailure('db-partition')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                activeFailureScenario === 'db-partition'
                  ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/80 dark:border-amber-500 dark:text-amber-200'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              DB Partition
            </button>
            <button
              onClick={() => handleInjectFailure('clean-state')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                activeFailureScenario === 'clean-state'
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-500 dark:text-emerald-200'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Reset to Baseline
            </button>
          </div>
        </div>

        {/* Live Status Counter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400 font-mono flex items-center gap-1">
            <Activity className="h-3 w-3 text-emerald-600" />
            <span>Twin Cluster State</span>
          </label>
          <div className="flex items-center gap-2 pt-1 font-mono text-xs">
            <span className="text-red-600 font-bold">{failingCount} Outage</span>
            <span className="text-slate-400 dark:text-gray-600">/</span>
            <span className="text-amber-600 font-bold">{degradingCount} Degraded</span>
            <span className="text-slate-400 dark:text-gray-600">/</span>
            <span className="text-emerald-600 font-bold">{healthyCount} Healthy</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: COMPLETE 3D ANIMATED DEPENDENCY DIAGRAM (UNOBSTRUCTED)
          ========================================================================= */}
      <div className={`relative h-[560px] w-full rounded-2xl border overflow-hidden shadow-2xl transition-colors ${
        isLight ? 'bg-[#EAF2FF] border-[#DCE4F0]' : 'border-gray-800 bg-[#0B0F17]'
      }`}>
        {viewMode === '3D' ? (
          <DependencyGraph3D
            services={twinStateServices}
            edges={safeEdges}
            cameraView={cameraView}
            onSelectService={handleSelectService}
            selectedServiceId={selectedService?.id}
          />
        ) : (
          <div className="h-full w-full p-6 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {twinStateServices.map(s => {
                const isSelected = selectedService?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectService(s)}
                    className={`p-3 rounded-xl border cursor-pointer transition select-none ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-500'
                        : s.status === 'HEALTHY'
                        ? 'border-emerald-800/40 bg-gray-950/70 hover:border-emerald-600'
                        : s.status === 'DEGRADING'
                        ? 'border-amber-800/40 bg-gray-950/70 hover:border-amber-600'
                        : 'border-red-800/50 bg-red-950/20 hover:border-red-600'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-gray-800/60">
                      <span className="font-bold text-white text-xs truncate">{s.name}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          s.status === 'HEALTHY'
                            ? 'text-emerald-400 bg-emerald-950/60'
                            : s.status === 'DEGRADING'
                            ? 'text-amber-400 bg-amber-950/60'
                            : 'text-red-400 bg-red-950/80'
                        }`}
                      >
                        {s.status === 'CRITICAL_OUTAGE' ? 'OUTAGE' : s.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-2 text-[10px] font-mono">
                      <span className="text-gray-400">
                        Port: <strong className="text-cyan-400">{s.port}</strong>
                      </span>
                      <span className="text-gray-400">
                        Err: <strong className={s.error_rate > 5 ? 'text-red-400' : 'text-emerald-400'}>{s.error_rate}%</strong>
                      </span>
                      <span className="text-gray-400">
                        P99: <strong className={s.latency_p99_ms > 1000 ? 'text-red-400' : 'text-emerald-400'}>{s.latency_p99_ms}ms</strong>
                      </span>
                      <span className="text-gray-400 truncate">Tier: {s.tier}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 3: DEDICATED NODE INSPECTOR SECTION (BELOW THE COMPLETE DIAGRAM)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white">
              Dedicated Service Node Inspector
            </h2>
            {selectedService ? (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-blue-50 text-blue-700 border border-blue-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800">
                Active Node: {selectedService.name}
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-mono text-slate-500 rounded bg-slate-100 border border-slate-200 dark:bg-gray-900 dark:text-gray-500 dark:border-gray-800">
                Awaiting Node Selection
              </span>
            )}
          </div>
          {selectedService && (
            <button
              onClick={() => setSelectedService(null)}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:text-gray-400 dark:hover:text-white dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 rounded-lg transition cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span>Deselect Node</span>
            </button>
          )}
        </div>

        {!selectedService ? (
          /* Placeholder state when no node is clicked */
          <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0F172A] p-8 text-center shadow-lg transition">
            <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-2.5">
              <div className="p-3.5 rounded-full bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-blue-600 dark:text-cyan-400/80">
                <Boxes className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-200">
                Select a service node to inspect its details.
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                Click any service sphere in the 3D animated diagram above or choose a row from the cluster inventory below to inspect port bindings (including Node.js port 8088), telemetry, and causal anomaly tracing.
              </p>
            </div>
          </div>
        ) : (
          /* Full Inspector Card displaying all service details below the diagram */
          <div className="rounded-2xl border border-blue-200 dark:border-cyan-500/40 bg-white dark:bg-[#0F172A] p-5 shadow-2xl space-y-4 animate-in fade-in-50 duration-200">
            {/* Top Summary Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-cyan-400 uppercase tracking-wider bg-blue-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-cyan-800">
                    Node ID: {selectedService.id}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400">
                    Tier: <strong className="text-slate-900 dark:text-white">{selectedService.tier}</strong>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400">
                    Category: <strong className="text-slate-700 dark:text-gray-300">{selectedService.category}</strong>
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-mono flex items-center gap-2">
                  <span>{selectedService.name}</span>
                </h3>
              </div>

              {/* Status and Root Cause Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 ${
                    selectedService.status === 'HEALTHY'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700'
                      : selectedService.status === 'DEGRADING'
                      ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700'
                      : 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-700'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      selectedService.status === 'HEALTHY'
                        ? 'bg-emerald-600'
                        : selectedService.status === 'DEGRADING'
                        ? 'bg-amber-600'
                        : 'bg-red-600 animate-pulse'
                    }`}
                  />
                  <span>{selectedService.status === 'CRITICAL_OUTAGE' ? 'CRITICAL OUTAGE' : selectedService.status}</span>
                </span>

                {/* Root Cause Analysis Badge */}
                {(() => {
                  const rc = getRootCauseInfo(selectedService);
                  return (
                    <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 ${rc.badgeColor}`}>
                      {rc.type === 'PRIMARY_ROOT_CAUSE' ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500 animate-bounce" />
                      ) : rc.type === 'REJECTED_DECOY' ? (
                        <Info className="h-3.5 w-3.5 text-amber-500" />
                      ) : rc.type === 'CASCADED_VICTIM' ? (
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      <span>{rc.badge}</span>
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Core Telemetry & Port Information Grid (8 Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 font-mono">
              {/* Response Time */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/70">
                <span className="text-[10px] text-slate-500 dark:text-gray-400 block uppercase">Response Time</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  <span className={selectedService.response_time_ms > 500 ? 'text-red-600 font-bold' : 'text-emerald-700'}>
                    {selectedService.response_time_ms.toFixed(1)} ms
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5 block">Baseline: ~28 ms</span>
              </div>

              {/* Error Rate */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/70">
                <span className="text-[10px] text-slate-500 dark:text-gray-400 block uppercase">Error Rate</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  <span className={selectedService.error_rate > 5 ? 'text-red-600 font-bold' : 'text-emerald-700'}>
                    {selectedService.error_rate.toFixed(1)}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5 block">Threshold: &lt; 5.0%</span>
              </div>

              {/* P99 Latency */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/70">
                <span className="text-[10px] text-slate-500 dark:text-gray-400 block uppercase">P99 Latency</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  <span className={selectedService.latency_p99_ms > 1000 ? 'text-amber-700 font-bold' : 'text-emerald-700'}>
                    {selectedService.latency_p99_ms.toFixed(0)} ms
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5 block">SLA Target: &lt; 1000 ms</span>
              </div>

              {/* Centrality Index */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/70">
                <span className="text-[10px] text-slate-500 dark:text-gray-400 block uppercase">Centrality Index</span>
                <div className="text-base font-bold text-purple-700 dark:text-purple-400 mt-0.5">
                  {selectedService.centrality_score.toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5 block">Graph Betweenness</span>
              </div>

              {/* Node.js Port Information (including port 8088 where applicable) */}
              <div className="p-3 rounded-xl border border-blue-200 dark:border-cyan-900/50 bg-blue-50/70 dark:bg-cyan-950/20">
                <span className="text-[10px] text-blue-700 dark:text-cyan-400 block uppercase font-bold">Port Binding</span>
                <div className="text-base font-bold text-blue-900 dark:text-cyan-300 mt-0.5">
                  Port {selectedService.port}
                </div>
                <span className="text-[10px] text-blue-600 dark:text-cyan-400/80 mt-0.5 block truncate">
                  {selectedService.port === 8088
                    ? 'Node.js Port 8088 (User Profile)'
                    : `Active Service Port ${selectedService.port}`}
                </span>
              </div>

              {/* Technology & Runtime Details */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/70">
                <span className="text-[10px] text-slate-500 dark:text-gray-400 block uppercase">Technology / Stack</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                  {selectedService.technology}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5 block truncate">
                  {selectedService.technology.toLowerCase().includes('node') ? 'Node.js Runtime' : 'Compiled Microservice'}
                </span>
              </div>

              {/* CPU & Memory Telemetry */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/70">
                <span className="text-[10px] text-slate-500 dark:text-gray-400 block uppercase">System Resources</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  CPU: <span className={selectedService.cpu_usage > 85 ? 'text-red-600 font-bold' : 'text-emerald-700'}>{selectedService.cpu_usage}%</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5 block">
                  RAM: {selectedService.memory_usage}% • {selectedService.request_count} req/s
                </span>
              </div>

              {/* SLA Target & Availability */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/70">
                <span className="text-[10px] text-slate-500 dark:text-gray-400 block uppercase">SLA & Critical Path</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                  {selectedService.critical_path ? 'Critical (Ingress)' : 'Standard Service'}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5 block">
                  SLA: {selectedService.sla_target}% • Uptime: {selectedService.uptime_percentage}%
                </span>
              </div>
            </div>

            {/* Root Cause & Failure Propagation Diagnostics Box */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-600 dark:text-gray-400 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>Root-Cause Identification & Causal Propagation Analysis</span>
                </span>
                <span className="text-[10px] font-mono text-blue-700 dark:text-cyan-400 font-bold">
                  MTTR: {selectedService.mttr_minutes || 20}m • MTTA: {selectedService.mtta_minutes || 1.5}m
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-gray-300 font-sans leading-relaxed">
                {getRootCauseInfo(selectedService).description}
              </p>

              {/* Downstream Call Graph Links */}
              <div className="pt-2 border-t border-slate-200 dark:border-gray-800/80 flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="text-[10px] text-slate-500 dark:text-gray-500 uppercase font-bold">Downstream Calls:</span>
                {selectedService.calls && selectedService.calls.length > 0 ? (
                  selectedService.calls.map(depId => {
                    const depNode = twinStateServices.find(s => s.id === depId);
                    return (
                      <button
                        key={depId}
                        onClick={() => depNode && handleSelectService(depNode)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border transition cursor-pointer ${
                          depNode?.status === 'CRITICAL_OUTAGE'
                            ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/60'
                            : depNode?.status === 'DEGRADING'
                            ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/60'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                        title="Click to inspect downstream dependency"
                      >
                        → {depNode ? depNode.name : depId} ({depNode ? `Port ${depNode.port}` : ''})
                      </button>
                    );
                  })
                ) : (
                  <span className="text-[10px] text-slate-400 dark:text-gray-500 italic">Terminal Node (No downstream RPC dependencies)</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 4: EXISTING SERVICE DETAILS AND METRICS SECTION (BELOW THE DIAGRAM)
          ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0F172A] p-5 shadow-xl space-y-4">
        {/* Section Header with Search and Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-gray-800">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
              <span>Cluster Service Inventory & Topology Telemetry Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Live metrics, port bindings, runtime stacks, and failure propagation states across all 17 microservices
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search name, ID, port (e.g. 8088)..."
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:bg-gray-950 dark:border-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-500 w-56 font-mono"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex rounded-lg bg-slate-100 dark:bg-gray-950 p-1 border border-slate-200 dark:border-gray-800 text-[10px] font-mono">
              <button
                onClick={() => setTableStatusFilter('ALL')}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  tableStatusFilter === 'ALL' ? 'bg-blue-600 text-white dark:bg-cyan-600' : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                All ({twinStateServices.length})
              </button>
              <button
                onClick={() => setTableStatusFilter('CRITICAL_OUTAGE')}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  tableStatusFilter === 'CRITICAL_OUTAGE' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                Outage ({failingCount})
              </button>
              <button
                onClick={() => setTableStatusFilter('DEGRADING')}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  tableStatusFilter === 'DEGRADING' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                Degraded ({degradingCount})
              </button>
              <button
                onClick={() => setTableStatusFilter('HEALTHY')}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  tableStatusFilter === 'HEALTHY' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                Healthy ({healthyCount})
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-gray-800 text-[10px] uppercase text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-gray-950/60">
                <th className="py-2.5 px-3">Service Name & ID</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Port</th>
                <th className="py-2.5 px-3">Technology / Runtime</th>
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3 text-right">Response Time</th>
                <th className="py-2.5 px-3 text-right">P99 Latency</th>
                <th className="py-2.5 px-3 text-right">Error Rate</th>
                <th className="py-2.5 px-3 text-center">Centrality</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60">
              {filteredClusterServices.map(s => {
                const isSelected = selectedService?.id === s.id;
                return (
                  <tr
                    key={s.id}
                    onClick={() => handleSelectService(s)}
                    className={`transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 text-slate-900 dark:bg-cyan-950/40 dark:text-white'
                        : 'hover:bg-slate-50 dark:hover:bg-gray-900/60 text-slate-700 dark:text-gray-300'
                    }`}
                  >
                    {/* Service Name & ID */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{s.name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-gray-500">{s.id}</div>
                    </td>

                    {/* Health Status */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'HEALTHY'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
                            : s.status === 'DEGRADING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            s.status === 'HEALTHY'
                              ? 'bg-emerald-600'
                              : s.status === 'DEGRADING'
                              ? 'bg-amber-600'
                              : 'bg-red-600'
                          }`}
                        />
                        <span>{s.status === 'CRITICAL_OUTAGE' ? 'OUTAGE' : s.status}</span>
                      </span>
                    </td>

                    {/* Port Information */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          s.port === 8088
                            ? 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-700'
                            : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800'
                        }`}
                      >
                        Port {s.port}
                      </span>
                    </td>

                    {/* Technology */}
                    <td className="py-2.5 px-3 text-slate-700 dark:text-gray-300 text-[11px] truncate max-w-[150px]">
                      {s.technology}
                    </td>

                    {/* Tier */}
                    <td className="py-2.5 px-3 text-slate-500 dark:text-gray-400 text-[10px]">
                      {s.tier}
                    </td>

                    {/* Response Time */}
                    <td className="py-2.5 px-3 text-right">
                      <span className={s.response_time_ms > 500 ? 'text-red-600 font-bold' : 'text-emerald-700 font-medium'}>
                        {s.response_time_ms.toFixed(1)} ms
                      </span>
                    </td>

                    {/* P99 Latency */}
                    <td className="py-2.5 px-3 text-right">
                      <span className={s.latency_p99_ms > 1000 ? 'text-red-600 font-bold' : 'text-slate-700 dark:text-gray-300 font-medium'}>
                        {s.latency_p99_ms.toFixed(0)} ms
                      </span>
                    </td>

                    {/* Error Rate */}
                    <td className="py-2.5 px-3 text-right">
                      <span className={s.error_rate > 5 ? 'text-red-600 font-bold' : 'text-emerald-700 font-medium'}>
                        {s.error_rate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Centrality Index */}
                    <td className="py-2.5 px-3 text-center text-purple-700 dark:text-purple-400 font-bold">
                      {s.centrality_score.toFixed(2)}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleSelectService(s);
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white dark:bg-cyan-500 dark:text-black'
                            : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-blue-600 hover:text-white dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-cyan-600 dark:hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Inspecting' : 'Inspect'}
                      </button>
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
