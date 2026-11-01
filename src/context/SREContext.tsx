import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServiceNode, ServiceStatus, Incident, DependencyEdge } from '../types';
import { apiClient, initialServicesData, initialDependencyEdges } from '../services/api';

interface SREContextType {
  services: ServiceNode[];
  dependencies: { nodes: ServiceNode[]; edges: DependencyEdge[] };
  activeFilter: 'ALL' | ServiceStatus;
  setActiveFilter: (filter: 'ALL' | ServiceStatus) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeIncident: Incident | null;
  cascadeRisk: number;
  livePolling: boolean;
  setLivePolling: (v: boolean) => void;
  refreshData: () => Promise<void>;
  applyRecoveryAction: (strategy: string, serviceId?: string) => Promise<void>;
  rollbackRecoveryAction: () => Promise<void>;
  injectChaosFailure: (serviceId: string, failureType: string, intensity: string) => Promise<any>;
  filteredServices: ServiceNode[];
  counts: {
    total: number;
    healthy: number;
    degrading: number;
    critical: number;
  };
}

const SREContext = createContext<SREContextType | undefined>(undefined);

export const SREProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<ServiceNode[]>(initialServicesData);
  const [dependencies, setDependencies] = useState<{ nodes: ServiceNode[]; edges: DependencyEdge[] }>({
    nodes: initialServicesData,
    edges: initialDependencyEdges
  });
  const [activeFilter, setActiveFilter] = useState<'ALL' | ServiceStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [cascadeRisk, setCascadeRisk] = useState<number>(95);
  const [livePolling, setLivePolling] = useState<boolean>(true);

  const refreshData = async () => {
    try {
      const sData = await apiClient.getServices();
      if (sData && sData.services) {
        setServices(sData.services);
      }
      const depData = await apiClient.getDependencies();
      if (depData && depData.edges) {
        setDependencies({ nodes: depData.nodes || initialServicesData, edges: depData.edges });
      }
      const incData = await apiClient.getIncidents();
      if (incData && incData.incidents && incData.incidents.length > 0) {
        setActiveIncident(incData.incidents[0]);
        if (incData.incidents[0].status === 'RESOLVED') {
          setCascadeRisk(5);
        } else {
          setCascadeRisk(95);
        }
      }
    } catch (err) {
      console.warn('Refresh error:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Live polling ticker
  useEffect(() => {
    if (!livePolling) return;
    const interval = setInterval(() => {
      // Subtle realistic metric jitter
      setServices(prev =>
        prev.map(s => {
          if (s.status === 'HEALTHY') {
            const deltaLat = (Math.random() - 0.5) * 2;
            return {
              ...s,
              response_time_ms: Math.max(15, Math.round((s.response_time_ms + deltaLat) * 10) / 10),
              request_count: Math.round(s.request_count + (Math.random() * 20 - 10))
            };
          }
          return s;
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [livePolling]);

  const applyRecoveryAction = async (strategy: string, serviceId?: string) => {
    await apiClient.applyRecovery(strategy, serviceId);
    // Instant UI state update
    setServices(prev =>
      prev.map(s => ({
        ...s,
        status: 'HEALTHY' as ServiceStatus,
        response_time_ms: Math.round(25 + Math.random() * 20),
        latency_p99_ms: Math.round(45 + Math.random() * 25),
        error_rate: 0.01,
        cpu_usage: Math.round(28 + Math.random() * 12)
      }))
    );
    setCascadeRisk(4);
    if (activeIncident) {
      setActiveIncident({
        ...activeIncident,
        status: 'RESOLVED',
        notes: [
          ...activeIncident.notes,
          {
            author: 'Incident Commander',
            timestamp: new Date().toLocaleTimeString(),
            text: `Applied ${strategy.toUpperCase()} recovery strategy on ${serviceId || 'network-gateway'}. Parameter cfg-1003 reverted. All 17 microservices verified healthy.`
          }
        ]
      });
    }
  };

  const rollbackRecoveryAction = async () => {
    await apiClient.rollbackRecovery();
    await refreshData();
  };

  const injectChaosFailure = async (serviceId: string, failureType: string, intensity: string) => {
    const res = await apiClient.runChaosSimulation(serviceId, failureType, intensity);
    // Cascade impact to target and downstream
    const chain = ['network-gateway', 'auth-service', 'checkout-service', 'payments-service'];
    let affected = [serviceId];
    if (chain.includes(serviceId)) {
      affected = chain.slice(chain.indexOf(serviceId));
    }

    setServices(prev =>
      prev.map(s => {
        if (affected.includes(s.id)) {
          return {
            ...s,
            status: intensity === 'HIGH' ? 'CRITICAL_OUTAGE' : 'DEGRADING',
            response_time_ms: s.response_time_ms * (intensity === 'HIGH' ? 8 : 3),
            error_rate: Math.min(85, s.error_rate + (intensity === 'HIGH' ? 45 : 15)),
            cpu_usage: Math.min(99, s.cpu_usage + 30)
          };
        }
        return s;
      })
    );
    setCascadeRisk(intensity === 'HIGH' ? 98 : 78);
    return res;
  };

  const filteredServices = services.filter(s => {
    const matchesFilter = activeFilter === 'ALL' || s.status === activeFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.technology.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    total: services.length,
    healthy: services.filter(s => s.status === 'HEALTHY').length,
    degrading: services.filter(s => s.status === 'DEGRADING').length,
    critical: services.filter(s => s.status === 'CRITICAL_OUTAGE').length
  };

  return (
    <SREContext.Provider
      value={{
        services,
        dependencies,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        activeIncident,
        cascadeRisk,
        livePolling,
        setLivePolling,
        refreshData,
        applyRecoveryAction,
        rollbackRecoveryAction,
        injectChaosFailure,
        filteredServices,
        counts
      }}
    >
      {children}
    </SREContext.Provider>
  );
};

export const useSRE = () => {
  const context = useContext(SREContext);
  if (!context) throw new Error('useSRE must be used within an SREProvider');
  return context;
};
