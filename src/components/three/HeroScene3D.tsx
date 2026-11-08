import React, { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron, Torus, Octahedron, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useThemeColors } from "./useThemeColors";

const REDUCED_MOTION = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Cursor-reactive camera rig: drifts the whole scene toward the pointer, lattice-geometry identity. */
function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (REDUCED_MOTION) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (REDUCED_MOTION) return;
    group.current.rotation.y += delta * 0.08;
    const targetX = pointer.current.y * 0.25;
    const targetY = pointer.current.x * 0.35;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.04);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, pointer.current.x * 0.4, 0.04);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -pointer.current.y * 0.2, 0.04);
  });

  return <group ref={group}>{children}</group>;
}

function DriftingShape({
  position,
  speed,
  color,
  Shape,
  args
}: {
  position: [number, number, number];
  speed: number;
  color: string;
  Shape: typeof Icosahedron | typeof Torus | typeof Octahedron;
  args: any[];
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const seed = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!mesh.current || REDUCED_MOTION) return;
    const t = state.clock.elapsedTime * speed + seed;
    mesh.current.rotation.x = t * 0.6;
    mesh.current.rotation.y = t * 0.4;
    mesh.current.position.y = position[1] + Math.sin(t) * 0.25;
  });

  return (
    // @ts-ignore - drei primitive props spread
    <Shape ref={mesh} position={position} args={args}>
      <meshBasicMaterial color={color} wireframe transparent opacity={0.55} />
    </Shape>
  );
}

function ParticleField({ color }: { color: string }) {
  const positions = useMemo(() => {
    const count = 140;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (!ref.current || REDUCED_MOTION) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <Points ref={ref as any} positions={positions} stride={3}>
      <PointMaterial transparent color={color} size={0.035} sizeAttenuation depthWrite={false} opacity={0.6} />
    </Points>
  );
}

/** Full-bleed WebGL backdrop for the hero banner: wireframe lattice shapes + a drifting particle field, colored by the active accent and theme, parallaxing gently toward the cursor. */
export default function HeroScene3D() {
  const colors = useThemeColors();

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.6} />
      <Rig>
        <DriftingShape position={[2.6, 0.6, -1]} speed={0.35} color={colors.gold} Shape={Icosahedron} args={[0.6, 0]} />
        <DriftingShape position={[-2.8, -0.8, -1.5]} speed={0.25} color={colors.purpleLight} Shape={Octahedron} args={[0.5, 0]} />
        <DriftingShape position={[3.6, -1.1, -2]} speed={0.4} color={colors.purple} Shape={Torus} args={[0.35, 0.1, 8, 24]} />
        <DriftingShape position={[-1.6, 1.3, -2.5]} speed={0.3} color={colors.gold} Shape={Torus} args={[0.25, 0.07, 8, 24]} />
        <ParticleField color={colors.purpleLight} />
      </Rig>
    </Canvas>
  );
}
