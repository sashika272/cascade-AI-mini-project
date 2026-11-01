import React, { useState } from 'react';
import {
  BookOpen,
  Terminal,
  HelpCircle,
  FileCode,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Target,
  Sparkles,
  Layers,
  Cpu,
  Download,
  Printer,
  FileText
} from 'lucide-react';

export const HelpDocumentationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'scenario' | 'runbook' | 'api' | 'faq'>('overview');

  const handleDownloadDocs = () => {
    const docContent = `# CASCADE // AI — SRE Operational Runbooks & Architecture Specification

## Academic Context & IEEE Paper Alignment
CASCADE // AI is engineered around the formal principles of distributed systems failure propagation, originating from the seminal IEEE survey on cascading failures in microservice architectures (Soldani & Brogi, 2022).

- Principal Authors: K.N. Sashika & S. Vikashini
- Project Mentor: Mr. C. Kavin Prakash, M.E.
- Department: Department of Computer Science and Engineering
- Institution: V.S.B. Engineering College, Karur, Tamil Nadu

## Mathematical Multi-Weighted RCA Scoring
Score(c) = w_temporal · (T_anomaly - T_change) + w_centrality · C_eigen(service) + w_propagation · OutDegree(service)
Changes applied after the anomaly onset (T_change > T_anomaly) receive a score of zero and are immediately disqualified as downstream decoys.

## Ground Truth Incident Timeline (INC-8492)
- T+00: Baseline Normal Operation. All 17 services healthy.
- T+42: Root Cause Config Change cfg-1003 deployed to network-gateway (proxy_read_timeout_ms: 5000 -> 250).
- T+48: Persistent Anomaly Onset detected at gateway ingress.
- T+75: Golden SRE Intervention Window (10:42 AM).
- T+95: Downstream Decoy Change cfg-2001 at payments-service (REJECTED by temporal causality).
- T+180: Critical Cascading Degradation across auth-service and checkout-service.
- T+330: Near-Total System Collapse (16 of 17 services failing).

## SRE Standard Operating Procedure (SOP)
1. Verify Root Cause Candidate: Confirm cfg-1003 confidence >= 95%.
2. Inspect Blast Radius: Review 3D Digital Twin dependency topology.
3. Select & Execute Remediation: Rollback cfg-1003 on network-gateway.
4. Verify SLO Compliance: Confirm p99 latency < 120ms and error rate < 0.01%.
`;
    const blob = new Blob([docContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CASCADE_AI_Documentation_Runbooks.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
            <span>Documentation & SRE Operational Runbooks</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            MachineMind AI Feature 16: System architecture, IEEE academic foundations, ground truth scenario, and troubleshooting runbooks
          </p>
        </div>

        {/* Download & Export Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 text-xs font-semibold transition cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500 dark:text-gray-400" />
            <span>Print Runbook</span>
          </button>
          <button
            onClick={handleDownloadDocs}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition cursor-pointer"
            title="Download full documentation markdown file"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Documentation</span>
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex border-b border-gray-800 space-x-1">
        {[
          { id: 'overview', label: '1. Architecture & IEEE Paper' },
          { id: 'scenario', label: '2. Ground Truth Scenario' },
          { id: 'runbook', label: '3. Cascading Failure Runbook' },
          { id: 'api', label: '4. REST & AI API Reference' },
          { id: 'faq', label: '5. SRE FAQ & Troubleshooting' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-900/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Architecture & IEEE Paper */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase font-mono border-b border-gray-800 pb-2 text-cyan-400">
              Academic Context & IEEE Paper Alignment
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              CASCADE // AI is engineered around the formal principles of distributed systems failure propagation,
              originating from the seminal IEEE survey on cascading failures in microservice architectures (Soldani & Brogi, 2022).
            </p>

            <div className="rounded-xl border border-gray-800 bg-gray-950/80 p-4 space-y-2 text-xs">
              <div className="font-bold text-white font-mono uppercase text-xs">Project Development Team:</div>
              <ul className="list-disc pl-5 text-gray-300 space-y-1 text-xs">
                <li><strong>Principal Authors:</strong> K.N. Sashika & S. Vikashini</li>
                <li><strong>Project Mentor:</strong> Mr. C. Kavin Prakash, M.E.</li>
                <li><strong>Department:</strong> Department of Computer Science and Engineering</li>
                <li><strong>Institution:</strong> V.S.B. Engineering College, Karur, Tamil Nadu</li>
              </ul>
            </div>

            <h3 className="text-xs font-bold text-white uppercase font-mono pt-2">Mathematical Multi-Weighted RCA Scoring:</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Candidate configuration changes $c \in C$ are scored using a compound causal objective:
            </p>
            <div className="rounded-lg bg-gray-950 p-3 font-mono text-xs text-cyan-300 border border-gray-800">
              Score(c) = w_temporal · (T_anomaly - T_change) + w_centrality · C_eigen(service) + w_propagation · OutDegree(service)
            </div>
            <p className="text-[11px] text-gray-400">
              Changes applied <em>after</em> the anomaly onset (T_change &gt; T_anomaly) receive a score of zero and are immediately disqualified as downstream decoys.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Ground Truth Scenario */}
      {activeTab === 'scenario' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase font-mono border-b border-gray-800 pb-2 text-cyan-400">
              The SEV-1 Ground Truth Incident Timeline (INC-8492)
            </h2>
            <div className="space-y-3">
              {[
                { time: 'T+00', title: 'Baseline Normal Operation', desc: 'Average cluster latency 38ms, 0% error rate, all 17 microservices healthy.', tag: 'HEALTHY' },
                { time: 'T+42', title: 'Root Cause Config Change cfg-1003', desc: 'SRE mistakenly changed proxy_read_timeout_ms from 5000 to 250 on network-gateway.', tag: 'TRIGGER' },
                { time: 'T+48', title: 'Persistent Anomaly Onset Detected', desc: 'Gateway began failing slow downstream requests, triggering queue backpressure.', tag: 'DEGRADING' },
                { time: 'T+75', title: 'Golden SRE Intervention Window (10:42 AM)', desc: 'Optimal window to execute rollback before downstream thread pool starvation.', tag: 'WINDOW' },
                { time: 'T+95', title: 'Downstream Decoy Change cfg-2001 (REJECTED)', desc: 'Junior dev adjusted connection_pool_max (100 -> 250) at payments-service. AI rejects decoy (T+95 > T+48).', tag: 'DECOY' },
                { time: 'T+180', title: 'Critical Cascading Degradation', desc: 'Retry storms propagate to checkout-service and payments-service.', tag: 'CRITICAL' },
                { time: 'T+330', title: 'Near-Total System Collapse', desc: '16 of 17 services unresponsive. Cascading failure risk reaches 95%.', tag: 'COLLAPSE' }
              ].map(item => (
                <div key={item.time} className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-950 p-3 text-xs">
                  <span className="font-mono font-bold text-cyan-400 min-w-[50px]">{item.time}</span>
                  <div className="flex-1 space-y-0.5">
                    <div className="font-bold text-white">{item.title}</div>
                    <div className="text-gray-400 text-[11px]">{item.desc}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-gray-900 border border-gray-800 text-gray-300">
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Runbook */}
      {activeTab === 'runbook' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase font-mono border-b border-gray-800 pb-2 text-cyan-400">
              SRE Standard Operating Procedure: Cascading Outage Remediation
            </h2>
            <div className="space-y-4 text-xs text-gray-300">
              <div className="space-y-1">
                <h4 className="font-bold text-white">Step 1: Verify Root Cause Candidate Isolation</h4>
                <p className="text-gray-400">Navigate to Root Cause Analysis page. Ensure cfg-1003 has &gt;95% confidence score and decoy cfg-2001 is rejected.</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white">Step 2: Inspect Blast Radius in 3D Digital Twin</h4>
                <p className="text-gray-400">Open Digital Twin or Dependency Map to review the critical ingress path (network-gateway &rarr; auth &rarr; checkout &rarr; payments).</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white">Step 3: Select and Execute Recovery Strategy</h4>
                <p className="text-gray-400">Go to AI Recovery Advisor. Choose Quick Recovery (Rollback cfg-1003). Review simulated MTTR (3.2 min) and click "Execute Quick Recovery".</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white">Step 4: Verify Post-Recovery SLO Restoration</h4>
                <p className="text-gray-400">Check Recovery Validation page to verify latency decay curve drops below 120ms and error rates return to 0.01%.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: API Reference */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase font-mono border-b border-gray-800 pb-2 text-cyan-400">
              System Endpoints & Integration Interfaces
            </h2>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">GET</span>
                  <span className="text-white">/api/services</span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans">Returns current metrics, health statuses, and SLA compliance for all 17 microservices.</p>
              </div>

              <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">GET</span>
                  <span className="text-white">/api/rca</span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans">Executes causal dependency analysis, isolates primary root cause, and filters decoys.</p>
              </div>

              <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">POST</span>
                  <span className="text-white">/api/recovery/apply</span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans">Executes remediation (quick rollback, safe rate-limiting, or optimized scaling).</p>
              </div>

              <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">POST</span>
                  <span className="text-white">http://localhost:8000/ai/rca/analyze</span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans">Python FastAPI + Scikit-learn Isolation Forest engine.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase font-mono border-b border-gray-800 pb-2 text-cyan-400">
              Frequently Asked Questions (FAQ)
            </h2>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-white">Why was cfg-2001 disqualified when payments-service was throwing 500 errors?</h4>
                <p className="text-gray-400">
                  Although payments-service experienced high failure rates, cfg-2001 was deployed at T+95, which is 47 seconds <em>after</em> the anomaly onset at T+48. In causal physics, an effect cannot precede its cause. Hence, cfg-2001 was a decoy.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-gray-800/80">
                <h4 className="font-bold text-white">How does Monte Carlo failure simulation differ from actual execution?</h4>
                <p className="text-gray-400">
                  Simulation computes 10,000 synthetic trajectory iterations to estimate recovery velocity without modifying production clusters, adhering to the SRE motto: <em>"Don't just suggest solutions. Prove which solutions work."</em>
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-gray-800/80">
                <h4 className="font-bold text-white">How do I switch between dark and light modes?</h4>
                <p className="text-gray-400">
                  Click the Sun/Moon toggle icon in the top navigation header or use the toggle on the Settings page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
