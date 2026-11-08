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
  | "chipGrid";

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

/** A compact set of connected nodes — chip-firing graphs, gRPC peers, carbon-event ledgers. */
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

/** Blocks lighting up in sequence — cache tiling, DCT blocks, compression. */
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

/** Two interlocked rings — peer exchange, matchmaking, two-sided systems. */
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

/** A vertical stack — stack machines, assembly, linked-list/editor backends. */
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

/** A faceted wireframe core — the VM, the binary bomb, raw low-level machinery. */
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

/** A flat plane with a sweeping scan-line — OCR, scanning, perspective correction. */
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

/** A small grid lighting up like circuit traces — the VM/interpreter, profiling. */
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

const SCENES: Record<ProjectSceneVariant, React.ComponentType<{ a: string; b: string }>> = {
  nodeGraph: NodeGraph,
  cubeGrid: CubeGrid,
  orbitRings: OrbitRings,
  stackBlocks: StackBlocks,
  wireframeCore: WireframeCore,
  documentScan: DocumentScan,
  chipGrid: ChipGrid
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
