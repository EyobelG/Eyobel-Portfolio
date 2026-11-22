import React, { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useThemeColors } from "./useThemeColors";

/** True once the element has scrolled near the viewport; false again once it's far off-screen. Caps concurrent WebGL contexts (browsers allow only a handful) to roughly however many badges are actually on screen. */
function useNearViewport<T extends HTMLElement>(margin = "200px") {
  const ref = useRef<T>(null!);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: margin });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, near };
}

export type ProjectSceneVariant =
  | "nodeGraph"
  | "cubeGrid"
  | "orbitRings"
  | "stackBlocks"
  | "wireframeCore"
  | "documentScan"
  | "chipGrid"
  | "citationBeacon"
  | "toolRing"
  | "gaugeDial"
  | "signalShield";

const REDUCED_MOTION = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Spinner({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!ref.current || REDUCED_MOTION) return;
    ref.current.rotation.y += delta * 0.5;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.25;
  });
  return <group ref={ref}>{children}</group>;
}

/** A compact set of connected nodes: chip-firing graphs, gRPC peers, carbon-event ledgers. */
function NodeGraph({ a, b }: { a: string; b: string }) {
  const nodes = useMemo(
    () => [
      new THREE.Vector3(0, 0.55, 0),
      new THREE.Vector3(-0.55, -0.3, 0.2),
      new THREE.Vector3(0.55, -0.3, -0.2),
      new THREE.Vector3(0, 0, -0.5)
    ],
    []
  );
  const edges: [number, number][] = [[0, 1], [0, 2], [1, 2], [2, 3], [3, 0]];
  return (
    <Spinner>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshBasicMaterial color={i % 2 === 0 ? a : b} />
        </mesh>
      ))}
      {edges.map(([i, j], k) => (
        <Line key={k} points={[nodes[i], nodes[j]]} color={b} transparent opacity={0.5} />
      ))}
    </Spinner>
  );
}

/** Blocks lighting up in sequence: cache tiling, DCT blocks, compression. */
function CubeGrid({ a, b }: { a: string; b: string }) {
  const cubes = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++) arr.push([x * 0.4, y * 0.4, 0]);
    return arr;
  }, []);
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current || REDUCED_MOTION) return;
    ref.current.children.forEach((child, i) => {
      const t = state.clock.elapsedTime * 1.4 + i * 0.6;
      (child as THREE.Mesh).scale.setScalar(0.55 + Math.sin(t) * 0.25);
    });
    ref.current.rotation.z = state.clock.elapsedTime * 0.1;
  });
  return (
    <group ref={ref}>
      {cubes.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial color={i % 3 === 0 ? b : a} wireframe={i % 2 === 0} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/** Two interlocked rings: peer exchange, matchmaking, two-sided systems. */
function OrbitRings({ a, b }: { a: string; b: string }) {
  return (
    <Spinner>
      <mesh rotation={[0.3, 0, 0]}>
        <torusGeometry args={[0.55, 0.04, 8, 48]} />
        <meshBasicMaterial color={a} />
      </mesh>
      <mesh rotation={[Math.PI / 2 + 0.3, 0.4, 0]}>
        <torusGeometry args={[0.4, 0.04, 8, 48]} />
        <meshBasicMaterial color={b} />
      </mesh>
    </Spinner>
  );
}

/** A vertical stack: stack machines, assembly, linked-list/editor backends. */
function StackBlocks({ a, b }: { a: string; b: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current || REDUCED_MOTION) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.5;
  });
  return (
    <group ref={ref}>
      {[-0.42, -0.14, 0.14, 0.42].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[0.65, 0.18, 0.4]} />
          <meshBasicMaterial color={i % 2 === 0 ? a : b} wireframe transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/** A faceted wireframe core: the VM, the binary bomb, raw low-level machinery. */
function WireframeCore({ a, b }: { a: string; b: string }) {
  return (
    <Spinner>
      <mesh>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshBasicMaterial color={a} wireframe />
      </mesh>
      <mesh scale={0.4}>
        <octahedronGeometry args={[0.6, 0]} />
        <meshBasicMaterial color={b} />
      </mesh>
    </Spinner>
  );
}

/** A flat plane with a sweeping scan-line: OCR, scanning, perspective correction. */
function DocumentScan({ a, b }: { a: string; b: string }) {
  const line = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!line.current || REDUCED_MOTION) return;
    line.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.45;
  });
  return (
    <group rotation={[0.15, 0.3, 0]}>
      <mesh>
        <planeGeometry args={[0.8, 1.05]} />
        <meshBasicMaterial color={a} wireframe transparent opacity={0.7} />
      </mesh>
      <mesh ref={line} position={[0, 0, 0.01]}>
        <planeGeometry args={[0.8, 0.06]} />
        <meshBasicMaterial color={b} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

/** A small grid lighting up like circuit traces: the VM/interpreter, profiling. */
function ChipGrid({ a, b }: { a: string; b: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current || REDUCED_MOTION) return;
    ref.current.rotation.x = 0.3;
    ref.current.rotation.y = state.clock.elapsedTime * 0.4;
  });
  const lines = useMemo(() => {
    const segs: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = -2; i <= 2; i++) {
      segs.push([new THREE.Vector3(i * 0.2, -0.5, 0), new THREE.Vector3(i * 0.2, 0.5, 0)]);
      segs.push([new THREE.Vector3(-0.5, i * 0.2, 0), new THREE.Vector3(0.5, i * 0.2, 0)]);
    }
    return segs;
  }, []);
  return (
    <group ref={ref}>
      {lines.map(([p1, p2], i) => (
        <Line key={i} points={[p1, p2]} color={i % 5 === 0 ? b : a} transparent opacity={0.6} />
      ))}
    </group>
  );
}

