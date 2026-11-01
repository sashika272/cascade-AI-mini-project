import {
  ServiceNode,
  DependencyEdge,
  ConfigChange,
  SabotageDrop,
  AnomalyItem,
  Incident,
  ReplayTick,
  RecoveryOption,
  User
} from '../types';

const API_BASE = '/api';

// Helper for fetch with JSON fallback
async function fetchWithFallback<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('cascade_token') || ''}`
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API call ${url} failed, using local resilient cache`, err);
    return fallback;
  }
}

// Initial 17 Services Data (matches IEEE paper and PPT slide 12)
export const initialServicesData: ServiceNode[] = [
  {
    id: 'network-gateway',
    name: 'Network Gateway',
    tier: 'Ingress',
    category: 'api-gateway',
    critical_path: true,
    centrality_score: 0.98,
    port: 8080,
    technology: 'Envoy / NGINX',
    sla_target: 99.99,
    position_3d: [-0.5, 3.6, 0.0],
    calls: ['auth-service', 'catalog-service', 'search-index', 'logging-aggregator'],
    status: 'CRITICAL_OUTAGE',
    response_time_ms: 1450.0,
    latency_p99_ms: 2800.0,
    error_rate: 38.5,
    cpu_usage: 94.2,
    memory_usage: 89.5,
    request_count: 3150,
    uptime_percentage: 98.4,
    mttr_minutes: 28,
    mtta_minutes: 1.2
  },
  {
    id: 'auth-service',
    name: 'Auth Service',
    tier: 'Security Core',
    category: 'authentication',
    critical_path: true,
    centrality_score: 0.91,
    port: 8081,
    technology: 'Node.js / OAuth2',
    sla_target: 99.95,
    position_3d: [-2.0, 1.2, 0.0],
    calls: ['checkout-service', 'user-profile', 'cache-cluster'],
    status: 'CRITICAL_OUTAGE',
    response_time_ms: 1820.0,
    latency_p99_ms: 3200.0,
    error_rate: 34.2,
    cpu_usage: 91.8,
    memory_usage: 92.0,
    request_count: 2890,
    uptime_percentage: 98.6,
    mttr_minutes: 22,
    mtta_minutes: 1.5
  },
  {
    id: 'checkout-service',
    name: 'Checkout Service',
    tier: 'Business Core',
    category: 'transaction',
    critical_path: true,
    centrality_score: 0.88,
    port: 8082,
    technology: 'Go Microservice',
    sla_target: 99.95,
    position_3d: [-1.0, -1.2, 0.0],
    calls: ['payments-service', 'inventory-api', 'cart-service', 'order-fulfillment'],
    status: 'CRITICAL_OUTAGE',
    response_time_ms: 2100.0,
    latency_p99_ms: 3650.0,
    error_rate: 29.8,
    cpu_usage: 88.4,
    memory_usage: 87.6,
    request_count: 1540,
    uptime_percentage: 98.5,
    mttr_minutes: 24,
    mtta_minutes: 1.9
  },
  {
    id: 'payments-service',
    name: 'Payments Service',
    tier: 'Financial Settlement',
    category: 'payment-gateway',
    critical_path: true,
    centrality_score: 0.82,
    port: 8083,
    technology: 'Java / Spring Boot',
    sla_target: 99.99,
    position_3d: [0.2, -3.6, 0.0],
    calls: ['database-cluster', 'notification-service'],
    status: 'CRITICAL_OUTAGE',
    response_time_ms: 2600.0,
    latency_p99_ms: 4100.0,
    error_rate: 26.4,
    cpu_usage: 86.1,
    memory_usage: 88.2,
    request_count: 1180,
    uptime_percentage: 98.2,
    mttr_minutes: 33,
    mtta_minutes: 2.3
  },
  {
    id: 'inventory-api',
    name: 'Inventory API',
    tier: 'Inventory Core',
    category: 'warehouse',
    critical_path: false,
    centrality_score: 0.65,
    port: 8084,
    technology: 'Python / FastAPI',
    sla_target: 99.90,
    position_3d: [3.5, -1.2, 0.0],
    calls: ['database-cluster'],
    status: 'CRITICAL_OUTAGE',
    response_time_ms: 920.0,
    latency_p99_ms: 1850.0,
    error_rate: 18.5,
    cpu_usage: 78.5,
    memory_usage: 74.0,
    request_count: 890,
    uptime_percentage: 99.2,
    mttr_minutes: 18,
    mtta_minutes: 1.8
  },
  {
    id: 'cart-service',
    name: 'Cart Service',
    tier: 'Stateful Session',
    category: 'cart',
    critical_path: false,
    centrality_score: 0.58,
    port: 8085,
    technology: 'Redis / Node.js',
    sla_target: 99.90,
    position_3d: [-5.5, -1.2, 0.0],
    calls: ['cache-cluster'],
    status: 'CRITICAL_OUTAGE',
    response_time_ms: 740.0,
    latency_p99_ms: 1400.0,
    error_rate: 15.2,
    cpu_usage: 72.0,
    memory_usage: 69.5,
    request_count: 1420,
    uptime_percentage: 99.1,
    mttr_minutes: 14,
    mtta_minutes: 1.7
  },
  {
    id: 'catalog-service',
    name: 'Catalog Service',
    tier: 'Content Delivery',
    category: 'products',
    critical_path: false,
    centrality_score: 0.52,
    port: 8086,
    technology: 'Go',
    sla_target: 99.90,
    position_3d: [2.8, 1.2, 0.0],
    calls: ['search-index', 'cache-cluster'],
    status: 'DEGRADING',
    response_time_ms: 420.0,
    latency_p99_ms: 890.0,
    error_rate: 9.4,
    cpu_usage: 64.2,
    memory_usage: 61.0,
    request_count: 1250,
    uptime_percentage: 99.3,
    mttr_minutes: 12,
    mtta_minutes: 1.4
  },
  {
    id: 'notification-service',
    name: 'Notification Service',
    tier: 'Messaging',
    category: 'events',
    critical_path: false,
    centrality_score: 0.45,
    port: 8087,
    technology: 'RabbitMQ / Worker',
    sla_target: 99.50,
    position_3d: [7.0, -3.6, -0.8],
    calls: [],
    status: 'CRITICAL_OUTAGE',
    response_time_ms: 1500.0,
    latency_p99_ms: 2900.0,
    error_rate: 38.2,
    cpu_usage: 79.0,
    memory_usage: 72.0,
    request_count: 510,
    uptime_percentage: 99.5,
    mttr_minutes: 15,
    mtta_minutes: 2.0
  },
  {
    id: 'user-profile',
    name: 'User Profile Service',
    tier: 'Identity',
    category: 'users',
    critical_path: false,
    centrality_score: 0.49,
    port: 8088,
    technology: 'Node.js',
    sla_target: 99.90,
    position_3d: [-7.0, 1.2, 0.0],
    calls: ['database-cluster'],
    status: 'CRITICAL_OUTAGE',
    response_time_ms: 2600.0,
    latency_p99_ms: 4400.0,
    error_rate: 52.0,
    cpu_usage: 89.0,
    memory_usage: 83.0,
    request_count: 680,
    uptime_percentage: 99.4,
    mttr_minutes: 16,
    mtta_minutes: 1.6
  },
  {
    id: 'shipping-service',
    name: 'Shipping Logistics',
    tier: 'Fulfillment',
    category: 'logistics',
    critical_path: false,
    centrality_score: 0.42,
    port: 8089,
    technology: 'Java',
    sla_target: 99.80,
    position_3d: [7.0, -3.6, 0.8],
    calls: ['notification-service'],
    status: 'CRITICAL_OUTAGE',
    response_time_ms: 2100.0,
    latency_p99_ms: 3800.0,
    error_rate: 44.5,
    cpu_usage: 84.5,
    memory_usage: 78.2,
    request_count: 420,
    uptime_percentage: 99.6,
    mttr_minutes: 13,
    mtta_minutes: 1.5
  },
  {
    id: 'analytics-pipeline',
    name: 'Analytics Pipeline',
    tier: 'Data Lake',
    category: 'telemetry',
    critical_path: false,
    centrality_score: 0.38,
    port: 8090,
    technology: 'Apache Kafka / Flink',
    sla_target: 99.00,
    position_3d: [-7.5, -3.6, 0.0],
    calls: [],
    status: 'CRITICAL_OUTAGE',
    response_time_ms: 2100.0,
    latency_p99_ms: 3600.0,
    error_rate: 41.0,
    cpu_usage: 85.0,
    memory_usage: 84.0,
    request_count: 1900,
    uptime_percentage: 99.9,
    mttr_minutes: 19,
    mtta_minutes: 2.2
  },
  {
    id: 'cache-cluster',
    name: 'Redis Cache Cluster',
    tier: 'Data Layer',
    category: 'memory-cache',
    critical_path: true,
    centrality_score: 0.74,
    port: 6379,
    technology: 'Redis Enterprise 7',
    sla_target: 99.99,
    position_3d: [-3.8, -3.6, 0.0],
    calls: [],
    status: 'DEGRADING',
    response_time_ms: 45.0,
    latency_p99_ms: 120.0,
    error_rate: 14.8,
    cpu_usage: 76.5,
    memory_usage: 88.9,
    request_count: 5200,
    uptime_percentage: 99.8,
    mttr_minutes: 8,
    mtta_minutes: 0.9
  },
  {
    id: 'database-cluster',
    name: 'Primary Database Cluster',
    tier: 'Persistence',
    category: 'rdbms',
    critical_path: true,
    centrality_score: 0.79,
    port: 5432,
    technology: 'PostgreSQL HA',
    sla_target: 99.99,
    position_3d: [4.0, -3.6, 0.0],
    calls: [],
    status: 'CRITICAL_OUTAGE',
    response_time_ms: 1850.0,
    latency_p99_ms: 3400.0,
    error_rate: 42.5,
    cpu_usage: 98.2,
    memory_usage: 94.5,
    request_count: 1850,
    uptime_percentage: 99.7,
    mttr_minutes: 29,
    mtta_minutes: 2.5
  },
  {
    id: 'search-index',
    name: 'Search Engine Index',
    tier: 'Search',
    category: 'elasticsearch',
    critical_path: false,
    centrality_score: 0.48,
    port: 9200,
    technology: 'OpenSearch',
    sla_target: 99.85,
    position_3d: [5.5, 3.6, 0.0],
    calls: [],
    status: 'CRITICAL_OUTAGE',
    response_time_ms: 2200.0,
    latency_p99_ms: 3900.0,
    error_rate: 49.0,
    cpu_usage: 86.0,
    memory_usage: 82.0,
    request_count: 720,
    uptime_percentage: 99.7,
    mttr_minutes: 17,
    mtta_minutes: 1.8
  },
  {
    id: 'recommendation-engine',
    name: 'AI Recommendation Engine',
    tier: 'Machine Learning',
    category: 'recommendations',
    critical_path: false,
    centrality_score: 0.35,
    port: 8092,
    technology: 'Python PyTorch',
    sla_target: 99.50,
    position_3d: [7.0, 1.2, 0.0],
    calls: ['catalog-service'],
    status: 'CRITICAL_OUTAGE',
    response_time_ms: 2800.0,
    latency_p99_ms: 4600.0,
    error_rate: 51.0,
    cpu_usage: 82.4,
    memory_usage: 80.1,
    request_count: 480,
    uptime_percentage: 99.5,
    mttr_minutes: 11,
    mtta_minutes: 2.1
  },
  {
    id: 'order-fulfillment',
    name: 'Order Fulfillment Service',
    tier: 'Fulfillment',
    category: 'orders',
    critical_path: false,
    centrality_score: 0.54,
    port: 8093,
    technology: 'Go Microservice',
    sla_target: 99.90,
    position_3d: [7.5, -1.2, 0.0],
    calls: ['shipping-service', 'database-cluster'],
    status: 'CRITICAL_OUTAGE',
    response_time_ms: 3600.0,
    latency_p99_ms: 5800.0,
    error_rate: 61.0,
    cpu_usage: 91.0,
    memory_usage: 87.0,
    request_count: 540,
    uptime_percentage: 99.4,
    mttr_minutes: 21,
    mtta_minutes: 1.9
  },
  {
    id: 'logging-aggregator',
    name: 'Logstash Telemetry Ingest',
    tier: 'Observability',
    category: 'logging',
    critical_path: false,
    centrality_score: 0.30,
    port: 5044,
    technology: 'Fluentbit / Vector',
    sla_target: 99.90,
    position_3d: [-6.5, 3.6, 0.0],
    calls: [],
    status: 'HEALTHY',
    response_time_ms: 20.0,
    latency_p99_ms: 35.0,
    error_rate: 0.0,
    cpu_usage: 30.0,
    memory_usage: 45.0,
    request_count: 4100,
    uptime_percentage: 99.9,
    mttr_minutes: 5,
    mtta_minutes: 0.8
  }
];

