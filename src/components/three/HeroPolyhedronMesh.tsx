import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { useThemeColors } from "./useThemeColors";

const MAX_PULSES = 36;
const PULSE_DURATION = 0.62;
const EDGE_HIGHLIGHT_DURATION = 0.72;

// Pre-allocated scratch helpers to guarantee zero GC allocations in useFrame
const _vA = new THREE.Vector3();
const _vB = new THREE.Vector3();
const _pos = new THREE.Vector3();
const _scale = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _mat4 = new THREE.Matrix4();
const _cBase = new THREE.Color();
const _cHot = new THREE.Color();
const _cGlow = new THREE.Color();
const _cWork = new THREE.Color();

interface GraphEdge {
  u: number;
  v: number;
}

interface IcosahedronGraph {
  vertices: THREE.Vector3[];
  edges: GraphEdge[];
  adjacency: number[][]; // edge indices incident to vertex i
}

interface PulseSlot {
  active: boolean;
  edgeIdx: number;
  fromVertex: number;
  toVertex: number;
  age: number;
  hop: number; // 0 = initial wave, 1 = secondary ripple
}

/** Detect software WebGL (SwiftShader / llvmpipe / WARP) so we tune pixel ratio & AA cleanly. */
function detectSoftwareGl(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? "");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

/** Build exact 12-vertex, 30-edge regular icosahedron combinatorial graph. */
function buildIcosahedronGraph(radius = 1.52): IcosahedronGraph {
  const phi = (1 + Math.sqrt(5)) / 2;
  const raw: [number, number, number][] = [
    [-1, phi, 0],
    [1, phi, 0],
    [-1, -phi, 0],
    [1, -phi, 0],
    [0, -1, phi],
    [0, 1, phi],
    [0, -1, -phi],
    [0, 1, -phi],
    [phi, 0, -1],
    [phi, 0, 1],
    [-phi, 0, -1],
    [-phi, 0, 1],
  ];

  const vertices = raw.map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize().multiplyScalar(radius));

  // Edge length for unit-sphere icosahedron is 2 / sqrt(1 + phi^2) ≈ 1.05146 * radius
  const edgeThreshold = (2 / Math.sqrt(1 + phi * phi)) * radius * 1.08;
  const edges: GraphEdge[] = [];
  const adjacency: number[][] = Array.from({ length: vertices.length }, () => []);

  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      if (vertices[i].distanceTo(vertices[j]) <= edgeThreshold) {
        const edgeIdx = edges.length;
        edges.push({ u: i, v: j });
        adjacency[i].push(edgeIdx);
        adjacency[j].push(edgeIdx);
      }
    }
  }

  return { vertices, edges, adjacency };
}

/** Generate a crisp radial soft-glow sprite texture procedurally (zero external assets). */
function createGlowSpriteTexture(): THREE.CanvasTexture {
  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const cx = size / 2;
    const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
    grad.addColorStop(0, "rgba(254, 243, 199, 1)");
    grad.addColorStop(0.24, "rgba(245, 158, 11, 0.9)");
    grad.addColorStop(0.55, "rgba(245, 158, 11, 0.28)");
    grad.addColorStop(1, "rgba(245, 158, 11, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Studio PMREM environment so brushed Liquid Gold vertices catch realistic specular highlights. */
function StudioEnv() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();
    return () => {
      scene.environment = null;
      envTex.dispose();
    };
  }, [gl, scene]);
  return null;
}

interface MeshProps {
  edgeColorHex: string;
  vertexColorHex: string;
  pointerRef: React.MutableRefObject<{ x: number; y: number; inside: boolean }>;
  reducedMotion: boolean;
  onPulseEvent?: (vertexIdx: number, kind: "hover" | "click") => void;
}