/** A pulse that expands and fades on loop, offset by phase so a group never breathes in sync. */
function Pulse({ position, color, offset = 0 }: { position: THREE.Vector3; color: string; offset?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((state) => {
    if (!ref.current || !mat.current || REDUCED_MOTION) return;
    const t = (Math.sin(state.clock.elapsedTime * 1.3 + offset) + 1) / 2;
    ref.current.scale.setScalar(0.7 + t * 0.5);
    mat.current.opacity = 0.35 + t * 0.55;
  });
  return (
    <mesh ref={ref} position={position}>
      <circleGeometry args={[0.07, 16]} />
      <meshBasicMaterial ref={mat} color={color} transparent opacity={0.6} />
    </mesh>
  );
}

/** A cited passage pinging outward: RAG - the one chunk that answered, picked out of the page. */
function CitationBeacon({ a, b }: { a: string; b: string }) {
  const ring = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((state) => {
    if (!ring.current || !mat.current || REDUCED_MOTION) return;
    const t = (state.clock.elapsedTime * 0.6) % 1;
    ring.current.scale.setScalar(1 + t * 5);
    mat.current.opacity = 0.65 * (1 - t);
  });
  return (
    <group rotation={[0.1, -0.3, 0]}>
      <mesh>
        <planeGeometry args={[0.7, 0.95]} />
        <meshBasicMaterial color={a} wireframe transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.08, 0.01]}>
        <planeGeometry args={[0.5, 0.13]} />
        <meshBasicMaterial color={b} transparent opacity={0.9} />
      </mesh>
      <mesh ref={ring} position={[0, 0.08, 0.02]}>
        <ringGeometry args={[0.07, 0.09, 28]} />
        <meshBasicMaterial ref={mat} color={b} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** A hub agent dispatching to orbiting tools: search, suggest, compare - each a distinct shape, not a recolor. */
function ToolRing({ a, b }: { a: string; b: string }) {
  const orbit = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!orbit.current || REDUCED_MOTION) return;
    orbit.current.rotation.z = state.clock.elapsedTime * 0.3;
  });
  const tools = useMemo(
    () =>
      [0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * 0.56, Math.sin(angle) * 0.56, 0);
      }),
    []
  );
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color={a} />
      </mesh>
      <group ref={orbit}>
        {tools.map((p, i) => (
          <group key={i}>
            <Line points={[new THREE.Vector3(0, 0, 0), p]} color={a} transparent opacity={0.4} />
            <mesh position={p}>
              {i === 0 ? (
                <boxGeometry args={[0.16, 0.16, 0.16]} />
              ) : i === 1 ? (
                <coneGeometry args={[0.11, 0.2, 4]} />
              ) : (
                <torusGeometry args={[0.09, 0.03, 8, 16]} />
              )}
              <meshBasicMaterial color={b} wireframe={i !== 2} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/** A needle sweeping a dial: TakeMeter scoring each post along a continuous scale, not a binary flag. */
function GaugeDial({ a, b }: { a: string; b: string }) {
  const needle = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!needle.current || REDUCED_MOTION) return;
    needle.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7) * 1.0;
  });
  const start = Math.PI * 0.15;
  const end = Math.PI * 0.85;
  const arcPoints = useMemo(() => {
    const segs = 28;
    return Array.from({ length: segs + 1 }, (_, i) => {
      const t = start + (end - start) * (i / segs);
      return new THREE.Vector3(Math.cos(t) * 0.62, Math.sin(t) * 0.62 - 0.1, 0);
    });
  }, []);
  const ticks = useMemo(
    () =>
      [0.18, 0.5, 0.82].map((frac) => {
        const t = start + (end - start) * frac;
        const inner = new THREE.Vector3(Math.cos(t) * 0.48, Math.sin(t) * 0.48 - 0.1, 0);
        const outer = new THREE.Vector3(Math.cos(t) * 0.62, Math.sin(t) * 0.62 - 0.1, 0);
        return [inner, outer] as [THREE.Vector3, THREE.Vector3];
      }),
    []
  );
  return (
    <group>
      <Line points={arcPoints} color={a} transparent opacity={0.65} />
      {ticks.map(([i1, i2], idx) => (
        <Line key={idx} points={[i1, i2]} color={a} transparent opacity={0.4} />
      ))}
      <group ref={needle} position={[0, -0.1, 0]}>
        <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.56, 0)]} color={b} />
        <mesh>
          <circleGeometry args={[0.05, 16]} />
          <meshBasicMaterial color={b} />
        </mesh>
      </group>
    </group>
  );
}