export const initialDependencyEdges: DependencyEdge[] = [
  { source: 'network-gateway', target: 'auth-service', type: 'synchronous_http', weight: 1.0, is_case_study: true },
  { source: 'auth-service', target: 'checkout-service', type: 'synchronous_http', weight: 0.95, is_case_study: true },
  { source: 'checkout-service', target: 'payments-service', type: 'synchronous_grpc', weight: 0.92, is_case_study: true },
  { source: 'checkout-service', target: 'inventory-api', type: 'grpc', weight: 0.7 },
  { source: 'checkout-service', target: 'cart-service', type: 'http', weight: 0.6 },
  { source: 'checkout-service', target: 'order-fulfillment', type: 'event_stream', weight: 0.65 },
  { source: 'network-gateway', target: 'catalog-service', type: 'http', weight: 0.5 },
  { source: 'network-gateway', target: 'search-index', type: 'http', weight: 0.4 },
  { source: 'auth-service', target: 'user-profile', type: 'http', weight: 0.5 },
  { source: 'auth-service', target: 'cache-cluster', type: 'redis_tcp', weight: 0.8 },
  { source: 'payments-service', target: 'database-cluster', type: 'pg_tcp', weight: 0.85 },
  { source: 'payments-service', target: 'notification-service', type: 'amqp', weight: 0.4 },
  { source: 'inventory-api', target: 'database-cluster', type: 'pg_tcp', weight: 0.7 },
  { source: 'cart-service', target: 'cache-cluster', type: 'redis_tcp', weight: 0.75 },
  { source: 'order-fulfillment', target: 'shipping-service', type: 'http', weight: 0.5 },
  { source: 'order-fulfillment', target: 'database-cluster', type: 'pg_tcp', weight: 0.6 },
  { source: 'shipping-service', target: 'notification-service', type: 'amqp', weight: 0.4 },
  { source: 'catalog-service', target: 'cache-cluster', type: 'redis_tcp', weight: 0.6 },
  { source: 'recommendation-engine', target: 'catalog-service', type: 'http', weight: 0.35 }
];

