import React, { useState, useEffect } from 'react';
import { useSRE } from '../context/SREContext';
import { apiClient } from '../services/api';
import { RecoveryOption } from '../types';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  Sliders,
  Activity,
  Layers,
  ArrowDownRight,
  TrendingDown,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const RecoveryAdvisorPage: React.FC = () => {
  const { services, applyRecoveryAction, rollbackRecoveryAction, activeIncident } = useSRE();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('network-gateway');
  const [recoveryData, setRecoveryData] = useState<any>(null);
  const [solutions, setSolutions] = useState<RecoveryOption[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await apiClient.getRecoveryOptions(selectedServiceId);
      if (data && data.solutions) {
        setRecoveryData(data);
        setSolutions(data.solutions);
        setSelectedSolution(data.solutions[0]);
        setSimulationData(null);
      }
    }
    load();
  }, [selectedServiceId]);

  const handleRunSimulation = async (sol: any) => {
    setSelectedSolution(sol);
    setSimulating(true);
    const sim = await apiClient.simulateRecovery(sol.id, selectedServiceId);
    setSimulationData(sim);
    setSimulating(false);
  };

  const handleExecuteRecovery = async (sol: any) => {
    setApplying(true);
    await applyRecoveryAction(sol.id, selectedServiceId);
    setApplying(false);
    setAppliedSuccess(true);
  };

  const handleRevertRecovery = async () => {
    await rollbackRecoveryAction();
    setAppliedSuccess(false);
    setSimulationData(null);
  };

  const isResolved = activeIncident?.status === 'RESOLVED';
  const isRootCause = recoveryData?.is_root_cause ?? (selectedServiceId === 'network-gateway');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <span>AI Recovery Advisor & Remediation Engine</span>
          </h1>
          <p className="text-xs text-cyan-300 font-semibold mt-0.5 italic">
            “Don’t just suggest solutions. Prove which solutions work.”
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isResolved ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                <CheckCircle2 className="h-4 w-4" />
                Cluster Remediated (RESOLVED)
              </span>
              <button
                onClick={handleRevertRecovery}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-xs font-semibold transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Re-open for Testing</span>
              </button>
            </div>
          ) : (
            <span className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono font-bold">
              ACTIVE INCIDENT: INC-8492
            </span>
          )}
        </div>
      </div>

      {appliedSuccess && (
        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-4 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>
              <strong>Remediation Executed:</strong> Applied recovery action on <strong>{recoveryData?.service_name || selectedServiceId}</strong>. Latency decay curve initiated across cluster.
            </span>
          </div>
          <button
            onClick={() => setAppliedSuccess(false)}
            className="text-gray-400 hover:text-white text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Service Selector & Problem Scope Filter */}
      <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              <span>Select Service for AI Recovery Guidance:</span>
            </label>
            <select
              value={selectedServiceId}
              onChange={e => setSelectedServiceId(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs font-mono text-white outline-none focus:border-cyan-500 w-full sm:w-80"
            >
              <option value="network-gateway">network-gateway (★ Root Cause Source - cfg-1003)</option>
              <option value="auth-service">auth-service (Downstream Hop 1)</option>
              <option value="checkout-service">checkout-service (Downstream Hop 2)</option>
              <option value="payments-service">payments-service (Decoy Location - cfg-2001)</option>
              <option value="database-cluster">database-cluster (Storage Tier)</option>
              {services
                .filter(s => !['network-gateway', 'auth-service', 'checkout-service', 'payments-service', 'database-cluster'].includes(s.id))
                .map(s => (
                  <option key={s.id} value={s.id}>
                    {s.id} ({s.tier})
                  </option>
                ))}
            </select>
          </div>

          {/* Root-Cause vs Downstream Classification Banner */}
          <div className="flex-1 md:max-w-md">
            {isRootCause ? (
              <div className="rounded-xl border border-cyan-500/50 bg-cyan-950/30 p-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-[11px] uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  <span>Root-Cause Source Remediation</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  {recoveryData?.diagnosis || 'Reverting cfg-1003 on network-gateway cures the root defect and clears the cascading failure across all 17 microservices.'}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-500/50 bg-amber-950/30 p-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-[11px] uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Downstream Symptom Mitigation</span>
                </div>
                <p className="text-amber-200/90 text-[11px] leading-relaxed">
                  {recoveryData?.warning || 'Remediating this downstream symptom dampens local queue pressure, but cascading failure will persist until network-gateway (cfg-1003) is rolled back.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exactly 3 Distinct Service-Specific Recovery Solutions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {solutions.map(sol => {
          const isSelected = selectedSolution?.id === sol.id;
          return (
            <div
              key={sol.id}
              onClick={() => setSelectedSolution(sol)}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'border-cyan-400 bg-gradient-to-b from-[#112038] to-[#0F172A] shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500'
                  : 'border-gray-800 bg-[#0F172A] hover:border-gray-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sol.id === 'quick' ? (
                      <Zap className="h-4 w-4 text-cyan-400" />
                    ) : sol.id === 'safe' ? (
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Cpu className="h-4 w-4 text-purple-400" />
                    )}
                    <h3 className="font-bold text-sm text-white font-mono">{sol.name}</h3>
                  </div>
                  {sol.is_recommended && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500 text-black uppercase font-mono">
                      Recommended
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-200 font-semibold">{sol.action}</div>

                <div className="text-xs text-gray-400 leading-relaxed space-y-1">
                  <div>
                    <strong className="text-gray-300">Reason: </strong>
                    {sol.reason}
                  </div>
                  <div>
                    <strong className="text-gray-300">Expected Result: </strong>
                    {sol.expected_result}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Risk Level</span>
                    <span
                      className={`font-bold ${
                        sol.risk_level === 'LOW' || sol.risk_level === 'VERY LOW'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {sol.risk_level}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Est. MTTR</span>
                    <span className="font-bold text-cyan-400">{sol.estimated_recovery_time_sec}s</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Success Prob</span>
                    <span className="font-bold text-white">{(sol.success_probability * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-gray-800 flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRunSimulation(sol);
                  }}
                  disabled={simulating}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-bold transition"
                >
                  <Play className="h-3 w-3" />
                  <span>Simulate Fix</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExecuteRecovery(sol);
                  }}
                  disabled={applying || isResolved}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{applying ? 'Applying...' : 'Execute'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Before / After Impact Comparison Card */}
      {selectedSolution && (
        <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-400" />
              <span>Projected Before vs. After Impact Analysis: {selectedSolution.name} ({recoveryData?.service_name || selectedServiceId})</span>
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">Monte Carlo Verified</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl border border-gray-800 bg-gray-950/80 space-y-1">
              <span className="text-[10px] text-gray-500 uppercase block font-sans">P99 Latency Impact</span>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-red-400 line-through font-bold">
                  {selectedSolution.before_after?.latency_p99_before || 2800} ms
                </span>
                <span className="text-gray-500">→</span>
                <span className="text-emerald-400 font-bold">
                  {selectedSolution.before_after?.latency_p99_after || 45} ms
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-sans block">
                -98.4% Latency normalization
              </span>
            </div>

            <div className="p-3 rounded-xl border border-gray-800 bg-gray-950/80 space-y-1">
              <span className="text-[10px] text-gray-500 uppercase block font-sans">Service Error Rate</span>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-red-400 line-through font-bold">
                  {selectedSolution.before_after?.error_rate_before || 38.5}%
                </span>
                <span className="text-gray-500">→</span>
                <span className="text-emerald-400 font-bold">
                  {selectedSolution.before_after?.error_rate_after || 0.01}%
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-sans block">
                Zero dropped customer requests
              </span>
            </div>

            <div className="p-3 rounded-xl border border-gray-800 bg-gray-950/80 space-y-1">
              <span className="text-[10px] text-gray-500 uppercase block font-sans">Cluster Blast Radius</span>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-red-400 line-through font-bold">
                  {selectedSolution.before_after?.cluster_affected_before || 16} services
                </span>
                <span className="text-gray-500">→</span>
                <span className="text-emerald-400 font-bold">
                  {selectedSolution.before_after?.cluster_affected_after || 0} services
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-sans block">
                Full topology restoration
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Simulation Results Panel */}
      {simulationData && (
        <div className="rounded-2xl border border-cyan-500/40 bg-[#0F172A] p-6 shadow-2xl animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/40 uppercase">
                  Simulation Outcome
                </span>
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Trajectory: {simulationData.strategy.toUpperCase()} on {simulationData.targetService || selectedServiceId}
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Virtual Monte Carlo model proves latency decay curve within {simulationData.projected_recovery_sec} seconds
              </p>
            </div>

            <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800">
              {simulationData.verdict}
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulationData.telemetry_projection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis
                  dataKey="time_s"
                  stroke="#6B7280"
                  fontSize={11}
                  label={{ value: 'Seconds Elapsed', position: 'insideBottom', offset: -5, fill: '#6B7280', fontSize: 10 }}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={11}
                  label={{ value: 'P99 Latency (ms)', angle: -90, position: 'insideLeft', fill: '#6B7280', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#374151', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="latency_p99_ms"
                  name="P99 Latency (ms)"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#38BDF8' }}
                />
                <Line
                  type="monotone"
                  dataKey="error_rate"
                  name="Error Rate (%)"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#EF4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Autonomous Cost Optimization & SRE Guardrails Matrix */}
      <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Autonomous Cost Optimization & Downtime Economics</span>
            </h3>
            <p className="text-xs text-gray-400">
              Correlating infrastructure compute overhead vs downtime revenue loss ($4,500/min benchmark)
            </p>
          </div>
          <span className="font-mono text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800 font-bold">
            Projected ROI: 85.6% Cost Avoidance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300">Quick Rollback</span>
              <span className="text-[10px] text-emerald-400 font-bold">OPTIMAL</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-gray-400">
                <span>Downtime Duration:</span>
                <span className="text-white font-bold">3.2 mins</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Business Impact:</span>
                <span className="text-emerald-400 font-bold">$14,400</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Cloud Compute Overhead:</span>
                <span className="text-white font-bold">$0 (Rollback only)</span>
              </div>
              <div className="pt-2 border-t border-gray-800 flex justify-between font-bold text-emerald-300">
                <span>Net Savings:</span>
                <span>+$85,600</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-300">Safe Rate-Limiting</span>
              <span className="text-[10px] text-amber-400 font-bold">MODERATE</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-gray-400">
                <span>Downtime Duration:</span>
                <span className="text-white font-bold">5.5 mins</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Business Impact:</span>
                <span className="text-amber-400 font-bold">$24,750</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Throttled Revenue Loss:</span>
                <span className="text-white font-bold">$3,200</span>
              </div>
              <div className="pt-2 border-t border-gray-800 flex justify-between font-bold text-gray-300">
                <span>Net Savings:</span>
                <span>+$72,050</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-300">Optimized Pod Scale</span>
              <span className="text-[10px] text-red-400 font-bold">EXPENSIVE</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-gray-400">
                <span>Downtime Duration:</span>
                <span className="text-white font-bold">8.0 mins</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Business Impact:</span>
                <span className="text-red-400 font-bold">$36,000</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Node Scale Overhead:</span>
                <span className="text-white font-bold">$480 / hr</span>
              </div>
              <div className="pt-2 border-t border-gray-800 flex justify-between font-bold text-gray-300">
                <span>Net Savings:</span>
                <span>+$63,520</span>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Guardrails */}
        <div className="pt-3 border-t border-gray-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-2">
            Autonomous Safety Constraints & Verification Gates
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-gray-950/80 border border-gray-800 flex items-center gap-2 text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Canary parameter verification (10% traffic probe)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-gray-950/80 border border-gray-800 flex items-center gap-2 text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Circuit breaker tripwire active on failure rate &gt; 25%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-gray-950/80 border border-gray-800 flex items-center gap-2 text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Zero stateful DB migration lock required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