/** A shield with independent signals pulsing out of phase: Provenance Guard's disagreement reads as a verdict, not noise. */
function SignalShield({ a, b }: { a: string; b: string }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current || REDUCED_MOTION) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
  });
  const shieldPoints = useMemo(
    () => [
      new THREE.Vector3(0, 0.6, 0),
      new THREE.Vector3(0.5, 0.4, 0),
      new THREE.Vector3(0.5, -0.08, 0),
      new THREE.Vector3(0, -0.6, 0),
      new THREE.Vector3(-0.5, -0.08, 0),
      new THREE.Vector3(-0.5, 0.4, 0),
      new THREE.Vector3(0, 0.6, 0)
    ],
    []
  );
  const signals = useMemo(
    () =>
      [0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
        return new THREE.Vector3(Math.cos(angle) * 0.82, Math.sin(angle) * 0.82 * 0.9, 0);
      }),
    []
  );
  return (
    <group ref={group}>
      <Line points={shieldPoints} color={a} transparent opacity={0.75} />
      {signals.map((p, i) => (
        <Pulse key={i} position={p} color={b} offset={i * 0.9} />
      ))}
    </group>
  );
}

const SCENES: Record<ProjectSceneVariant, React.ComponentType<{ a: string; b: string }>> = {
  nodeGraph: NodeGraph,
  cubeGrid: CubeGrid,
  orbitRings: OrbitRings,
  stackBlocks: StackBlocks,
  wireframeCore: WireframeCore,
  documentScan: DocumentScan,
  chipGrid: ChipGrid,
  citationBeacon: CitationBeacon,
  toolRing: ToolRing,
  gaugeDial: GaugeDial,
  signalShield: SignalShield
};

/**
 * Small bespoke WebGL badge standing in for each project's old flat category icon.
 *
 * Browsers cap concurrent WebGL contexts (~8-16); a card grid of a dozen+ independent
 * <Canvas> elements all mounted at once blows past that and the oldest ones silently go
 * blank ("Context Lost"). So each badge only mounts its own <Canvas> while it's actually
 * near the viewport, capping the number of live contexts to roughly what's on screen.
 */
export default function ProjectScene3D({ variant, size = 56 }: { variant: ProjectSceneVariant; size?: number }) {
  const colors = useThemeColors();
  const Scene = SCENES[variant];
  const { ref, near } = useNearViewport<HTMLDivElement>();

  return (
    <div ref={ref} style={{ width: size, height: size }} aria-hidden="true">
      {near && (
        <Canvas dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }} camera={{ position: [0, 0, 2.1], fov: 40 }}>
          <ambientLight intensity={0.8} />
          <Scene a={colors.purpleLight} b={colors.gold} />
        </Canvas>
      )}
    </div>
  );
}
