export type ServiceStatus = 'HEALTHY' | 'DEGRADING' | 'CRITICAL_OUTAGE';

export interface ServiceNode {
  id: string;
  name: string;
  tier: string;
  category: string;
  critical_path: boolean;
  centrality_score: number;
  port: number;
  technology: string;
  sla_target: number;
  position_3d?: [number, number, number];
  calls?: string[];
  status: ServiceStatus;
  response_time_ms: number;
  latency_p99_ms: number;
  error_rate: number;
  cpu_usage: number;
  memory_usage: number;
  request_count: number;
  uptime_percentage?: number;
  mttr_minutes?: number;
  mtta_minutes?: number;
}

export interface DependencyEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
  is_case_study?: boolean;
}

export interface ConfigChange {
  change_id: string;
  timestamp: string;
  time_offset: string;
  service_id: string;
  parameter: string;
  old_value: string;
  new_value: string;
  author: string;
  change_type: string;
  approved: string;
  risk_score: string;
  notes: string;
}

export interface SabotageDrop {
  change_id: string;
  timestamp: string;
  time_offset: string;
  service_id: string;
  parameter: string;
  old_value: string;
  new_value: string;
  author: string;
  source: string;
  status: string;
  threat_level: string;
  drift_detected: string;
  notes: string;
}

export interface AnomalyItem {
  id: string;
  service_id: string;
  timestamp: string;
  time_offset: string;
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  anomaly_score: number;
  metrics: {
    response_time_ms: number;
    latency_p99_ms: number;
    error_rate: number;
    cpu_usage: number;
  };
  evidence: string;
  is_persistent: boolean;
}

export interface IncidentTimelineItem {
  time: string;
  label: string;
  status: string;
}

export interface IncidentNote {
  author: string;
  timestamp: string;
  text: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'SEV-1' | 'SEV-2' | 'SEV-3';
  status: 'INVESTIGATING' | 'MITIGATING' | 'RESOLVED';
  createdAt: string;
  rootCauseService: string;
  rootCauseChangeId: string;
  decoyRejectedChangeId: string;
  confidence: number;
  confidencePct: string;
  cascadeRiskIndex: string;
  affectedServicesCount: number;
  totalServices: number;
  currentSummary: string;
  timeline: IncidentTimelineItem[];
  notes: IncidentNote[];
}

export interface ReplayTick {
  tick: string;
  title: string;
  description: string;
  activeChange?: string | null;
  summary: {
    healthy: number;
    degrading: number;
    critical: number;
    total: number;
  };
  services: any[];
}

export interface RecoveryOption {
  id: string;
  name: string;
  action: string;
  reason: string;
  expected_result: string;
  risk_level: 'LOW' | 'VERY LOW' | 'MEDIUM' | 'HIGH';
  estimated_recovery_time_sec: number;
  success_probability: number;
  is_recommended: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'SRE Engineer' | 'Viewer';
  title: string;
  avatar: string;
}
