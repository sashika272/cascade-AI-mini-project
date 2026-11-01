import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ServiceNode, DependencyEdge } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface DependencyGraph3DProps {
  services: ServiceNode[];
  edges: DependencyEdge[];
  onSelectService?: (service: ServiceNode) => void;
  selectedServiceId?: string | null;
  cameraView?: 'default' | 'ingress' | 'security' | 'database';
}

// Canonical 4-Tier Hierarchical Coordinates for all 17 Microservices
// Eliminates node & label overlap with ample horizontal and vertical clearance
export const SERVICE_3D_LAYOUT: Record<string, [number, number, number]> = {
  // Tier 1: Ingress & Observability (Top Level, Y = +3.6)
  'logging-aggregator': [-6.5, 3.6, 0.0],
  'network-gateway': [-0.5, 3.6, 0.0], // Primary Root Cause
  'search-index': [5.5, 3.6, 0.0],

  // Tier 2: Security, User Profile & Catalog (Upper Mid Level, Y = +1.2)
  'user-profile': [-7.0, 1.2, 0.0],
  'auth-service': [-2.0, 1.2, 0.0], // Hop 1 Ingress Cascade
  'catalog-service': [2.8, 1.2, 0.0],
  'recommendation-engine': [7.0, 1.2, 0.0],

  // Tier 3: Core Commerce & Business Services (Lower Mid Level, Y = -1.2)
  'cart-service': [-5.5, -1.2, 0.0],
  'checkout-service': [-1.0, -1.2, 0.0], // Hop 2 Ingress Cascade
  'inventory-api': [3.5, -1.2, 0.0],
  'order-fulfillment': [7.5, -1.2, 0.0],

  // Tier 4: Downstream Persistence, Payments & Messaging (Bottom Level, Y = -3.6)
  'analytics-pipeline': [-7.5, -3.6, 0.0],
  'cache-cluster': [-3.8, -3.6, 0.0], // Redis
  'payments-service': [0.2, -3.6, 0.0], // Financial Decoy (Rejected)
  'database-cluster': [4.0, -3.6, 0.0], // PostgreSQL HA
  'shipping-service': [7.0, -3.6, 0.8],
  'notification-service': [7.0, -3.6, -0.8],
};

