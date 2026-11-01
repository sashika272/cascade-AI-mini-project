import React, { useState } from 'react';
import { Archive, Search, FileText, ArrowRight, CheckCircle2, Clock, Shield } from 'lucide-react';

interface PastIncident {
  id: string;
  title: string;
  severity: string;
  date: string;
  duration: string;
  rootCause: string;
  status: string;
  summary: string;
}

export const IncidentHistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const pastIncidents: PastIncident[] = [
    {
      id: 'INC-8492',
      title: 'SEV-1 Cascading Ingress Collapse & Downstream Socket Exhaustion',
      severity: 'SEV-1',
      date: '2026-11-01',
      duration: '42m 15s',
      rootCause: 'cfg-1003 @ network-gateway (proxy_read_timeout_ms: 250ms)',
      status: 'RESOLVED',
      summary: 'Aggressive ingress timeout change triggered downstream retry storms across auth, checkout, and payments services. Reverted at intervention deadline.'
    },
    {
      id: 'INC-8340',
      title: 'SEV-2 Redis Cache Eviction Volatility',
      severity: 'SEV-2',
      date: '2026-10-24',
      duration: '18m 30s',
      rootCause: 'cfg-2002 @ cart-service (eviction_policy modification)',
      status: 'RESOLVED',
      summary: 'Volatile-lru eviction caused sudden cache miss spike, degrading product catalog response times.'
    },
    {
      id: 'INC-8115',
      title: 'SEV-2 JWT Token Skew Expiration Anomaly',
      severity: 'SEV-2',
      date: '2026-10-15',
      duration: '25m 10s',
      rootCause: 'cfg-9002 @ auth-service (jwt_clock_skew_seconds: 0)',
      status: 'RESOLVED',
      summary: 'Zeroed out clock skew caused inter-cluster token invalidations during distributed microservice transit.'
    },
    {
      id: 'INC-7902',
      title: 'SEV-3 Database Connection Pool Exhaustion on Payments Worker',
      severity: 'SEV-3',
      date: '2026-09-28',
      duration: '12m 45s',
      rootCause: 'Connection leak during asynchronous payment webhook callbacks',
      status: 'RESOLVED',
      summary: 'PostgreSQL connection ceiling hit during flash sale batch processing.'
    }
  ];

  const filtered = pastIncidents.filter(
    i =>
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.rootCause.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-white flex items-center gap-2">
            <Archive className="h-5 w-5 text-cyan-400" />
            <span>Incident History & Post-Mortem Repository</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Page 14: Historical cascading failure post-mortems, resolution timelines, and learned SRE patterns
          </p>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search past incidents..."
            className="w-full rounded-lg border border-gray-700 bg-gray-900 py-1.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Historical MTTR / MTTA Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-4 rounded-xl border border-gray-800 bg-[#0F172A]">
          <span className="text-[10px] text-gray-500 uppercase block font-sans font-bold">
            Average SRE MTTR (Quarterly)
          </span>
          <div className="text-2xl font-black text-cyan-400 mt-1">24m 32s</div>
          <div className="text-[10px] text-emerald-400 font-sans mt-0.5">↓ 68% faster with CASCADE // AI</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-[#0F172A]">
          <span className="text-[10px] text-gray-500 uppercase block font-sans font-bold">
            Average SRE MTTA
          </span>
          <div className="text-2xl font-black text-purple-400 mt-1">1m 45s</div>
          <div className="text-[10px] text-gray-400 font-sans mt-0.5">Automated detection within 48 seconds</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-[#0F172A]">
          <span className="text-[10px] text-gray-500 uppercase block font-sans font-bold">
            Decoy Rejection Accuracy
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-1">100%</div>
          <div className="text-[10px] text-gray-400 font-sans mt-0.5">Zero false attribution to downstream decoys</div>
        </div>
      </div>

      {/* Incident Post-Mortems Archive List */}
      <div className="space-y-4">
        {filtered.map(inc => (
          <div
            key={inc.id}
            className="rounded-2xl border border-gray-800 bg-[#0F172A] p-5 shadow-xl hover:border-gray-700 transition space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800/80 gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    inc.severity === 'SEV-1'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : inc.severity === 'SEV-2'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}
                >
                  {inc.severity}
                </span>
                <span className="font-mono text-xs font-bold text-white">{inc.id}</span>
                <span className="text-gray-500">•</span>
                <span className="text-xs text-gray-400 font-sans">{inc.date}</span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-gray-400">Duration: <strong className="text-cyan-400">{inc.duration}</strong></span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  {inc.status}
                </span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-white">{inc.title}</h3>

            <div className="rounded-xl bg-gray-950/60 p-3 border border-gray-800/80 text-xs font-mono">
              <span className="text-gray-500 font-sans block text-[10px] uppercase font-bold mb-0.5">
                Root Cause Attribution & Parameter
              </span>
              <span className="text-red-300 font-semibold">{inc.rootCause}</span>
            </div>

            <p className="text-xs text-gray-300 font-sans leading-relaxed">{inc.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
