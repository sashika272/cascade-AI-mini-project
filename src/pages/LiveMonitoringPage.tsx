import React, { useState } from 'react';
import { useSRE } from '../context/SREContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Activity, Radio, Cpu, HardDrive, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const LiveMonitoringPage: React.FC = () => {
  const { services, livePolling, setLivePolling } = useSRE();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('network-gateway');
  const [metricMode, setMetricMode] = useState<'latency' | 'error_rate' | 'cpu'>('latency');

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];

  // Historical telemetry stream mock for current service
  const trendData = [
    { time: '10:40:00', latency: 38, error: 0.0, cpu: 28, p99: 54 },
    { time: '10:41:00', latency: 42, error: 0.1, cpu: 32, p99: 68 },
    { time: '10:41:18', latency: 52, error: 0.2, cpu: 36, p99: 85 }, // T+42 cfg-1003
    { time: '10:41:48', latency: 185, error: 3.5, cpu: 58, p99: 342 }, // T+48 persistent onset
    { time: '10:42:15', latency: 320, error: 8.9, cpu: 74, p99: 580 }, // T+75 intervention window
    { time: '10:46:11', latency: 540, error: 16.2, cpu: 84, p99: 920 }, // T+95 decoy cfg-2001
    { time: '10:49:00', latency: 1450, error: 38.5, cpu: 94, p99: 2800 }, // T+180 critical
    { time: '10:55:00', latency: 4200, error: 74.2, cpu: 98, p99: 6800 } // T+330 collapse
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-white">
              Live Service Monitoring & Telemetry
            </h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/30">
              <Radio className="h-3 w-3 animate-pulse" />
              STREAM ACTIVE
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Module 1: Real-time latency, error rate, CPU utilization, and request throughput
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedServiceId}
            onChange={e => setSelectedServiceId(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-cyan-500"
          >
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status})
              </option>
            ))}
          </select>

          <button
            onClick={() => setLivePolling(!livePolling)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              livePolling
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {livePolling ? 'Pause Polling' : 'Resume Polling'}
          </button>
        </div>
      </div>

      {/* Selected Service Quick Stat Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-3.5">
          <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-between">
            <span>Status</span>
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 font-mono text-base font-bold text-white">
            <span
              className={`px-2 py-0.5 rounded text-xs ${
                selectedService.status === 'HEALTHY'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : selectedService.status === 'DEGRADING'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {selectedService.status}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-3.5">
          <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-between">
            <span>Avg Response</span>
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 font-mono text-xl font-bold text-white">
            {selectedService.response_time_ms} <span className="text-xs text-gray-400 font-sans">ms</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-3.5">
          <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-between">
            <span>P99 Latency</span>
            <Clock className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-1 font-mono text-xl font-bold text-amber-400">
            {selectedService.latency_p99_ms} <span className="text-xs text-gray-400 font-sans">ms</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-3.5">
          <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-between">
            <span>Error Rate</span>
            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
          </div>
          <div className="mt-1 font-mono text-xl font-bold text-red-400">
            {selectedService.error_rate}%
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-3.5">
          <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-between">
            <span>CPU Load</span>
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="mt-1 font-mono text-xl font-bold text-white">
            {selectedService.cpu_usage}%
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-3.5">
          <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-between">
            <span>Req Volume</span>
            <Radio className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="mt-1 font-mono text-xl font-bold text-white">
            {selectedService.request_count} <span className="text-xs text-gray-400 font-sans">rpm</span>
          </div>
        </div>
      </div>

      {/* Interactive Telemetry Chart */}
      <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-3">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              {selectedService.name} — Real-Time Incident Telemetry Trajectory
            </h3>
            <p className="text-xs text-gray-400">
              Correlating latency escalation from baseline T+00 through collapse T+330
            </p>
          </div>

          <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
            <button
              onClick={() => setMetricMode('latency')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                metricMode === 'latency'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Latency (ms)
            </button>
            <button
              onClick={() => setMetricMode('error_rate')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                metricMode === 'error_rate'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Error Rate (%)
            </button>
            <button
              onClick={() => setMetricMode('cpu')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                metricMode === 'cpu'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              CPU Usage (%)
            </button>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="time" stroke="#6B7280" fontSize={11} />
              <YAxis stroke="#6B7280" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#374151',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  color: '#fff'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              {metricMode === 'latency' && (
                <>
                  <Line
                    type="monotone"
                    dataKey="latency"
                    name="Mean Latency (ms)"
                    stroke="#0284C7"
                    strokeWidth={2.5}
                    dot={{ fill: '#0284C7', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="p99"
                    name="P99 Latency (ms)"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ fill: '#F59E0B', r: 3 }}
                  />
                </>
              )}

              {metricMode === 'error_rate' && (
                <Line
                  type="monotone"
                  dataKey="error"
                  name="Error Rate (%)"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  dot={{ fill: '#EF4444', r: 4 }}
                />
              )}

              {metricMode === 'cpu' && (
                <Line
                  type="monotone"
                  dataKey="cpu"
                  name="CPU Usage (%)"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  dot={{ fill: '#8B5CF6', r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