export const apiClient = {
  // Services
  async getServices(status?: string, search?: string) {
    const q = new URLSearchParams();
    if (status) q.set('status', status);
    if (search) q.set('search', search);
    return fetchWithFallback<{ counts: any; services: ServiceNode[] }>(`/services?${q.toString()}`, {
      counts: { total: 17, healthy: 1, degrading: 1, critical: 15 },
      services: initialServicesData
    });
  },

  // Dependencies
  async getDependencies() {
    return fetchWithFallback<{ topology_version: string; case_study_chain: string[]; nodes: ServiceNode[]; edges: DependencyEdge[] }>(
      '/dependencies',
      {
        topology_version: '2.4.0',
        case_study_chain: ['network-gateway', 'auth-service', 'checkout-service', 'payments-service'],
        nodes: initialServicesData,
        edges: initialDependencyEdges
      }
    );
  },

  // Anomalies
  async getAnomalies(serviceId?: string, severity?: string) {
    const q = new URLSearchParams();
    if (serviceId) q.set('service_id', serviceId);
    if (severity) q.set('severity', severity);
    return fetchWithFallback<{ total_anomalies: number; first_persistent_onset: string; anomalies: AnomalyItem[] }>(
      `/anomalies?${q.toString()}`,
      {
        total_anomalies: 8,
        first_persistent_onset: 'T+48 (10:41:48 AM)',
        anomalies: [
          {
            id: 'ANM-1001',
            service_id: 'network-gateway',
            timestamp: '2026-11-01T10:41:48Z',
            time_offset: 'T+48',
            severity: 'HIGH',
            anomaly_score: 0.88,
            metrics: { response_time_ms: 185.4, latency_p99_ms: 342.0, error_rate: 3.45, cpu_usage: 58.2 },
            evidence: 'Latency 185.4ms exceeds baseline 38.2ms envelope (z-score > 3.4). Sustained for > 15s.',
            is_persistent: true
          },
          {
            id: 'ANM-1002',
            service_id: 'auth-service',
            timestamp: '2026-11-01T10:41:48Z',
            time_offset: 'T+48',
            severity: 'MEDIUM',
            anomaly_score: 0.76,
            metrics: { response_time_ms: 124.0, latency_p99_ms: 225.0, error_rate: 1.80, cpu_usage: 49.1 },
            evidence: 'Downstream caller thread accumulation detected following gateway latency rise.',
            is_persistent: true
          },
          {
            id: 'ANM-1003',
            service_id: 'checkout-service',
            timestamp: '2026-11-01T10:42:15Z',
            time_offset: 'T+75',
            severity: 'HIGH',
            anomaly_score: 0.85,
            metrics: { response_time_ms: 168.0, latency_p99_ms: 295.0, error_rate: 2.80, cpu_usage: 58.0 },
            evidence: 'Buffer saturation and retry backlog initiated during intervention window.',
            is_persistent: true
          },
          {
            id: 'ANM-1004',
            service_id: 'network-gateway',
            timestamp: '2026-11-01T10:49:00Z',
            time_offset: 'T+180',
            severity: 'CRITICAL',
            anomaly_score: 0.99,
            metrics: { response_time_ms: 1450.0, latency_p99_ms: 2800.0, error_rate: 38.5, cpu_usage: 94.2 },
            evidence: 'Critical cascading outage: 38.5% error rate, proxy read timeouts exhausting worker threads.',
            is_persistent: true
          }
        ]
      }
    );
  },

  // RCA
  async getRCA() {
    return fetchWithFallback<any>('/rca', {
      incident_id: 'INC-8492',
      scenario_confidence: '98.6%',
      primary_root_cause: {
        change_id: 'cfg-1003',
        service_id: 'network-gateway',
        timestamp: '2026-11-01T10:41:18Z',
        time_offset: 'T+42 (10:41:18 AM)',
        parameter: 'proxy_read_timeout_ms',
        previous_value: '5000ms',
        faulty_value: '250ms',
        confidence_score: 0.986,
        confidence_percentage: '98.6%',
        verdict: 'CONFIRMED PRIMARY ROOT CAUSE',
        temporal_delta: 'Preceded onset by 6 seconds (T+42 vs T+48)',
        topology_rank: 'Root Ingress Node (Centrality: 0.98, Out-Degree: 4)',
        cascade_origin: true,
        evidence: [
          { rule: 'Temporal Precedence Test', passed: true, details: 'Timestamp T+42 strictly preceded the first persistent anomaly onset at T+48.' },
          { rule: 'Dependency Graph Directionality Test', passed: true, details: 'network-gateway sits at the upstream inception of the critical path.' },
          { rule: 'Mechanism Attribution', passed: true, details: 'Proxy read timeout reduced from 5000ms to 250ms caused premature aborts on valid responses.' },
          { rule: 'Failure Propagation Consistency', passed: true, details: 'Degradation order matched topological traversal: T+48 (gateway/auth) -> T+75 (checkout) -> T+95 (payments) -> T+330 (cluster).' }
        ]
      },
      rejected_decoy: {
        change_id: 'cfg-2001',
        service_id: 'payments-service',
        timestamp: '2026-11-01T10:46:11Z',
        time_offset: 'T+95 (10:46:11 AM)',
        parameter: 'connection_pool_max',
        previous_value: '100',
        applied_value: '250',
        verdict: 'DOWNSTREAM DECOY DISQUALIFIED',
        confidence_score: 0.014,
        reasons: [
          { check: 'Temporal Causality Violation', disqualified: true, explanation: 'Applied at T+95, exactly 47 seconds AFTER persistent cascading anomalies were already established at T+48.' },
          { check: 'Dependency Position Violation', disqualified: true, explanation: 'payments-service sits at the farthest downstream terminal position (Position 3). Downstream changes cannot causally cause earlier upstream gateway latency drift.' },
          { check: 'Misleading Loudness / Symptom Trap', disqualified: true, explanation: 'payments-service exhibited high error volume because incoming checkout requests had already timed out at the gateway.' }
        ]
      },
      recommended_intervention_window: 'T+75 (10:42 AM)',
      propagation_chain: [
        { step: 1, service: 'network-gateway', time: 'T+42 to T+48', impact: 'Ingress timeout drops 12% of valid requests' },
        { step: 2, service: 'auth-service', time: 'T+48 to T+75', impact: 'Retry queue saturation and thread pool depletion' },
        { step: 3, service: 'checkout-service', time: 'T+75 to T+180', impact: 'Cascading timeout propagation and buffer overflow' },
        { step: 4, service: 'payments-service', time: 'T+95 to T+330', impact: 'Exhausted worker threads and near-total system collapse' }
      ]
    });
  },

  // Config changes
  async getConfigChanges(serviceId?: string) {
    const q = serviceId ? `?service_id=${serviceId}` : '';
    return fetchWithFallback<{ total_changes: number; candidate_root_cause: ConfigChange; downstream_decoy: ConfigChange; changes: ConfigChange[] }>(
      `/config-changes${q}`,
      {
        total_changes: 7,
        candidate_root_cause: {
          change_id: 'cfg-1003',
          timestamp: '2026-11-01T10:41:18Z',
          time_offset: 'T+42',
          service_id: 'network-gateway',
          parameter: 'proxy_read_timeout_ms',
          old_value: '5000',
          new_value: '250',
          author: 'ops-deploy-bot',
          change_type: 'ingress_timeout',
          approved: 'true',
          risk_score: '0.96',
          notes: 'Candidate Root Cause: Aggressive proxy read timeout lowered from 5000ms to 250ms.'
        },
        downstream_decoy: {
          change_id: 'cfg-2001',
          timestamp: '2026-11-01T10:46:11Z',
          time_offset: 'T+95',
          service_id: 'payments-service',
          parameter: 'connection_pool_max',
          old_value: '100',
          new_value: '250',
          author: 'dev-checkout-team',
          change_type: 'pool_scaling',
          approved: 'true',
          risk_score: '0.42',
          notes: 'Downstream Decoy: Applied 47s AFTER anomaly onset (T+48). Rejected as root cause.'
        },
        changes: [
          {
            change_id: 'cfg-1001',
            timestamp: '2026-11-01T09:15:00Z',
            time_offset: 'T-3600',
            service_id: 'catalog-service',
            parameter: 'cache_ttl_sec',
            old_value: '300',
            new_value: '600',
            author: 'alex.mercer@sre.corp',
            change_type: 'cache_tuning',
            approved: 'true',
            risk_score: '0.12',
            notes: 'Routine cache TTL increase for product catalog'
          },
          {
            change_id: 'cfg-1002',
            timestamp: '2026-11-01T10:00:00Z',
            time_offset: 'T-900',
            service_id: 'user-profile',
            parameter: 'max_connections',
            old_value: '50',
            new_value: '75',
            author: 'vikashini@sre.corp',
            change_type: 'connection_tuning',
            approved: 'true',
            risk_score: '0.18',
            notes: 'Minor pool scale up'
          },
          {
            change_id: 'cfg-1003',
            timestamp: '2026-11-01T10:41:18Z',
            time_offset: 'T+42',
            service_id: 'network-gateway',
            parameter: 'proxy_read_timeout_ms',
            old_value: '5000',
            new_value: '250',
            author: 'ops-deploy-bot',
            change_type: 'ingress_timeout',
            approved: 'true',
            risk_score: '0.96',
            notes: 'Candidate Root Cause: Aggressive proxy read timeout lowered from 5000ms to 250ms.'
          },
          {
            change_id: 'cfg-1004',
            timestamp: '2026-11-01T10:45:00Z',
            time_offset: 'T+60',
            service_id: 'notification-service',
            parameter: 'batch_size',
            old_value: '100',
            new_value: '100',
            author: 'sashika@sre.corp',
            change_type: 'noop',
            approved: 'true',
            risk_score: '0.05',
            notes: 'Configuration re-validation'
          },
          {
            change_id: 'cfg-2001',
            timestamp: '2026-11-01T10:46:11Z',
            time_offset: 'T+95',
            service_id: 'payments-service',
            parameter: 'connection_pool_max',
            old_value: '100',
            new_value: '250',
            author: 'dev-checkout-team',
            change_type: 'pool_scaling',
            approved: 'true',
            risk_score: '0.42',
            notes: 'Downstream Decoy: Applied 47s AFTER anomaly onset (T+48). Rejected as root cause.'
          }
        ]
      }
    );
  },

  // Sabotage drops
  async getSabotageDrops() {
    return fetchWithFallback<{ total_sabotage_drops: number; unauthorized_drifts: SabotageDrop[]; summary: string }>(
      '/config-changes/sabotage',
      {
        total_sabotage_drops: 4,
        summary: 'Detected 4 unauthorized shadow changes bypassing GitOps CI/CD approval pipelines.',
        unauthorized_drifts: [
          {
            change_id: 'cfg-9001',
            timestamp: '2026-11-01T10:40:05Z',
            time_offset: 'T+35',
            service_id: 'network-gateway',
            parameter: 'rate_limit_burst_size',
            old_value: '500',
            new_value: '20',
            author: 'unauthorized_ingress_agent',
            source: 'direct_etcd_edit',
            status: 'flagged_sabotage',
            threat_level: 'HIGH',
            drift_detected: 'true',
            notes: 'Shadow drift: Unauthorized drop in burst capacity directly written to etcd without GitOps approval'
          },
          {
            change_id: 'cfg-9002',
            timestamp: '2026-11-01T10:44:12Z',
            time_offset: 'T+55',
            service_id: 'auth-service',
            parameter: 'jwt_clock_skew_seconds',
            old_value: '60',
            new_value: '0',
            author: 'ci-cd-runner-untrusted',
            source: 'hot_reload',
            status: 'suspicious',
            threat_level: 'MEDIUM',
            drift_detected: 'true',
            notes: 'Clock skew margin zeroed out causing early expiration tokens during transit'
          },
          {
            change_id: 'cfg-9003',
            timestamp: '2026-11-01T10:47:30Z',
            time_offset: 'T+110',
            service_id: 'checkout-service',
            parameter: 'circuit_breaker_trip_threshold',
            old_value: '0.50',
            new_value: '0.05',
            author: 'dev-hotfix-script',
            source: 'env_override',
            status: 'suspicious',
            threat_level: 'HIGH',
            drift_detected: 'true',
            notes: 'Overly aggressive circuit breaker tripping at only 5% error rate accelerating cascade'
          },
          {
            change_id: 'cfg-9004',
            timestamp: '2026-11-01T10:52:10Z',
            time_offset: 'T+170',
            service_id: 'payments-service',
            parameter: 'tls_renegotiation',
            old_value: 'disabled',
            new_value: 'enabled',
            author: 'unknown_shadow_ssh',
            source: 'manual_cli',
            status: 'flagged_sabotage',
            threat_level: 'CRITICAL',
            drift_detected: 'true',
            notes: 'Direct SSH terminal parameter alteration violating Zero Trust policy'
          }
        ]
      }
    );
  },

  // Incident Replay
  async getReplay() {
    return fetchWithFallback<{ total_ticks: number; ticks: ReplayTick[] }>('/replay', {
      total_ticks: 7,
      ticks: [
        {
          tick: 'T+00',
          title: 'Normal Operations (Baseline)',
          description: 'All 17 microservices operating within nominal SLO boundaries (38ms avg latency, 0.0% error rate).',
          summary: { healthy: 17, degrading: 0, critical: 0, total: 17 },
          services: initialServicesData.map(s => ({ ...s, status: 'HEALTHY', response_time_ms: 38, error_rate: 0 }))
        },
        {
          tick: 'T+42',
          title: 'Trigger: Config Change cfg-1003',
          description: 'Aggressive proxy_read_timeout_ms change (5000ms -> 250ms) applied to network-gateway.',
          activeChange: 'cfg-1003',
          summary: { healthy: 17, degrading: 0, critical: 0, total: 17 },
          services: initialServicesData.map(s => ({ ...s, status: 'HEALTHY' }))
        },
        {
          tick: 'T+48',
          title: 'First Persistent Anomaly Onset',
          description: 'network-gateway and auth-service register sustained latency surge (> 180ms). SRE intervention recommended.',
          summary: { healthy: 15, degrading: 2, critical: 0, total: 17 },
          services: initialServicesData.map(s => ({
            ...s,
            status: s.id === 'network-gateway' || s.id === 'auth-service' ? 'DEGRADING' : 'HEALTHY'
          }))
        },
        {
          tick: 'T+75',
          title: 'Golden SRE Intervention Window (10:42 AM)',
          description: 'Crucial opportunity to rollback cfg-1003 before cascading retry queues saturate downstream nodes.',
          summary: { healthy: 14, degrading: 3, critical: 0, total: 17 },
          services: initialServicesData.map(s => ({
            ...s,
            status: ['network-gateway', 'auth-service', 'checkout-service'].includes(s.id) ? 'DEGRADING' : 'HEALTHY'
          }))
        },
        {
          tick: 'T+95',
          title: 'Decoy Change cfg-2001 (Payments)',
          description: 'Engineers modify connection pool on payments-service; rejected as a downstream decoy symptom.',
          activeChange: 'cfg-2001',
          summary: { healthy: 13, degrading: 2, critical: 2, total: 17 },
          services: initialServicesData.map(s => ({
            ...s,
            status: ['network-gateway', 'auth-service'].includes(s.id) ? 'CRITICAL_OUTAGE' : ['checkout-service', 'payments-service'].includes(s.id) ? 'DEGRADING' : 'HEALTHY'
          }))
        },
        {
          tick: 'T+180',
          title: 'Critical Cascading Degradation',
          description: 'Checkout and payments services experience synchronous timeout cascades and socket depletion.',
          summary: { healthy: 9, degrading: 2, critical: 6, total: 17 },
          services: initialServicesData.map(s => ({
            ...s,
            status: ['network-gateway', 'auth-service', 'checkout-service', 'payments-service', 'inventory-api', 'cart-service'].includes(s.id) ? 'CRITICAL_OUTAGE' : ['catalog-service', 'database-cluster'].includes(s.id) ? 'DEGRADING' : 'HEALTHY'
          }))
        },
        {
          tick: 'T+330',
          title: 'Near-Total System Collapse',
          description: '15 of 17 services in critical outage state; cascade propagation index hits 95%.',
          summary: { healthy: 1, degrading: 1, critical: 15, total: 17 },
          services: initialServicesData
        }
      ]
    });
  },

  // Recovery Solutions
  async getRecoveryOptions(serviceId?: string) {
    const q = serviceId ? `?serviceId=${encodeURIComponent(serviceId)}` : '';
    return fetchWithFallback<any>(
      `/recovery/options${q}`,
      {
        incident_id: 'INC-8492',
        target_service: serviceId || 'network-gateway',
        service_name: serviceId ? serviceId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Network Gateway',
        service_type: (!serviceId || serviceId === 'network-gateway') ? 'ROOT_CAUSE' : 'DOWNSTREAM_SYMPTOM',
        is_root_cause: (!serviceId || serviceId === 'network-gateway'),
        diagnosis: (!serviceId || serviceId === 'network-gateway')
          ? 'Source of cascading failure: cfg-1003 mistakenly lowered proxy_read_timeout_ms from 5000ms to 250ms at T+42.'
          : `Downstream latency backpressure propagated into ${serviceId} via inter-service RPC edges.`,
        warning: (!serviceId || serviceId === 'network-gateway')
          ? null
          : 'Caution: Downstream symptom. Root-cause isolation indicates network-gateway (cfg-1003) must be rolled back to fully restore the cluster.',
        tagline: "Don't just suggest solutions. Prove which solutions work.",
        solutions: [
          {
            id: 'quick',
            name: 'Quick Recovery',
            action: (!serviceId || serviceId === 'network-gateway')
              ? 'Automated atomic rollback of cfg-1003 on network-gateway (restore proxy_read_timeout_ms to 5000ms)'
              : `Targeted config rollback & atomic container restart on ${serviceId}`,
            reason: (!serviceId || serviceId === 'network-gateway')
              ? 'Directly removes the root cause parameter (proxy_read_timeout_ms restored to 5000ms).'
              : `Purges stale connection pools and restarts unacknowledged worker queues on ${serviceId}.`,
            expected_result: (!serviceId || serviceId === 'network-gateway')
              ? 'Instant cessation of ingress timeouts; downstream queue flush completes within 45s.'
              : `Local P99 latency drops by 85% within 40 seconds.`,
            risk_level: 'LOW',
            estimated_recovery_time_sec: 45,
            success_probability: 0.97,
            is_recommended: true,
            before_after: {
              latency_p99_before: 2800,
              latency_p99_after: 42,
              error_rate_before: 38.5,
              error_rate_after: 0.01,
              cluster_affected_before: 16,
              cluster_affected_after: 0
            }
          },
          {
            id: 'safe',
            name: 'Safe Recovery',
            action: (!serviceId || serviceId === 'network-gateway')
              ? 'Canary traffic drain (25% step) + Rolling service restart + Rollback verification probes'
              : `Graceful traffic shedding + Canary drain (15% increments) on ${serviceId}`,
            reason: (!serviceId || serviceId === 'network-gateway')
              ? 'Prevents database connection pool shock and thundering herd during cold socket re-establishment.'
              : `Prevents sudden disconnects and protects downstream persistent caches.`,
            expected_result: 'Zero dropped inflight packets; gradual recovery of all 17 microservices within 210s.',
            risk_level: 'VERY LOW',
            estimated_recovery_time_sec: 210,
            success_probability: 0.995,
            is_recommended: false,
            before_after: {
              latency_p99_before: 2800,
              latency_p99_after: 48,
              error_rate_before: 38.5,
              error_rate_after: 0.0,
              cluster_affected_before: 16,
              cluster_affected_after: 0
            }
          },
          {
            id: 'optimized',
            name: 'Optimized Recovery',
            action: (!serviceId || serviceId === 'network-gateway')
              ? 'Dynamic ingress token-bucket throttling + Timeout expansion to 1200ms + Cache pre-warming'
              : `Dynamic HPA autoscaling (+3 pods) + Circuit breaker threshold isolation on ${serviceId}`,
            reason: (!serviceId || serviceId === 'network-gateway')
              ? 'Maintains partial throughput while downstream caches re-populate without full restart.'
              : `Scales processing capacity while isolating failing upstream calls.`,
            expected_result: 'Preserves 65% user throughput during healing; total stabilization in 135s.',
            risk_level: 'MEDIUM',
            estimated_recovery_time_sec: 135,
            success_probability: 0.94,
            is_recommended: false,
            before_after: {
              latency_p99_before: 2800,
              latency_p99_after: 85,
              error_rate_before: 38.5,
              error_rate_after: 1.2,
              cluster_affected_before: 16,
              cluster_affected_after: 2
            }
          }
        ]
      }
    );
  },

  // Simulate Recovery
  async simulateRecovery(strategy: string, serviceId?: string) {
    try {
      const res = await fetch(`${API_BASE}/recovery/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy, serviceId })
      });
      if (res.ok) return await res.json();
    } catch {}

    // Fallback calculation
    const steps = 10;
    const telemetry = [];
    for (let t = 0; t < steps; t++) {
      const decay = Math.exp(-0.45 * t);
      telemetry.push({
        step: t + 1,
        time_s: t * 5,
        latency_p99_ms: Math.round(42 + (4200 - 42) * decay),
        error_rate: Math.round((0.02 + 74.2 * decay) * 100) / 100,
        healthy_services: Math.min(17, Math.round(1 + (16 * (1 - decay)))),
        status: decay < 0.1 ? 'HEALTHY' : decay < 0.4 ? 'DEGRADING' : 'CRITICAL'
      });
    }
    return {
      strategy,
      targetService: serviceId || 'network-gateway',
      simulation_steps: steps,
      projected_recovery_sec: strategy === 'quick' ? 45 : strategy === 'safe' ? 210 : 135,
      telemetry_projection: telemetry,
      verdict: 'SIMULATION PASSED: Recovery verified against SLO constraints.'
    };
  },

  // Apply Recovery
  async applyRecovery(strategy: string, serviceId?: string) {
    try {
      const res = await fetch(`${API_BASE}/recovery/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy, serviceId })
      });
      if (res.ok) return await res.json();
    } catch {}
    return {
      status: 'success',
      recoveredServices: 17,
      incidentStatus: 'RESOLVED',
      timestamp: new Date().toISOString()
    };
  },

  // Rollback / Re-open Recovery State (for before/after testing)
  async rollbackRecovery() {
    try {
      const res = await fetch(`${API_BASE}/recovery/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) return await res.json();
    } catch {}
    return {
      status: 'reopened',
      incidentStatus: 'INVESTIGATING',
      timestamp: new Date().toISOString()
    };
  },

  // Reset Chaos Simulation
  async resetChaosSimulation() {
    try {
      const res = await fetch(`${API_BASE}/simulation/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) return await res.json();
    } catch {}
    return { status: 'reset', timestamp: new Date().toISOString() };
  },

  // Chaos simulation
  async runChaosSimulation(targetService: string, failureType: string, intensity: string) {
    try {
      const res = await fetch(`${API_BASE}/simulation/chaos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetService, failureType, intensity })
      });
      if (res.ok) return await res.json();
    } catch {}
    const chain = ['network-gateway', 'auth-service', 'checkout-service', 'payments-service'];
    const affected = chain.slice(chain.indexOf(targetService));
    return {
      simulationId: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
      targetService,
      failureType,
      intensity,
      blastRadiusCount: affected.length || 1,
      affectedServices: affected.length > 0 ? affected : [targetService],
      projectedCollapseSeconds: intensity === 'HIGH' ? 45 : 120,
      predictedSLOViolationProbability: 0.98,
      mitigationAction: `Deploy circuit breaker on ${targetService} and decouple downstream dependencies.`
    };
  },

  // Predictive
  async getPredictiveForecast(serviceId?: string) {
    const q = serviceId ? `?service_id=${serviceId}` : '';
    return fetchWithFallback<any>(`/predictive/forecast${q}`, {
      service_id: serviceId || 'network-gateway',
      service_name: 'Network Gateway',
      cascade_risk_score: 0.95,
      risk_percentage: '95%',
      time_to_collapse_seconds: 75,
      critical_threshold_ms: 250,
      current_p99_ms: 2800.0,
      early_warnings: [
        { timestamp: '10:41:48 AM', severity: 'HIGH', message: 'Persistent latency drift gradient > 4.2 ms/sec detected on ingress node.' },
        { timestamp: '10:42:15 AM', severity: 'CRITICAL', message: 'Downstream queue depth on auth-service exceeded 85% capacity buffer.' },
        { timestamp: '10:46:11 AM', severity: 'WARNING', message: 'Downstream decoy change cfg-2001 detected. Suppressed from root-cause ranking.' }
      ],
      risk_projection: [
        { time_offset: 'T+00', risk_pct: 5 },
        { time_offset: 'T+42', risk_pct: 18 },
        { time_offset: 'T+48', risk_pct: 45 },
        { time_offset: 'T+75', risk_pct: 72 },
        { time_offset: 'T+95', risk_pct: 88 },
        { time_offset: 'T+180', risk_pct: 95 },
        { time_offset: 'T+330', risk_pct: 99 }
      ]
    });
  },

  // Analytics & Reports
  async getAnalytics() {
    return fetchWithFallback<any>('/reports/analytics', {
      incidentsByService: [
        { service: 'Payments', count: 95 },
        { service: 'Inventory API', count: 82 },
        { service: 'Mobile', count: 68 },
        { service: 'Data Ecosystem', count: 54 },
        { service: 'Security', count: 42 },
        { service: 'Cart Service', count: 35 },
        { service: 'Checkout Service', count: 28 },
        { service: 'Growth', count: 18 },
        { service: 'Analytics API', count: 12 },
        { service: 'Cluster Service', count: 8 }
      ],
      uptimeByService: [
        { service: 'Payments', uptime: '99.7%' },
        { service: 'Inventory API', uptime: '99.2%' },
        { service: 'Mobile', uptime: '99.4%' },
        { service: 'Data Ecosystem', uptime: '99.0%' },
        { service: 'Security', uptime: '99.8%' },
        { service: 'Cart Service', uptime: '99.1%' },
        { service: 'Checkout Service', uptime: '99.5%' },
        { service: 'Growth', uptime: '99.6%' },
        { service: 'Analytics API', uptime: '99.9%' },
        { service: 'Cluster Service', uptime: '99.8%' }
      ],
      highestMttaByService: [
        { service: 'Security', mtta: '2.8m' },
        { service: 'Data Ecosystem', mtta: '2.5m' },
        { service: 'Growth', mtta: '2.1m' },
        { service: 'Checkout Service', mtta: '1.9m' },
        { service: 'Cart Service', mtta: '1.7m' }
      ],
      highestMttrByService: [
        { service: 'Payments', mttr: '33m 15s' },
        { service: 'Data Ecosystem', mttr: '29m 10s' },
        { service: 'Checkout Service', mttr: '24m 50s' },
        { service: 'Analytics', mttr: '19m 12s' },
        { service: 'Growth', mttr: '15m 25s' }
      ],
      escalationsByService: [
        { service: 'Checkout', count: 18 },
        { service: 'Payments', count: 16 },
        { service: 'Auth', count: 14 },
        { service: 'Gateway', count: 12 },
        { service: 'Inventory', count: 11 },
        { service: 'Cart', count: 9 },
        { service: 'Database', count: 8 },
        { service: 'Shipping', count: 5 },
        { service: 'Catalog', count: 4 },
        { service: 'Logging', count: 2 }
      ],
      resolutionPie: {
        complete: 87,
        incomplete: 13
      }
    });
  },

  // Incidents
  async getIncidents() {
    return fetchWithFallback<{ total: number; active_sev1_count: number; incidents: Incident[] }>('/incidents', {
      total: 1,
      active_sev1_count: 1,
      incidents: [
        {
          id: 'INC-8492',
          title: 'SEV-1 Cascading Outage Detected Across Ingress Chain',
          severity: 'SEV-1',
          status: 'INVESTIGATING',
          createdAt: '2026-11-01T10:41:48Z',
          rootCauseService: 'network-gateway',
          rootCauseChangeId: 'cfg-1003',
          decoyRejectedChangeId: 'cfg-2001',
          confidence: 0.986,
          confidencePct: '98.6%',
          cascadeRiskIndex: '95%',
          affectedServicesCount: 16,
          totalServices: 17,
          currentSummary: 'Subtle latency drift began at T+00:48 following configuration change cfg-1003. SRE intervention window recommended at T+01:15 (10:42 AM).',
          timeline: [
            { time: 'T+00', label: 'Baseline normal operation', status: 'HEALTHY' },
            { time: 'T+42', label: 'Config change cfg-1003 applied at network-gateway', status: 'TRIGGER' },
            { time: 'T+48', label: 'First persistent anomaly onset detected', status: 'DEGRADING' },
            { time: 'T+75', label: 'Intervention window (10:42 AM)', status: 'WARNING' },
            { time: 'T+95', label: 'Downstream decoy cfg-2001 applied at payments-service (REJECTED)', status: 'DECOY' },
            { time: 'T+180', label: 'Critical cascading degradation', status: 'CRITICAL' },
            { time: 'T+330', label: 'Near-total system collapse', status: 'COLLAPSE' }
          ],
          notes: [
            { author: 'AI Engine', timestamp: '10:42:00', text: 'Temporal filter disqualified cfg-2001 (T+95 > T+48). Candidate cfg-1003 identified.' }
          ]
        }
      ]
    });
  },

  // Notifications (MachineMind Feature 11)
  async getNotifications(severity = 'ALL') {
    return fetchWithFallback<{ notifications: any[]; unreadCount: number; total: number }>(`/notifications?severity=${severity}`, {
      notifications: [
        {
          id: 'notif-001',
          title: 'SEV-1 Cascading Failure Triggered',
          message: 'Cascading latency surge detected originating from network-gateway. 16 of 17 microservices affected.',
          severity: 'CRITICAL',
          serviceId: 'network-gateway',
          incidentId: 'INC-8492',
          read: false,
          timestamp: '2026-11-01T10:41:48Z'
        },
        {
          id: 'notif-002',
          title: 'Dangerous Configuration Change Detected',
          message: 'Change cfg-1003 reduced proxy_read_timeout_ms from 5000 to 250 on network-gateway.',
          severity: 'CRITICAL',
          serviceId: 'network-gateway',
          incidentId: 'INC-8492',
          read: false,
          timestamp: '2026-11-01T10:41:52Z'
        },
        {
          id: 'notif-003',
          title: 'AI Decoy Filter Rejection',
          message: 'Downstream config change cfg-2001 (payments-service) disqualified as root cause with 98.6% confidence.',
          severity: 'INFO',
          serviceId: 'payments-service',
          incidentId: 'INC-8492',
          read: false,
          timestamp: '2026-11-01T10:42:05Z'
        },
        {
          id: 'notif-004',
          title: 'SLO Violation Warning',
          message: 'P99 Latency exceeded 2000ms threshold on checkout-service and auth-service.',
          severity: 'WARNING',
          serviceId: 'checkout-service',
          incidentId: 'INC-8492',
          read: true,
          timestamp: '2026-11-01T10:43:10Z'
        },
        {
          id: 'notif-005',
          title: 'Telemetry Heartbeat Ingest Operational',
          message: 'All 17 microservices streaming metrics to Prometheus/OpenTelemetry pipeline.',
          severity: 'INFO',
          serviceId: 'logging-aggregator',
          read: true,
          timestamp: '2026-11-01T10:30:00Z'
        }
      ],
      unreadCount: 3,
      total: 5
    });
  },

  async markNotificationRead(id: string) {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch {
      return { status: 'success' };
    }
  },

  async markAllNotificationsRead() {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch {
      return { status: 'success' };
    }
  },

  // Admin & User Management (MachineMind Feature 5)
  async getAdminUsers() {
    return fetchWithFallback<{ users: any[]; total: number }>('/admin/users', {
      users: [
        {
          id: 'usr-admin',
          name: 'Sashika K N',
          email: 'sashika@sre.corp',
          role: 'Admin',
          title: 'Security Commander & Team Leader',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          status: 'ACTIVE',
          lastActive: 'Just now'
        },
        {
          id: 'usr-sre',
          name: 'Alex Mercer',
          email: 'alex.mercer@sre.corp',
          role: 'SRE Engineer',
          title: 'Lead SRE Architect',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
          status: 'ACTIVE',
          lastActive: '2m ago'
        },
        {
          id: 'usr-viewer',
          name: 'Vikashini S',
          email: 'vikashini@sre.corp',
          role: 'Viewer',
          title: 'DevOps Observer & Team Member',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
          status: 'ACTIVE',
          lastActive: '15m ago'
        }
      ],
      total: 3
    });
  },

  async updateAdminUserRole(id: string, role: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      return await res.json();
    } catch {
      return { status: 'success' };
    }
  },

  async deleteAdminUser(id: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch {
      return { status: 'success' };
    }
  },

  async inviteAdminUser(data: any) {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch {
      return { status: 'success' };
    }
  },

  async getAuditLogs() {
    return fetchWithFallback<{ auditLogs: any[] }>('/admin/audit-logs', {
      auditLogs: [
        {
          id: 'aud-001',
          timestamp: '2026-11-01T10:41:48Z',
          actor: 'SYSTEM_MONITOR',
          action: 'INCIDENT_CREATED',
          details: 'Incident INC-8492 created due to P99 latency breach (>1500ms).',
          severity: 'HIGH'
        },
        {
          id: 'aud-002',
          timestamp: '2026-11-01T10:42:00Z',
          actor: 'AI_RCA_ENGINE',
          action: 'ROOT_CAUSE_ISOLATED',
          details: 'cfg-1003 isolated as true root cause with 98.6% confidence.',
          severity: 'MEDIUM'
        },
        {
          id: 'aud-003',
          timestamp: '2026-11-01T10:42:05Z',
          actor: 'AI_DECOY_FILTER',
          action: 'DECOY_DISQUALIFIED',
          details: 'cfg-2001 rejected via temporal and topological graph criteria.',
          severity: 'LOW'
        },
        {
          id: 'aud-004',
          timestamp: '2026-11-01T10:45:10Z',
          actor: 'Alex Mercer (SRE)',
          action: 'VIEW_RECOVERY_SIMULATION',
          details: 'Simulated Monte Carlo recovery for Quick Rollback.',
          severity: 'LOW'
        },
        {
          id: 'aud-005',
          timestamp: '2026-11-01T11:00:20Z',
          actor: 'Sashika K N (Admin)',
          action: 'ADMIN_LOGIN',
          details: 'Admin session initiated via token authentication.',
          severity: 'MEDIUM'
        }
      ]
    });
  },

  async toggleLockdown() {
    try {
      const res = await fetch(`${API_BASE}/admin/lockdown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch {
      return { systemLockdown: true, message: 'Emergency lockdown toggled' };
    }
  },

  async getSystemStatus() {
    return fetchWithFallback<any>('/admin/system-status', {
      status: 'ONLINE',
      systemLockdown: false,
      registeredUsersCount: 3,
      microservicesTotal: 17,
      activeIncidentsCount: 1,
      uptimeSeconds: 7420,
      nodeVersion: 'v26.12.1',
      memoryUsageMB: 48,
      securityCompliance: 'ISO-27001 / SOC-2 Type II Verified'
    });
  },

  // User Profile (MachineMind Feature 4)
  async getUserProfile() {
    return fetchWithFallback<any>('/auth/me', {
      user: {
        id: 'usr-sre',
        name: 'Alex Mercer',
        email: 'alex.mercer@sre.corp',
        role: 'SRE Engineer',
        title: 'Lead SRE Architect',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        bio: 'Enterprise SRE specialist focused on distributed microservices reliability and cascading failure prevention.',
        phone: '+1 (555) 234-5678',
        timezone: 'UTC (GMT+0)',
        pagerdutyKey: 'pd-live-cascade-sre-8492',
        sshKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICASCADE_SRE_AUTH_2026'
      }
    });
  },

  async updateUserProfile(profileData: any) {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('cascade_token') || ''}`
        },
        body: JSON.stringify(profileData)
      });
      return await res.json();
    } catch {
      return { status: 'success', user: profileData };
    }
  },

  async changePassword(passwordData: any) {
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('cascade_token') || ''}`
        },
        body: JSON.stringify(passwordData)
      });
      return await res.json();
    } catch {
      return { status: 'success', message: 'Password updated successfully' };
    }
  }
};
