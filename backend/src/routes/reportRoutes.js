import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/reports/analytics
router.get('/analytics', (req, res) => {
  // Data matching Slide 13 of PPT
  const incidentsByService = [
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
  ];

  const uptimeByService = [
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
  ];

  const highestMttaByService = [
    { service: 'Security', mtta: '2.8m' },
    { service: 'Data Ecosystem', mtta: '2.5m' },
    { service: 'Growth', mtta: '2.1m' },
    { service: 'Checkout Service', mtta: '1.9m' },
    { service: 'Cart Service', mtta: '1.7m' }
  ];

  const highestMttrByService = [
    { service: 'Payments', mttr: '33m 15s' },
    { service: 'Data Ecosystem', mttr: '29m 10s' },
    { service: 'Checkout Service', mttr: '24m 50s' },
    { service: 'Analytics', mttr: '19m 12s' },
    { service: 'Growth', mttr: '15m 25s' }
  ];

  const escalationsByService = [
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
  ];

  const resolutionPie = {
    complete: 87,
    incomplete: 13
  };

  res.json({
    incidentsByService,
    uptimeByService,
    highestMttaByService,
    highestMttrByService,
    escalationsByService,
    resolutionPie
  });
});

// GET /api/reports/export/csv
router.get('/export/csv', (req, res) => {
  let csv = 'Timestamp,Service,CPU_Usage,Memory_Usage,Response_Time_MS,Latency_P99_MS,Request_Count,Error_Rate,Status\n';
  store.metricsStream.forEach(m => {
    csv += `${m.timestamp},${m.service_id},${m.cpu_usage},${m.memory_usage},${m.response_time_ms},${m.latency_p99_ms},${m.request_count},${m.error_rate},${m.status}\n`;
  });

  res.header('Content-Type', 'text/csv');
  res.attachment('cascade_ai_metrics_export.csv');
  return res.send(csv);
});

export default router;
