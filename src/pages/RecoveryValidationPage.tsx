import React, { useState } from 'react';
import { useSRE } from '../context/SREContext';
import { CheckCircle2, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';

export const RecoveryValidationPage: React.FC = () => {
  const { services, activeIncident } = useSRE();
  const [probing, setProbing] = useState(false);
  const [lastCheck, setLastCheck] = useState<string>(new Date().toLocaleTimeString());

  const handleRunProbes = () => {
    setProbing(true);
    setTimeout(() => {
      setProbing(false);
      setLastCheck(new Date().toLocaleTimeString());
    }, 1200);
  };

  const isResolved = activeIncident?.status === 'RESOLVED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>Recovery Validation & SLO Verification</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Advanced Feature 5: Post-remediation health verification against strict SLO constraints
          </p>
        </div>

        <button
          onClick={handleRunProbes}
          disabled={probing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${probing ? 'animate-spin' : ''}`} />
          <span>{probing ? 'Dispatching Verification Probes...' : 'Run Synthetic Probes'}</span>
        </button>
      </div>

      {/* Compliance Overview Card */}
      <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider block">
              Automated SLO Compliance Verdict
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-base font-bold font-mono ${
                  isResolved ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {isResolved ? 'STATUS: ALL SLO TARGETS MET' : 'STATUS: SEV-1 SLO VIOLATION DETECTED'}
              </span>
            </div>
          </div>

          <div className="text-xs font-mono text-gray-400">
            Last probe run: <span className="text-white font-bold">{lastCheck}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-gray-950/70 border border-gray-800">
            <span className="text-[10px] text-gray-500 uppercase block font-sans">Availability SLO</span>
            <div className="text-base font-bold text-white mt-1">Target: &gt; 99.90%</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Current: 99.98%</div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-950/70 border border-gray-800">
            <span className="text-[10px] text-gray-500 uppercase block font-sans">P99 Latency SLO</span>
            <div className="text-base font-bold text-white mt-1">Target: &lt; 150 ms</div>
            <div className={`text-[11px] mt-0.5 ${isResolved ? 'text-emerald-400' : 'text-red-400'}`}>
              Current: {isResolved ? '48 ms (Nominal)' : '2800 ms (VIOLATED)'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-950/70 border border-gray-800">
            <span className="text-[10px] text-gray-500 uppercase block font-sans">Error Budget Burn</span>
            <div className="text-base font-bold text-white mt-1">Allowed: &lt; 0.1% / hr</div>
            <div className={`text-[11px] mt-0.5 ${isResolved ? 'text-emerald-400' : 'text-red-400'}`}>
              Burn Rate: {isResolved ? '0.01x (Healthy)' : '14.2x (CRITICAL)'}
            </div>
          </div>
        </div>
      </div>

      {/* Probed Microservices Table */}
      <div className="rounded-2xl border border-gray-800 bg-[#0F172A] overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
            Synthetic Probe Health Check Log (17 Microservices)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-gray-950/80 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-3">Port</th>
                <th className="py-3 px-3">Probe Type</th>
                <th className="py-3 px-3">Target SLO</th>
                <th className="py-3 px-3">Response</th>
                <th className="py-3 px-4 text-right">Probe Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {services.map(s => {
                const passed = s.status === 'HEALTHY';
                return (
                  <tr key={s.id} className="hover:bg-gray-900/50">
                    <td className="py-2.5 px-4 font-bold text-white">{s.name}</td>
                    <td className="py-2.5 px-3 text-gray-400">:{s.port}</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-sans">gRPC / HTTP Health Check</td>
                    <td className="py-2.5 px-3 text-gray-300">{s.sla_target}%</td>
                    <td className="py-2.5 px-3">{s.response_time_ms} ms</td>
                    <td className="py-2.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          passed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-300 border border-red-500/40'
                        }`}
                      >
                        {passed ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {passed ? 'PROBE PASSED' : 'PROBE FAILED'}
                      </span>
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
