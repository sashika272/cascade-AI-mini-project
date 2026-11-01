import React, { useState, useEffect } from 'react';
import { useSRE } from '../context/SREContext';
import { apiClient } from '../services/api';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Radio,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

export const PredictiveAnalysisPage: React.FC = () => {
  const { services } = useSRE();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('network-gateway');
  const [predictionData, setPredictionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await apiClient.getPredictiveForecast(selectedServiceId);
      setPredictionData(data);
      setLoading(false);
    }
    load();
  }, [selectedServiceId]);

  if (!predictionData) return <div className="text-gray-400 text-xs p-6">Loading Predictive Model...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <span>AI Predictive Failure Intelligence</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            AI 3: Machine-learning failure hazard modeling, MTBF depletion forecasting, and early warning indicators
          </p>
        </div>

        <select
          value={selectedServiceId}
          onChange={e => setSelectedServiceId(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-purple-500 font-mono"
        >
          {services.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.status})
            </option>
          ))}
        </select>
      </div>

      {/* Risk Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono">
        <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-4">
          <div className="text-[10px] uppercase font-bold text-purple-300 font-sans">
            Cascade Risk Index
          </div>
          <div className="mt-1 text-3xl font-black text-purple-400">
            {predictionData.risk_percentage}
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-sans">Probability of critical cascade</div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4">
          <div className="text-[10px] uppercase font-bold text-gray-400 font-sans">
            Time to Critical Collapse
          </div>
          <div className="mt-1 text-3xl font-black text-red-400">
            {predictionData.time_to_collapse_seconds}s
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-sans">Without intervention (T+75 deadline)</div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4">
          <div className="text-[10px] uppercase font-bold text-gray-400 font-sans">
            Latency Drift Velocity
          </div>
          <div className="mt-1 text-2xl font-bold text-white">
            +4.25 <span className="text-xs text-gray-400 font-sans">ms / sec</span>
          </div>
          <div className="text-[10px] text-amber-400 mt-1 font-sans">Acceleration threshold breached</div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4">
          <div className="text-[10px] uppercase font-bold text-gray-400 font-sans">
            Cross-Service Correlation
          </div>
          <div className="mt-1 text-2xl font-bold text-cyan-400">
            r = 0.942
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-sans">Strong causal tie to auth & checkout</div>
        </div>
      </div>

      {/* Hazard Projection Area Chart */}
      <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Cascade Risk Escalation Trajectory ({predictionData.service_name})
            </h3>
            <p className="text-xs text-gray-400">
              Evaluates risk progression from T+00 through T+330
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded border border-purple-800">
            Model: Scikit-Learn RF Classifier
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={predictionData.risk_projection}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="time_offset" stroke="#6B7280" fontSize={11} />
              <YAxis stroke="#6B7280" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#374151',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  color: '#fff'
                }}
              />
              <Area
                type="monotone"
                dataKey="risk_pct"
                name="Cascading Risk Index (%)"
                stroke="#8B5CF6"
                fillOpacity={1}
                fill="url(#riskGrad)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Early Warning Feed & Evidence */}
      <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-5 shadow-lg space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
          Smart Incident Early Warning Signals
        </h3>

        <div className="space-y-2">
          {predictionData.early_warnings.map((w: any, idx: number) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-gray-800 bg-gray-950/70 flex items-start gap-3 text-xs"
            >
              <AlertTriangle
                className={`h-4 w-4 shrink-0 mt-0.5 ${
                  w.severity === 'CRITICAL'
                    ? 'text-red-400'
                    : w.severity === 'HIGH'
                    ? 'text-amber-400'
                    : 'text-blue-400'
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 text-[11px] font-bold">{w.timestamp}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-300 font-mono font-bold">
                    {w.severity}
                  </span>
                </div>
                <p className="text-gray-300 mt-0.5 leading-relaxed font-sans">{w.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
