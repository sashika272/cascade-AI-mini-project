import React, { useState } from 'react';
import { useSRE } from '../context/SREContext';
import { apiClient } from '../services/api';
import {
  Flame,
  Play,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Layers,
  Activity,
  Zap,
  Info,
  GitBranch,
  TrendingDown,
  Clock,
  Sparkles
} from 'lucide-react';

const SCENARIOS = [
  {
    id: 'scen-01',
    name: 'SEV-1 Ingress Cascade (cfg-1003)',
    targetService: 'network-gateway',
    failureType: 'Proxy Read Timeout Spike',
    intensity: 'HIGH' as const,
    description: 'Ground truth: 250ms timeout on gateway triggers retry backpressure.'
  },
  {
    id: 'scen-02',
    name: 'Database Socket Saturation (cfg-2001)',
    targetService: 'payments-service',
    failureType: 'TCP Connection Pool Saturation',
    intensity: 'MEDIUM' as const,
    description: 'Decoy: Pool expansion to 250 exhausts PostgreSQL connection ceiling.'
  },
  {
    id: 'scen-03',
    name: 'OAuth2 JWKS Token Validation Stall',
    targetService: 'auth-service',
    failureType: 'Worker Thread Exhaustion',
    intensity: 'HIGH' as const,
    description: 'Thread starvation blocks header validation across all downstream calls.'
  },
  {
    id: 'scen-04',
    name: 'Distributed Saga Transaction Deadlock',
    targetService: 'checkout-service',
    failureType: 'Unauthorized Shadow Config Injection',
    intensity: 'MEDIUM' as const,
    description: 'Pessimistic cart locks freeze inventory reservations.'
  },
  {
    id: 'scen-05',
    name: 'Redis Volatile Session Eviction Stall',
    targetService: 'cart-service',
    failureType: 'Network Packet Loss & Retransmit',
    intensity: 'LOW' as const,
    description: 'Local session cache packet drops absorbed by retry policies.'
  }
];

