import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Clock,
  ArrowUpRight,
  TrendingDown,
  PieChart as PieIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const ReportsAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await apiClient.getAnalytics();
      setData(res);
    }
    load();
  }, []);

  const handleDownloadCsv = () => {
    window.open('/api/reports/export/csv', '_blank');
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      // First try Python AI Engine direct endpoint
      const res = await fetch('http://localhost:8000/ai/reports/download-pdf');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'CASCADE_AI_Incident_Report_INC-8492.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
    } catch {}

    // Fallback: Trigger print/save as PDF
    window.print();
    setDownloadingPdf(false);
  };

  if (!data) return <div className="text-gray-400 text-xs p-6">Loading Analytics Engine...</div>;

  const pieData = [
    { name: 'Complete (Resolved by AI)', value: data.resolutionPie.complete, color: '#0284C7' },
    { name: 'Incomplete (Pending Manual Review)', value: data.resolutionPie.incomplete, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <span>Service Reliability Analytics & Reports</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Slide 13: AI-Powered Microservices Incident Detection, MTTR/MTTA breakdowns, and official report export
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-700 bg-gray-900 text-gray-300 hover:text-white hover:bg-gray-800 text-xs font-semibold transition"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-500/20"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{downloadingPdf ? 'Generating PDF...' : 'Download SRE PDF'}</span>
          </button>
        </div>
      </div>

      {/* Slide 13 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by Service Bar Chart */}
        <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Incidents by Service (Top 10)
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Normalized Outage Volume</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.incidentsByService}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="service" stroke="#6B7280" fontSize={9.5} angle={-25} textAnchor="end" height={45} />
                <YAxis stroke="#6B7280" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#374151',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="#38BDF8" radius={[4, 4, 0, 0]} name="Incident Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Breakdown Pie Chart (Slide 13: 87% Complete / 13% Incomplete) */}
        <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Incident Resolution Ratio (87% vs 13%)
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Autonomous vs Manual</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#374151',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Uptime by Service Horizontal List */}
        <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Uptime by Service
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Quarterly SLA Target: 99.9%</span>
          </div>

          <div className="space-y-2 text-xs">
            {data.uptimeByService.map((item: any) => (
              <div key={item.service} className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-gray-300">{item.service}</span>
                  <span className="text-emerald-400 font-bold">{item.uptime}</span>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: item.uptime }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Escalations by Service Bar Chart */}
        <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Escalations by Service
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Cross-Team Escalation Events</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.escalationsByService}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="service" stroke="#6B7280" fontSize={9.5} angle={-25} textAnchor="end" height={45} />
                <YAxis stroke="#6B7280" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#374151',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} name="Escalation Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Highest MTTA and MTTR Tables (Slide 13 bottom tables) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highest MTTA */}
        <div className="rounded-2xl border border-gray-800 bg-[#0F172A] overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 border-b border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Highest MTTA by Service (Mean Time to Acknowledge)
            </h3>
          </div>
          <table className="w-full text-left text-xs font-mono">
            <tbody className="divide-y divide-gray-800/60">
              {data.highestMttaByService.map((row: any, i: number) => (
                <tr key={row.service} className="hover:bg-gray-900/50">
                  <td className="py-2.5 px-5 text-gray-400">{i + 1}. {row.service}</td>
                  <td className="py-2.5 px-5 text-right font-bold text-amber-400">{row.mtta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Highest MTTR */}
        <div className="rounded-2xl border border-gray-800 bg-[#0F172A] overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 border-b border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Highest MTTR by Service (Mean Time to Recover)
            </h3>
          </div>
          <table className="w-full text-left text-xs font-mono">
            <tbody className="divide-y divide-gray-800/60">
              {data.highestMttrByService.map((row: any, i: number) => (
                <tr key={row.service} className="hover:bg-gray-900/50">
                  <td className="py-2.5 px-5 text-gray-400">{i + 1}. {row.service}</td>
                  <td className="py-2.5 px-5 text-right font-bold text-red-400">{row.mttr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