function InteractiveIcosahedron({
  edgeColorHex,
  vertexColorHex,
  pointerRef,
  reducedMotion,
  onPulseEvent,
}: MeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseInstancedRef = useRef<THREE.InstancedMesh>(null);
  const vertexMeshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const vertexGlowRefs = useRef<(THREE.Sprite | null)[]>([]);
  const hoveredVertexRef = useRef<number | null>(null);
  const lastHoverTriggerRef = useRef<number>(0);

  const graph = useMemo(() => buildIcosahedronGraph(1.52), []);
  const glowTex = useMemo(() => createGlowSpriteTexture(), []);

  // Pre-allocated mutable state for 60fps edge pulse energy + vertex excitation
  const edgeEnergyRef = useRef<Float32Array>(new Float32Array(graph.edges.length));
  const vertexEnergyRef = useRef<Float32Array>(new Float32Array(graph.vertices.length));
  const pulsePoolRef = useRef<PulseSlot[]>(
    Array.from({ length: MAX_PULSES }, () => ({
      active: false,
      edgeIdx: 0,
      fromVertex: 0,
      toVertex: 0,
      age: 0,
      hop: 0,
    }))
  );

  // Build LineSegments geometry with per-vertex colors for dynamic Electric Violet -> Liquid Gold edge glow
  const edgeGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(graph.edges.length * 2 * 3);
    const colors = new Float32Array(graph.edges.length * 2 * 3);
    const baseCol = new THREE.Color(edgeColorHex);

    graph.edges.forEach((edge, i) => {
      const a = graph.vertices[edge.u];
      const b = graph.vertices[edge.v];
      const offset = i * 6;
      positions[offset] = a.x;
      positions[offset + 1] = a.y;
      positions[offset + 2] = a.z;
      positions[offset + 3] = b.x;
      positions[offset + 4] = b.y;
      positions[offset + 5] = b.z;

      colors[offset] = baseCol.r;
      colors[offset + 1] = baseCol.g;
      colors[offset + 2] = baseCol.b;
      colors[offset + 3] = baseCol.r;
      colors[offset + 4] = baseCol.g;
      colors[offset + 5] = baseCol.b;
    });

    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geom;
  }, [graph, edgeColorHex]);

  // Subtle inner dual lattice edges for 3D depth parallax
  const innerGeometry = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(0.84, 0);
    const edgesGeo = new THREE.EdgesGeometry(ico);
    ico.dispose();
    return edgesGeo;
  }, []);

  const coreGeometry = useMemo(() => new THREE.IcosahedronGeometry(1.48, 0), []);
  const vertexGeometry = useMemo(() => new THREE.SphereGeometry(0.085, 18, 18), []);
  const pulseGeometry = useMemo(() => new THREE.SphereGeometry(0.052, 12, 12), []);

  useEffect(() => {
    return () => {
      edgeGeometry.dispose();
      innerGeometry.dispose();
      coreGeometry.dispose();
      vertexGeometry.dispose();
      pulseGeometry.dispose();
      glowTex.dispose();
    };
  }, [edgeGeometry, innerGeometry, coreGeometry, vertexGeometry, pulseGeometry, glowTex]);

  /** Spawn glowing Liquid Gold energy pulses along all connected edges of vertexIdx. */
  const emitFromVertex = (vertexIdx: number, hop: number, kind: "hover" | "click" = "hover") => {
    vertexEnergyRef.current[vertexIdx] = Math.min(1.5, vertexEnergyRef.current[vertexIdx] + 1.15);
    const incidentEdges = graph.adjacency[vertexIdx];
    const pool = pulsePoolRef.current;

    for (let k = 0; k < incidentEdges.length; k++) {
      const edgeIdx = incidentEdges[k];
      const edge = graph.edges[edgeIdx];
      const toVertex = edge.u === vertexIdx ? edge.v : edge.u;
      edgeEnergyRef.current[edgeIdx] = Math.min(1.4, edgeEnergyRef.current[edgeIdx] + 1.0);

      // Find free slot or recycle oldest
      let slot = pool.find((p) => !p.active);
      if (!slot) {
        slot = pool.reduce((oldest, cur) => (cur.age > oldest.age ? cur : oldest), pool[0]);
      }
      slot.active = true;
      slot.edgeIdx = edgeIdx;
      slot.fromVertex = vertexIdx;
      slot.toVertex = toVertex;
      slot.age = 0;
      slot.hop = hop;
    }

    if (hop === 0) {
      onPulseEvent?.(vertexIdx, kind);
    }
  };

  // Gentle ambient pulse every 3.4s when idle so the graph feels subtly alive
  const ambientTimerRef = useRef(0);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const group = groupRef.current;
    if (!group) return;

    // 1. Smooth cursor-tracking tilt + calm ambient drift
    if (!reducedMotion) {
      const targetRotX = pointerRef.current.y * 0.62 + Math.sin(state.clock.elapsedTime * 0.45) * 0.08;
      const targetRotY = state.clock.elapsedTime * 0.22 + pointerRef.current.x * 0.85;
      group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetRotX, 5.5, dt);
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetRotY, 5.5, dt);
      group.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.055;

      ambientTimerRef.current += dt;
      if (ambientTimerRef.current > 3.6 && !pointerRef.current.inside) {
        ambientTimerRef.current = 0;
        const randVertex = Math.floor(Math.random() * graph.vertices.length);
        emitFromVertex(randVertex, 1, "hover");
      }
    }

    // 2. Advance traveling edge pulses & update InstancedMesh transforms
    const pool = pulsePoolRef.current;
    const instanced = pulseInstancedRef.current;
    const edgeEnergy = edgeEnergyRef.current;
    const vertexEnergy = vertexEnergyRef.current;

    for (let i = 0; i < edgeEnergy.length; i++) {
      edgeEnergy[i] = Math.max(0, edgeEnergy[i] - dt / EDGE_HIGHLIGHT_DURATION);
    }
    for (let i = 0; i < vertexEnergy.length; i++) {
      vertexEnergy[i] = Math.max(0, vertexEnergy[i] - dt * 1.9);
    }

    for (let i = 0; i < pool.length; i++) {
      const slot = pool[i];
      if (!slot.active) {
        if (instanced) {
          _scale.set(0, 0, 0);
          _pos.set(0, 0, 0);
          _mat4.compose(_pos, _quat, _scale);
          instanced.setMatrixAt(i, _mat4);
        }
        continue;
      }

      slot.age += dt;
      const progress = slot.age / PULSE_DURATION;
      if (progress >= 1) {
        slot.active = false;
        vertexEnergy[slot.toVertex] = Math.min(1.3, vertexEnergy[slot.toVertex] + 0.85);
        // Secondary 2-hop cascade when triggered by a click (hop === 0)
        if (slot.hop === 0) {
          const nextEdges = graph.adjacency[slot.toVertex];
          for (let k = 0; k < nextEdges.length; k++) {
            const nextEdgeIdx = nextEdges[k];
            if (nextEdgeIdx === slot.edgeIdx) continue;
            edgeEnergy[nextEdgeIdx] = Math.min(1.0, edgeEnergy[nextEdgeIdx] + 0.6);
          }
        }
        if (instanced) {
          _scale.set(0, 0, 0);
          _mat4.compose(_pos, _quat, _scale);
          instanced.setMatrixAt(i, _mat4);
        }
        continue;
      }

      // Smooth cubic ease-out along edge
      const eased = 1 - Math.pow(1 - progress, 2.2);
      _vA.copy(graph.vertices[slot.fromVertex]);
      _vB.copy(graph.vertices[slot.toVertex]);
      _pos.lerpVectors(_vA, _vB, eased);
      const envelope = Math.sin(progress * Math.PI);
      const s = 0.6 + envelope * 0.95;
      _scale.set(s, s, s);
      _mat4.compose(_pos, _quat, _scale);
      if (instanced) {
        instanced.setMatrixAt(i, _mat4);
      }
      edgeEnergy[slot.edgeIdx] = Math.max(edgeEnergy[slot.edgeIdx], envelope * 0.95);
    }

    if (instanced) {
      instanced.instanceMatrix.needsUpdate = true;
    }

    // 3. Update per-edge colors smoothly from Electric Violet -> glowing Liquid Gold
    const colorAttr = edgeGeometry.getAttribute("color") as THREE.BufferAttribute;
    const colorArr = colorAttr.array as Float32Array;
    _cBase.set(edgeColorHex);
    _cHot.set(vertexColorHex);
    _cGlow.set("#FEF3C7");

    for (let i = 0; i < graph.edges.length; i++) {
      const edge = graph.edges[i];
      const eVal = Math.min(1, edgeEnergy[i]);
      const uBoost = Math.min(1, vertexEnergy[edge.u] * 0.75);
      const vBoost = Math.min(1, vertexEnergy[edge.v] * 0.75);

      const tU = Math.min(1, Math.max(eVal, uBoost));
      const tV = Math.min(1, Math.max(eVal, vBoost));

      _cWork.copy(_cBase).lerp(_cHot, tU);
      if (tU > 0.7) _cWork.lerp(_cGlow, (tU - 0.7) * 1.1);
      const offset = i * 6;
      colorArr[offset] = _cWork.r;
      colorArr[offset + 1] = _cWork.g;
      colorArr[offset + 2] = _cWork.b;

      _cWork.copy(_cBase).lerp(_cHot, tV);
      if (tV > 0.7) _cWork.lerp(_cGlow, (tV - 0.7) * 1.1);
      colorArr[offset + 3] = _cWork.r;
      colorArr[offset + 4] = _cWork.g;
      colorArr[offset + 5] = _cWork.b;
    }
    colorAttr.needsUpdate = true;

    // 4. Animate vertex scale + radial glow halo intensity
    const elapsed = state.clock.elapsedTime;
    for (let i = 0; i < graph.vertices.length; i++) {
      const mesh = vertexMeshRefs.current[i];
      const sprite = vertexGlowRefs.current[i];
      const energy = vertexEnergy[i];
      const isHovered = hoveredVertexRef.current === i;
      const idleBreath = reducedMotion ? 0 : Math.sin(elapsed * 2.1 + i * 0.75) * 0.06;

      if (mesh) {
        const s = 1 + idleBreath + energy * 0.45 + (isHovered ? 0.35 : 0);
        mesh.scale.setScalar(s);
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.85 + energy * 1.7 + (isHovered ? 0.9 : 0);
      }
      if (sprite) {
        const gs = 0.42 + idleBreath * 0.8 + energy * 0.42 + (isHovered ? 0.25 : 0);
        sprite.scale.set(gs, gs, 1);
        sprite.material.opacity = Math.min(1, 0.55 + energy * 0.45 + (isHovered ? 0.25 : 0));
      }
    }
  });

  const handleVertexPointerOver = (idx: number, e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hoveredVertexRef.current = idx;
    document.body.style.cursor = "pointer";
    const now = performance.now();
    if (now - lastHoverTriggerRef.current > 110) {
      lastHoverTriggerRef.current = now;
      emitFromVertex(idx, 1, "hover");
    }
  };

  const handleVertexPointerOut = () => {
    hoveredVertexRef.current = null;
    document.body.style.cursor = "auto";
  };

  const handleVertexClick = (idx: number, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    emitFromVertex(idx, 0, "click");
  };

  const handleCoreClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // Pick nearest vertex to click intersection point
    const localPoint = groupRef.current ? groupRef.current.worldToLocal(e.point.clone()) : e.point;
    let nearestIdx = 0;
    let minDist = Infinity;
    graph.vertices.forEach((v, idx) => {
      const d = v.distanceToSquared(localPoint);
      if (d < minDist) {
        minDist = d;
        nearestIdx = idx;
      }
    });
    emitFromVertex(nearestIdx, 0, "click");
  };

  const handleCoreHover = (e: ThreeEvent<PointerEvent>) => {
    const now = performance.now();
    if (now - lastHoverTriggerRef.current < 380) return;
    lastHoverTriggerRef.current = now;
    const localPoint = groupRef.current ? groupRef.current.worldToLocal(e.point.clone()) : e.point;
    let nearestIdx = 0;
    let minDist = Infinity;
    graph.vertices.forEach((v, idx) => {
      const d = v.distanceToSquared(localPoint);
      if (d < minDist) {
        minDist = d;
        nearestIdx = idx;
      }
    });
    emitFromVertex(nearestIdx, 1, "hover");
  };

  return (
    <group ref={groupRef}>
      {/* Subtle obsidian translucent core for spatial occlusion & click/hover target */}
      <mesh
        geometry={coreGeometry}
        onClick={handleCoreClick}
        onPointerOver={handleCoreHover}
      >
        <meshPhysicalMaterial
          color="#0F0F1C"
          roughness={0.28}
          metalness={0.35}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>

      {/* Subtle nested dual-scale inner wireframe */}
      <lineSegments geometry={innerGeometry}>
        <lineBasicMaterial color={edgeColorHex} transparent opacity={0.24} />
      </lineSegments>

      {/* Primary Electric Violet wireframe icosahedron edges with live Liquid Gold pulse lighting */}
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial vertexColors transparent opacity={0.94} />
      </lineSegments>

      {/* Pooled traveling Liquid Gold pulse beads along connected edges */}
      <instancedMesh
        ref={pulseInstancedRef}
        args={[pulseGeometry, undefined, MAX_PULSES]}
        frustumCulled={false}
      >
        <meshBasicMaterial
          color="#FDE68A"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>

      {/* 12 Glowing Liquid Gold vertices (each with specular metallic core + additive glow halo) */}
      {graph.vertices.map((pos, idx) => (
        <group key={idx} position={[pos.x, pos.y, pos.z]}>
          <mesh
            ref={(el) => {
              vertexMeshRefs.current[idx] = el;
            }}
            geometry={vertexGeometry}
            onPointerOver={(e) => handleVertexPointerOver(idx, e)}
            onPointerOut={handleVertexPointerOut}
            onClick={(e) => handleVertexClick(idx, e)}
          >
            <meshStandardMaterial
              color={vertexColorHex}
              emissive={vertexColorHex}
              emissiveIntensity={0.9}
              metalness={0.85}
              roughness={0.18}
            />
          </mesh>
          <sprite
            ref={(el) => {
              vertexGlowRefs.current[idx] = el;
            }}
            scale={[0.45, 0.45, 1]}
          >
            <spriteMaterial
              map={glowTex}
              color="#FDE68A"
              transparent
              opacity={0.62}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>
        </group>
      ))}
    </group>
  );
}

