# CASCADE // AI – SRE Observability Command Center

> **"Service Dependency Analysis, Configuration Anomaly Detection and Root-Cause Identification for Cascading Failure Analysis"**  
> *Tagline:* **"Don't just suggest solutions. Prove which solutions work."**

Developed by:
- **K.N. Sashika** — Team Leader (`922524118047`)
- **S. Vikashini** — Team Member (`922524118063`)
- **Mr. C. Kavin Prakash, M.E.** — Project Mentor & Assistant Professor  
*Department of Computer and Communication Engineering, V.S.B. Engineering College, Karur – 639111 (Autonomous Institution, Anna University, Chennai).*

---

## 🌟 Executive Summary & Research Baseline

CASCADE // AI is an enterprise-grade Site Reliability Engineering (SRE) Command Center and Root Cause Analysis (RCA) platform. Grounded in the survey by **J. Soldani and A. Brogi** (*"Anomaly detection and failure root cause analysis in (micro)service-based cloud applications: A survey"*, ACM Computing Surveys, 2022), CASCADE // AI solves the core problem of microservice cascading failures: **when a configuration error triggers downstream collapse, the loudest alerts often appear far from the actual origin.**

### Case-Study Scenario & Ground Truth
- **Evaluated Microservice Chain:** `network-gateway` (Ingress) → `auth-service` (Security) → `checkout-service` (Business Core) → `payments-service` (Settlement) along with 13 supporting services (17 total nodes).
- **T+00 (10:40:00 AM):** Baseline nominal operations across all 17 microservices (mean latency 38ms, 0.0% error rate).
- **T+42 (10:41:18 AM):** **Primary Root Cause:** Configuration change `cfg-1003` applied at `network-gateway` reducing `proxy_read_timeout_ms` from `5000ms` to `250ms`.
- **T+48 (10:41:48 AM):** First persistent anomaly onset detected at gateway and auth-service (latency > 185ms).
- **T+75 (10:42:15 AM):** Golden SRE Intervention Window (optimal time to revert `cfg-1003` before retry queue saturation).
- **T+95 (10:46:11 AM):** **Downstream Decoy:** Configuration change `cfg-2001` applied at `payments-service` (`connection_pool_max`: 100 → 250).  
  - *Automated Causal Disqualification:* CASCADE // AI evaluates temporal precedence ($t_{\text{change}} > t_{\text{onset}}$: 95s > 48s) and dependency direction (farthest downstream node), disqualifying `cfg-2001` as a symptom trap with **98.6% confidence**.
- **T+180 (10:49:00 AM):** Critical cascading degradation across checkout and payments services.
- **T+330 (10:55:00 AM):** Near-total system collapse across the mesh (15 critical outage services, cascade risk 95%).

---

## 🏗️ System Architecture & Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Three.js, React Three Fiber, Drei, Framer Motion |
| **Backend API** | Node.js v26, Express.js 5, CORS, In-Memory Persistent Store + MongoDB Mongoose Adapter |
| **AI / ML Engine** | Python 3.13, FastAPI, Scikit-Learn (`IsolationForest`, `RandomForestClassifier`), Pandas, NumPy, ReportLab |
| **Authentication** | Cryptographic HMAC-SHA256 JWT, Salted Scrypt Passwords, Role-Based Access Control (Admin, SRE Engineer, Viewer) |
| **Data Storage** | 4 Canonical Datasets: `metrics_stream.csv`, `config_changes.csv`, `dependency_map.json`, `sabotage_drops/config_change_addition.csv` |

---

## 📦 Seven Core Modules (PPT & Report Aligned)