export const FailureSimulationPage: React.FC = () => {
  const { services, injectChaosFailure, refreshData } = useSRE();
  const [targetSvc, setTargetSvc] = useState<string>('network-gateway');
  const [failureType, setFailureType] = useState<string>('Proxy Read Timeout Spike');
  const [intensity, setIntensity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [previousResult, setPreviousResult] = useState<any>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    setResetMessage(null);
    if (result) {
      setPreviousResult(result);
    }
    const res = await injectChaosFailure(targetSvc, failureType, intensity);
    setResult(res);
    setLoading(false);
  };

  const handleApplyPreset = (scen: typeof SCENARIOS[0]) => {
    setTargetSvc(scen.targetService);
    setFailureType(scen.failureType);
    setIntensity(scen.intensity);
  };

  const handleResetSimulation = async () => {
    await apiClient.resetChaosSimulation();
    await refreshData();
    setPreviousResult(null);
    setResult(null);
    setResetMessage('Simulation canvas and service telemetry reset to baseline.');
    setTimeout(() => setResetMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-white flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-500" />
            <span>Dependency-Based Cascading Failure Simulator</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Graph traversal over directed dependency edges: Inject chaos, quantify multi-hop blast radius, and test containment policies
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(result || previousResult) && (
            <button
              onClick={handleResetSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Simulation</span>
            </button>
          )}
        </div>
      </div>

      {resetMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Preset Scenarios Strip */}
      <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-4 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono block">
          Pre-Packaged SRE Incident Scenarios:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {SCENARIOS.map(scen => (
            <button
              key={scen.id}
              onClick={() => handleApplyPreset(scen)}
              className={`p-2.5 rounded-xl border text-left transition select-none ${
                targetSvc === scen.targetService && failureType === scen.failureType && intensity === scen.intensity
                  ? 'border-red-500 bg-red-950/30 text-white shadow-sm ring-1 ring-red-500/50'
                  : 'border-gray-800 bg-gray-950/60 text-gray-400 hover:border-gray-700 hover:text-white'
              }`}
            >
              <div className="font-bold text-[11px] text-white truncate">{scen.name}</div>
              <div className="text-[10px] text-gray-500 font-mono mt-0.5">{scen.targetService} • {scen.intensity}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Simulator Parameters Config Card */}
      <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-5">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-800">
          <Sliders className="h-4 w-4 text-cyan-400" />
          <span>Fault Injection Parameters & Intensity Tiers</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Target Service (Fault Origin)</label>
            <select
              value={targetSvc}
              onChange={e => setTargetSvc(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-white outline-none focus:border-red-500 font-mono"
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.tier} • {s.technology})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Failure Mechanism</label>
            <select
              value={failureType}
              onChange={e => setFailureType(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-white outline-none focus:border-red-500"
            >
              <option value="Proxy Read Timeout Spike">Proxy Read Timeout Spike (cfg-1003)</option>
              <option value="TCP Connection Pool Saturation">TCP Connection Pool Saturation (cfg-2001)</option>
              <option value="Worker Thread Exhaustion">Worker Thread Exhaustion</option>
              <option value="Network Packet Loss & Retransmit">Network Packet Loss & Retransmit</option>
              <option value="Unauthorized Shadow Config Injection">Unauthorized Shadow Config Injection</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Severity Intensity (Propagation Depth)</label>
            <div className="grid grid-cols-3 gap-1">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setIntensity(lvl)}
                  className={`py-2 rounded-lg text-xs font-bold font-mono transition ${
                    intensity === lvl
                      ? lvl === 'HIGH'
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : lvl === 'MEDIUM'
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                        : 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Meaningful Intensity Explanation Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-mono">
          <div className={`p-3 rounded-xl border ${intensity === 'LOW' ? 'border-blue-500 bg-blue-950/20' : 'border-gray-800/80 bg-gray-950/40 text-gray-400'}`}>
            <span className="font-bold text-blue-400 block mb-1">LOW Severity Profile:</span>
            <ul className="text-[11px] space-y-0.5 text-gray-300">
              <li>• Max Hops: 1 hop (Local containment)</li>
              <li>• Latency Delta: +340ms average</li>
              <li>• Circuit Breaker: Absorbed locally</li>
              <li>• Collapse Horizon: 420s window</li>
            </ul>
          </div>

          <div className={`p-3 rounded-xl border ${intensity === 'MEDIUM' ? 'border-amber-500 bg-amber-950/20' : 'border-gray-800/80 bg-gray-950/40 text-gray-400'}`}>
            <span className="font-bold text-amber-400 block mb-1">MEDIUM Severity Profile:</span>
            <ul className="text-[11px] space-y-0.5 text-gray-300">
              <li>• Max Hops: 2 hops (Tier-2 propagation)</li>
              <li>• Latency Delta: +1650ms surge</li>
              <li>• Circuit Breaker: Tripped on tier-1</li>
              <li>• Collapse Horizon: 180s window</li>
            </ul>
          </div>

          <div className={`p-3 rounded-xl border ${intensity === 'HIGH' ? 'border-red-500 bg-red-950/20' : 'border-gray-800/80 bg-gray-950/40 text-gray-400'}`}>
            <span className="font-bold text-red-400 block mb-1">HIGH Severity Profile:</span>
            <ul className="text-[11px] space-y-0.5 text-gray-300">
              <li>• Max Hops: Unbounded (Full graph)</li>
              <li>• Latency Delta: +3850ms retry storm</li>
              <li>• Circuit Breaker: Cascade breach</li>
              <li>• Collapse Horizon: 45s collapse</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-600/25 transition hover:scale-105 active:scale-95"
          >
            <Play className="h-4 w-4" />
            <span>{loading ? 'Traversing Directed Graph...' : 'Inject Chaos & Traverse Dependency Graph'}</span>
          </button>
        </div>
      </div>

      {/* Results Panel */}
      {result && (
        <div className="rounded-2xl border border-red-500/50 bg-[#0F172A] p-6 shadow-2xl animate-in fade-in duration-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-mono text-[10px] font-bold border border-red-700 uppercase">
                  {result.simulationId} Output
                </span>
                <span className="px-2 py-0.5 rounded bg-gray-900 text-gray-300 font-mono text-[10px] border border-gray-800">
                  Origin: {result.targetServiceName || result.targetService}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                Blast Radius: {result.blastRadiusCount} Microservices Threatened ({result.intensity} Intensity)
              </h3>
            </div>

            <div className="text-xs font-mono flex items-center gap-3">
              <div>
                <span className="text-gray-400">Collapse Horizon: </span>
                <strong className="text-red-400 font-bold">{result.projectedCollapseSeconds}s</strong>
              </div>
              <div>
                <span className="text-gray-400">SLO Violation Prob: </span>
                <strong className="text-red-400 font-bold">{(result.predictedSLOViolationProbability * 100).toFixed(1)}%</strong>
              </div>
            </div>
          </div>

          {/* Impact Metrics Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl border border-gray-800 bg-gray-950/80">
              <span className="text-[10px] text-gray-500 uppercase block font-sans">Simulated P99 Latency</span>
              <div className="text-base font-bold text-red-400 mt-1">
                {result.impactMetrics?.p99LatencyMs || 3850} ms
              </div>
              <span className="text-[10px] text-gray-400 font-sans">Across blast radius</span>
            </div>

            <div className="p-3 rounded-xl border border-gray-800 bg-gray-950/80">
              <span className="text-[10px] text-gray-500 uppercase block font-sans">Error Rate Escalation</span>
              <div className="text-base font-bold text-red-400 mt-1">
                {result.impactMetrics?.errorRatePct || 68.0}%
              </div>
              <span className="text-[10px] text-gray-400 font-sans">5xx & timeout spikes</span>
            </div>

            <div className="p-3 rounded-xl border border-gray-800 bg-gray-950/80">
              <span className="text-[10px] text-gray-500 uppercase block font-sans">Ingress RPS Drop</span>
              <div className="text-base font-bold text-amber-400 mt-1">
                -{result.impactMetrics?.rpsDropPct || 82}%
              </div>
              <span className="text-[10px] text-gray-400 font-sans">Client traffic throttled</span>
            </div>

            <div className="p-3 rounded-xl border border-gray-800 bg-gray-950/80">
              <span className="text-[10px] text-gray-500 uppercase block font-sans">Circuit Breaker Trip</span>
              <div className="text-base font-bold text-white mt-1">
                {result.impactMetrics?.circuitBreakerTripped ? 'TRIPPED (Open)' : 'CLOSED (Normal)'}
              </div>
              <span className="text-[10px] text-emerald-400 font-sans">Hops reached: {result.impactMetrics?.isolationHopsReached || 4}</span>
            </div>
          </div>

          {/* Multi-Hop Dependency Propagation Sequence */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono block">
              Multi-Hop Graph Propagation Sequence (Actual Dependency Edges):
            </span>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              {result.propagationPath && result.propagationPath.length > 0 ? (
                result.propagationPath.map((step: any, idx: number) => (
                  <React.Fragment key={step.serviceId + idx}>
                    <div className="px-3 py-1.5 rounded-lg border border-red-500/50 bg-red-950/40 text-red-200 font-bold flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-black/50 text-[10px] text-cyan-300">H{step.hop}</span>
                      <span>{step.serviceId}</span>
                      {step.viaEdge && <span className="text-[9px] text-gray-400 font-normal">({step.viaEdge})</span>}
                    </div>
                    {idx < result.propagationPath.length - 1 && (
                      <span className="text-gray-500 font-bold">→</span>
                    )}
                  </React.Fragment>
                ))
              ) : (
                result.affectedServices.map((svc: string, idx: number) => (
                  <React.Fragment key={svc}>
                    <span className="px-3 py-1.5 rounded-lg border border-red-500/50 bg-red-950/40 text-red-200 font-bold">
                      {svc}
                    </span>
                    {idx < result.affectedServices.length - 1 && (
                      <span className="text-gray-500">→</span>
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>

          {/* SRE Proactive Recommendation */}
          <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-4 text-xs">
            <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Automated SRE Proactive Mitigation Strategy:</span>
            </div>
            <p className="text-gray-200 leading-relaxed font-sans">{result.mitigationAction}</p>
          </div>

          {/* Before vs After / Run Comparison (if previousResult exists) */}
          {previousResult && (
            <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                Simulation Comparison vs Previous Run:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg border border-gray-800 bg-gray-950/60">
                  <span className="text-[10px] text-gray-500 uppercase block font-sans">Blast Radius Delta</span>
                  <div className="font-bold text-white mt-1">
                    Previous: <strong className="text-red-400">{previousResult.blastRadiusCount}</strong> services → Current: <strong className="text-red-300">{result.blastRadiusCount}</strong> services
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-gray-800 bg-gray-950/60">
                  <span className="text-[10px] text-gray-500 uppercase block font-sans">Collapse Horizon Delta</span>
                  <div className="font-bold text-white mt-1">
                    Previous: <strong className="text-amber-400">{previousResult.projectedCollapseSeconds}s</strong> → Current: <strong className="text-amber-300">{result.projectedCollapseSeconds}s</strong>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-gray-800 bg-gray-950/60">
                  <span className="text-[10px] text-gray-500 uppercase block font-sans">Intensity Tier</span>
                  <div className="font-bold text-white mt-1">
                    Previous: <strong>{previousResult.intensity}</strong> → Current: <strong>{result.intensity}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