/** Graceful SVG fallback if WebGL context is unavailable. */
function FallbackPolyhedronSVG() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
      <g stroke="#7C3AED" strokeWidth="1.5" fill="none" opacity="0.85">
        <polygon points="100,20 170,62 170,138 100,180 30,138 30,62" />
        <polygon points="100,20 144,82 56,82" />
        <polygon points="100,180 144,118 56,118" />
        <line x1="170" y1="62" x2="144" y2="82" />
        <line x1="30" y1="62" x2="56" y2="82" />
        <line x1="170" y1="138" x2="144" y2="118" />
        <line x1="30" y1="138" x2="56" y2="118" />
        <line x1="56" y1="82" x2="56" y2="118" />
        <line x1="144" y1="82" x2="144" y2="118" />
      </g>
      {[
        [100, 20],
        [170, 62],
        [170, 138],
        [100, 180],
        [30, 138],
        [30, 62],
        [144, 82],
        [56, 82],
        [144, 118],
        [56, 118],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4.5" fill="#F59E0B" />
      ))}
    </svg>
  );
}

export default function HeroPolyhedronMesh() {
  const colors = useThemeColors();
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, inside: false });
  const [contextLost, setContextLost] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const isSoftwareGl = useMemo(() => detectSoftwareGl(), []);

  // Track cursor smoothly across the hero window so the polyhedron subtly leans toward pointer
  useEffect(() => {
    if (reducedMotion) return;
    const onGlobalMove = (e: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = THREE.MathUtils.clamp((e.clientX - cx) / Math.max(rect.width * 1.4, 240), -1, 1);
      const dy = THREE.MathUtils.clamp((e.clientY - cy) / Math.max(rect.height * 1.4, 240), -1, 1);
      pointerRef.current.x = dx;
      pointerRef.current.y = dy;
    };
    window.addEventListener("pointermove", onGlobalMove, { passive: true });
    return () => window.removeEventListener("pointermove", onGlobalMove);
  }, [reducedMotion]);

  // Preserve Electric Violet (#7C3AED) & Liquid Gold (#F59E0B) by default, adapting if user switches accent swatch
  const edgeColor = colors.purple || "#7C3AED";
  const vertexColor = colors.gold || "#F59E0B";

  return (
    <div
      ref={containerRef}
      onPointerEnter={() => {
        pointerRef.current.inside = true;
      }}
      onPointerLeave={() => {
        pointerRef.current.inside = false;
      }}
      className="relative w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] xl:w-[244px] xl:h-[244px] shrink-0 select-none group"
      aria-label="Interactive 3D icosahedron graph mesh — hover or click vertices to propagate edge pulses"
      role="img"
    >
      {/* Subtle Obsidian + Electric Violet ambient radial glow behind the 3D polyhedron */}
      <div
        className="absolute inset-3 rounded-full pointer-events-none transition-opacity duration-500 opacity-75 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle, rgba(124, 58, 237, 0.22) 0%, rgba(245, 158, 11, 0.07) 48%, transparent 72%)",
        }}
      />

      {contextLost ? (
        <FallbackPolyhedronSVG />
      ) : (
        <Canvas
          dpr={isSoftwareGl ? 1 : [1, 2]}
          gl={{
            alpha: true,
            antialias: !isSoftwareGl,
            powerPreference: "high-performance",
          }}
          camera={{ position: [0, 0, 4.35], fov: 42 }}
          style={{ width: "100%", height: "100%" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.15;
            gl.domElement.addEventListener(
              "webglcontextlost",
              (ev) => {
                ev.preventDefault();
                setContextLost(true);
              },
              false
            );
            gl.domElement.addEventListener(
              "webglcontextrestored",
              () => setContextLost(false),
              false
            );
          }}
        >
          <StudioEnv />
          <ambientLight intensity={0.45} />
          <directionalLight position={[4, 5, 6]} intensity={1.4} color="#FDE68A" />
          <directionalLight position={[-4, -3, -4]} intensity={0.9} color="#A78BFA" />
          <pointLight position={[0, 0, 2.8]} intensity={1.2} color="#F59E0B" distance={8} />

          <InteractiveIcosahedron
            edgeColorHex={edgeColor}
            vertexColorHex={vertexColor}
            pointerRef={pointerRef}
            reducedMotion={reducedMotion}
            onPulseEvent={(_vIdx, kind) => {
              if (kind === "click") setPulseCount((c) => c + 1);
            }}
          />
        </Canvas>
      )}

      {/* Quiet typographic micro-caption underneath the 3D mesh */}
      <div className="pointer-events-none absolute -bottom-1 inset-x-0 flex items-center justify-center gap-1.5 text-[10px] font-mono text-charcoal-light/70">
        <span>I₁₂ Graph</span>
        <span aria-hidden="true">·</span>
        <span>{pulseCount > 0 ? `Wave #${pulseCount}` : "Hover or Click"}</span>
      </div>
    </div>
  );
}