1. **Module 1 – Service Monitoring & Data Collection:** Live CPU, memory, response time, P99 latency, request throughput, and error rates across all 17 microservices.
2. **Module 2 – Data Processing & Anomaly Detection:** Scikit-Learn `IsolationForest` detecting subtle non-crashing latency drift and sustained error anomalies with z-score persistence checks.
3. **Module 3 – Root Cause Analysis & Dependency Mapping:** Causal dependency ranking, temporal test ($t < t_0$), graph traversal, and automated downstream decoy rejection.
4. **Module 4 – Sabotage Detection & Configuration Analysis:** Detects unapproved shadow changes from `sabotage_drops/config_change_addition.csv`, evaluates configuration drift against baseline snapshots.
5. **Module 5 – Incident Replay & Timeline Analysis:** High-resolution time-travel scrubber across T+0, T+42, T+48, T+75, T+95, T+180, T+330 with interactive play, pause, step-forward, and reset.
6. **Module 6 – AI Recovery Advisor & Recommendations:** Generates Quick, Safe, and Optimized recovery options with Monte Carlo simulation decay curves and 1-click execution.
7. **Module 7 – Dashboard & Incident Management:** SRE Command Center overview with interactive status filters, active SEV-1 alert banners, triage state transitions, and responder audit logs.

---

## ⚡ Three AI Capabilities

- **AI 1 – Root Cause Intelligence:** Multi-signal causality analysis attributing `cfg-1003` at `network-gateway` (98.6% confidence) and rejecting `cfg-2001`.
- **AI 2 – Intelligent Recovery Advisor:** Monte Carlo simulation proving latency decay curves before field deployment.
- **AI 3 – Predictive Failure Intelligence:** Scikit-Learn failure hazard estimator forecasting collapse horizon and queue saturation.

---

## 🖥️ 16 Complete Application Pages

1. **Login & Registration:** `/login`, `/register`, `/forgot-password` (Password meter, 1-click role presets)
2. **Overview Dashboard:** `/` (PPT Slide 12 pixel-perfect replica, SEV-1 banner, 6 KPI filter cards)
3. **Live Monitoring:** `/monitoring` (Real-time telemetry, P99 latency, Recharts trends)
4. **Service Dependency Map:** `/dependency-map` (3D interactive mesh + 2D graph + blast radius calculator)
5. **Anomaly Detection:** `/anomalies` (Isolation Forest anomaly score feeds, evidence cards)
6. **Incident Management:** `/incidents` (SEV-1 incident triage, status transitions, responder notes)
7. **Root Cause Analysis:** `/root-cause` (RCA findings, 98.6% confidence, decoy rejection explanation)
8. **Configuration Analysis:** `/config-analysis` (Approved GitOps history vs sabotage drops)
9. **Incident Replay:** `/incident-replay` (Timeline scrubber with auto-playback and state reconstruction)
10. **AI Recovery Advisor:** `/recovery-advisor` (Quick, Safe, Optimized recovery + simulation)
11. **Failure Simulation:** `/simulation` (What-If chaos fault injection and blast radius prediction)
12. **Recovery Validation:** `/validation` (Post-remediation SLO threshold verification probes)
13. **Predictive Analysis:** `/predictive` (Hazard rate curves, time-to-collapse projection)
14. **Incident History:** `/history` (Quarterly MTTR/MTTA metrics and post-mortem archive)
15. **Reports & Analytics:** `/reports` (PPT Slide 13 charts, Incidents by service, Uptime, PDF & CSV export)
16. **Settings:** `/settings` (Dark/Light mode switch, RBAC selector, Slack/PagerDuty webhooks, thresholds)

---

## 🚀 How to Run the Application

### 1. Verification Test Suite
Run the automated test suite to verify datasets, RCA temporal logic, IsolationForest, and PDF generator:
```powershell
python test_cascade_system.py
```
*(All 6/6 tests pass with 100% success).*

### 2. Start the Backend API (Port 3001)
```powershell
node backend/src/server.js
```
The backend initializes the in-memory persistent store with all 17 microservices and serves the compiled frontend.

### 3. Start the Python AI Engine (Port 8000)
```powershell
cd ai-engine
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Start the Vite Frontend (Port 5173)
```powershell
node node_modules/vite/bin/vite.js
```
Open **http://localhost:5173** (or http://localhost:3001) in your browser.