// WebGL Error Boundary to prevent any blank-page crashes if WebGL is disabled or unsupported
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('[3D Digital Twin] WebGL caught by boundary, using fallback:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Camera Controller for View Presets
const CameraController: React.FC<{ cameraView?: 'default' | 'ingress' | 'security' | 'database' }> = ({
  cameraView
}) => {
  const { camera } = useThree();
  useEffect(() => {
    if (!camera) return;
    switch (cameraView) {
      case 'ingress':
        camera.position.set(-0.5, 3.2, 10);
        camera.lookAt(-0.5, 2.8, 0);
        break;
      case 'security':
        camera.position.set(-1.5, 0.5, 11);
        camera.lookAt(-1.5, 0, 0);
        break;
      case 'database':
        camera.position.set(3.5, -3.2, 10);
        camera.lookAt(3.5, -3.2, 0);
        break;
      case 'default':
      default:
        camera.position.set(0, 0, 16.5);
        camera.lookAt(0, 0, 0);
        break;
    }
  }, [cameraView, camera]);
  return null;
};

// 3D Directional Edge with Arrow Cone & Animated Data Packet Stream
const DirectionalEdge: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  isCriticalPath: boolean;
  isFailing: boolean;
  isLight: boolean;
}> = ({ start, end, isCriticalPath, isFailing, isLight }) => {
  const lineRef = useRef<THREE.LineSegments>(null);
  const particleRef = useRef<THREE.Mesh>(null);

  const points = useMemo(() => {
    return [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  }, [start, end]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  // Compute Arrow Cone position (near target sphere) and orientation pointing to target
  const { arrowPos, arrowQuat } = useMemo(() => {
    const vStart = new THREE.Vector3(...start);
    const vEnd = new THREE.Vector3(...end);
    const dir = new THREE.Vector3().subVectors(vEnd, vStart);
    const len = dir.length();
    dir.normalize();

    // Position arrow cone 0.72 units before reaching target node center (outside node sphere)
    const pos = new THREE.Vector3().copy(vStart).addScaledVector(dir, Math.max(0.5, len - 0.72));
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return { arrowPos: pos, arrowQuat: quat };
  }, [start, end]);

  useFrame(state => {
    if (particleRef.current) {
      const speed = isFailing ? 0.7 : 1.3;
      const t = (state.clock.getElapsedTime() * speed) % 1;
      particleRef.current.position.lerpVectors(
        new THREE.Vector3(...start),
        new THREE.Vector3(...end),
        t
      );
    }
  });

  const edgeColor = isFailing
    ? '#B91C1C'
    : isCriticalPath
    ? (isLight ? '#1D4ED8' : '#38BDF8')
    : (isLight ? '#64748B' : '#475569');

  const particleColor = isFailing
    ? '#DC2626'
    : isCriticalPath
    ? (isLight ? '#1D4ED8' : '#38BDF8')
    : (isLight ? '#2563EB' : '#94A3B8');

  return (
    <group>
      {/* Edge Line */}
      <lineSegments ref={lineRef} geometry={geometry}>
        <lineBasicMaterial
          color={edgeColor}
          transparent
          opacity={isFailing ? 0.85 : isCriticalPath ? 0.75 : isLight ? 0.45 : 0.35}
          linewidth={isCriticalPath ? 2 : 1}
        />
      </lineSegments>

      {/* 3D Directional Arrow Cone */}
      <mesh position={arrowPos} quaternion={arrowQuat}>
        <coneGeometry args={[0.13, 0.32, 10]} />
        <meshBasicMaterial color={edgeColor} />
      </mesh>

      {/* Moving Packet Particle */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={particleColor} />
      </mesh>
    </group>
  );
};

// 3D Service Node Sphere with High-Contrast Label & Selection Halo
const ServiceSphere: React.FC<{
  service: ServiceNode;
  position: [number, number, number];
  isSelected: boolean;
  isLight: boolean;
  onSelect: () => void;
}> = ({ service, position, isSelected, isLight, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const isRootCause = service.id === 'network-gateway';
  const isDecoy = service.id === 'payments-service';

  // Professional SRE Status Colors
  const sphereColor = isSelected
    ? '#1D4ED8'
    : isRootCause || service.status === 'CRITICAL_OUTAGE'
    ? '#B91C1C'
    : service.status === 'DEGRADING'
    ? '#C2410C'
    : '#047857';

  useFrame(state => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.getElapsedTime() * 1.5 + position[0]) * 0.06;

      if (service.status === 'CRITICAL_OUTAGE') {
        const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 3.5) * 0.06;
        meshRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[isSelected ? 0.62 : 0.48, 28, 28]} />
        <meshStandardMaterial
          color={sphereColor}
          emissive={sphereColor}
          emissiveIntensity={
            isSelected || hovered
              ? 0.75
              : service.status === 'CRITICAL_OUTAGE'
              ? 0.5
              : isLight
              ? 0.25
              : 0.35
          }
          roughness={isLight ? 0.25 : 0.3}
          metalness={0.2}
        />
      </mesh>

      {/* 3D Highlight Wireframe Halo when selected */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[0.82, 16, 16]} />
          <meshBasicMaterial
            wireframe
            color={isLight ? '#1D4ED8' : '#38BDF8'}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* High-Contrast, Structured Node Labels with Port & Latency */}
      <Html distanceFactor={14} position={[0, 0.74, 0]} center pointerEvents="none">
        <div className="select-none pointer-events-none whitespace-nowrap text-center">
          <div
            className={`inline-flex flex-col items-center px-2 py-0.5 rounded-md text-[10px] font-mono shadow-md border ${
              isSelected
                ? isLight
                  ? 'bg-blue-50 text-[#1D4ED8] border-2 border-blue-600 ring-2 ring-blue-300 font-extrabold'
                  : 'bg-blue-950 text-white border-2 border-blue-400 ring-2 ring-blue-400 font-extrabold'
                : isRootCause
                ? isLight
                  ? 'bg-red-50 text-[#991B1B] border-2 border-red-600 ring-1 ring-red-300 font-extrabold'
                  : 'bg-red-950 text-red-100 border-2 border-red-500 ring-1 ring-red-400 font-extrabold'
                : isDecoy
                ? isLight
                  ? 'bg-amber-50 text-[#92400E] border-2 border-amber-600 font-bold'
                  : 'bg-amber-950 text-amber-100 border-2 border-amber-500 font-bold'
                : service.status === 'CRITICAL_OUTAGE'
                ? isLight
                  ? 'bg-red-50 text-[#B91C1C] border border-red-300 font-bold'
                  : 'bg-red-900/90 text-white border border-red-500 font-bold'
                : service.status === 'DEGRADING'
                ? isLight
                  ? 'bg-amber-50 text-[#B45309] border border-amber-300 font-bold'
                  : 'bg-amber-900/90 text-white border border-amber-500 font-bold'
                : isLight
                ? 'bg-emerald-50 text-[#047857] border border-emerald-300 font-bold'
                : 'bg-emerald-900/90 text-white border border-emerald-500 font-bold'
            }`}
          >
            <div className="flex items-center gap-1">
              <span>{service.name}</span>
              {isRootCause && (
                <span className="px-1 py-0.2 rounded bg-red-600 text-white text-[8px] font-black uppercase">
                  ROOT
                </span>
              )}
              {isDecoy && (
                <span className="px-1 py-0.2 rounded bg-amber-600 text-white text-[8px] font-black uppercase">
                  DECOY
                </span>
              )}
            </div>
            <div className="text-[8px] opacity-75 font-mono">
              :{service.port} • {Math.round(service.latency_p99_ms)}ms
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

export const DependencyGraph3D: React.FC<DependencyGraph3DProps> = ({
  services = [],
  edges = [],
  onSelectService,
  selectedServiceId,
  cameraView = 'default'
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const safeServices = services || [];
  const safeEdges = edges || [];

  // Map 17 microservices to non-colliding 4-tier positions
  const servicePosMap = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    safeServices.forEach((s, idx) => {
      if (SERVICE_3D_LAYOUT[s.id]) {
        map.set(s.id, SERVICE_3D_LAYOUT[s.id]);
      } else if (s.position_3d) {
        map.set(s.id, s.position_3d);
      } else {
        const angle = (idx / (safeServices.length || 1)) * Math.PI * 2;
        const radius = 6;
        map.set(s.id, [Math.cos(angle) * radius, (idx % 3) * 1.5 - 1.5, Math.sin(angle) * radius]);
      }
    });
    return map;
  }, [safeServices]);

  // Fallback 2D grid component if WebGL context creation fails
  const fallback2D = (
    <div className={`h-full w-full p-6 overflow-y-auto ${isLight ? 'bg-[#F3F6FC] text-[#172554]' : 'bg-gray-950/90 text-gray-200'}`}>
      <div className="mb-3 text-xs text-amber-600 font-mono flex items-center gap-1.5">
        <span>⚠ WebGL acceleration unavailable. Rendering 2D Topological Fallback Mesh.</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {safeServices.map(s => (
          <div
            key={s.id}
            onClick={() => onSelectService && onSelectService(s)}
            className={`p-3 rounded-xl border cursor-pointer transition select-none ${
              s.id === selectedServiceId
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                : s.status === 'HEALTHY'
                ? 'border-emerald-200 bg-white hover:border-emerald-500'
                : s.status === 'DEGRADING'
                ? 'border-amber-200 bg-white hover:border-amber-500'
                : 'border-red-200 bg-red-50 hover:border-red-500'
            }`}
          >
            <div className="font-bold text-xs truncate">{s.name}</div>
            <div className="text-[10px] text-gray-500 font-mono mt-0.5">{s.tier} • {s.technology}</div>
            <div className="flex items-center justify-between text-[10px] font-mono mt-2 pt-1 border-t border-gray-200">
              <span className={s.latency_p99_ms > 1000 ? 'text-red-600 font-bold' : 'text-emerald-700'}>{s.latency_p99_ms}ms</span>
              <span className={s.error_rate > 5 ? 'text-red-600 font-bold' : 'text-emerald-700'}>{s.error_rate}% err</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={`relative w-full h-[560px] rounded-2xl border overflow-hidden shadow-2xl transition-colors duration-200 ${
        isLight
          ? 'bg-[#EAF2FF] border-[#DCE4F0]'
          : 'bg-gradient-to-b from-[#090D16] to-[#04060A] border-gray-800'
      }`}
    >
      <WebGLErrorBoundary fallback={fallback2D}>
        {/* 3D Canvas */}
        <Canvas
          camera={{ position: [0, 0, 16.5], fov: 48 }}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Explicit light-blue background in Light Mode, deep dark void in Dark Mode */}
          <color attach="background" args={[isLight ? '#EAF2FF' : '#070A0F']} />
          <CameraController cameraView={cameraView} />
          <ambientLight intensity={isLight ? 0.95 : 0.6} />
          <pointLight position={[10, 10, 10]} intensity={isLight ? 1.3 : 1.2} />
          <pointLight position={[-10, -10, -10]} intensity={isLight ? 0.7 : 0.5} />

          {/* Render 3D Directional Edges */}
          {safeEdges.map((e, idx) => {
            const start = servicePosMap.get(e.source);
            const end = servicePosMap.get(e.target);
            if (!start || !end) return null;

            const sourceNode = safeServices.find(s => s.id === e.source);
            const isFailing = sourceNode?.status === 'CRITICAL_OUTAGE';

            return (
              <DirectionalEdge
                key={`edge-${idx}`}
                start={start}
                end={end}
                isCriticalPath={!!e.is_case_study}
                isFailing={isFailing}
                isLight={isLight}
              />
            );
          })}

          {/* Render 3D Service Nodes */}
          {safeServices.map(s => {
            const pos = servicePosMap.get(s.id) || [0, 0, 0];
            return (
              <ServiceSphere
                key={s.id}
                service={s}
                position={pos}
                isSelected={s.id === selectedServiceId}
                isLight={isLight}
                onSelect={() => onSelectService && onSelectService(s)}
              />
            );
          })}

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            maxDistance={25}
            minDistance={5}
            maxPolarAngle={Math.PI / 1.7}
          />
        </Canvas>
      </WebGLErrorBoundary>

      {/* Non-obtrusive Top Indicator Pill */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <div
          className={`rounded-lg px-2.5 py-1 backdrop-blur-md border shadow-sm ${
            isLight
              ? 'bg-white/95 border-[#DCE4F0] text-[#172554]'
              : 'bg-gray-950/85 border-gray-800/80 text-gray-300'
          }`}
        >
          <span className="text-[11px] font-mono font-medium">
            4-Tier Digital Twin: 17 Microservices • 19 Directed Edges
          </span>
        </div>
      </div>

      {/* Non-obtrusive Bottom Controls Legend & Interaction Tip */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[10px] font-mono">
        <div
          className={`flex items-center gap-3 rounded-lg px-2.5 py-1 backdrop-blur-md border shadow-sm pointer-events-auto ${
            isLight
              ? 'bg-white/95 border-[#DCE4F0] text-[#172554]'
              : 'bg-gray-950/85 border-gray-800/80 text-gray-300'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#047857]" /> Healthy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#C2410C]" /> Degraded
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#B91C1C]" /> Critical Outage
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#1D4ED8]" /> Selected
          </span>
        </div>
        <div
          className={`rounded-lg px-2.5 py-1 backdrop-blur-md border shadow-sm ${
            isLight
              ? 'bg-white/95 border-[#DCE4F0] text-[#64748B]'
              : 'bg-gray-950/85 border-gray-800/80 text-gray-400'
          }`}
        >
          Drag to Rotate • Scroll to Zoom • Click Node to Inspect
        </div>
      </div>
    </div>
  );
};
