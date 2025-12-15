"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type SimEntity = {
  id: string;
  position?: { x?: number; y?: number; z?: number } | [number, number, number];
  rotation?: { x?: number; y?: number; z?: number } | [number, number, number];
};

type SimState = {
  entities?: Record<string, SimEntity>;
};

interface SimulationCanvasProps {
  simState?: SimState | null;
  maxInstances?: number;
  cubeSize?: number;
}

/* ---------------- Scene Content (Instanced Cubes) ---------------- */

function SceneContent({
  simState,
  maxInstances,
  cubeSize,
}: {
  simState?: SimState | null;
  maxInstances: number;
  cubeSize: number;
}) {
  const ids = useMemo(() => {
    if (!simState?.entities) return [];
    return Object.keys(simState.entities);
  }, [simState]);

  const count = Math.min(ids.length, maxInstances);

  const idToIndex = useMemo(() => {
    const m = new Map<string, number>();
    for (let i = 0; i < count; i++) m.set(ids[i], i);
    return m;
  }, [ids, count]);

  const instRef = useRef<THREE.InstancedMesh>(null);

  const obj = useMemo(() => new THREE.Object3D(), []);
  const euler = useMemo(() => new THREE.Euler(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);

  useEffect(() => {
    if (!instRef.current) return;
    for (let i = 0; i < count; i++) {
      obj.position.set(0, 0, 0);
      obj.rotation.set(0, 0, 0);
      obj.scale.set(1, 1, 1);
      obj.updateMatrix();
      instRef.current.setMatrixAt(i, obj.matrix);
    }
    instRef.current.instanceMatrix.needsUpdate = true;
  }, [count, obj]);

  useFrame(() => {
    if (!instRef.current || !simState?.entities) return;

    let dirty = false;

    for (const [id, idx] of idToIndex.entries()) {
      const ent = simState.entities[id];
      if (!ent) continue;

      const p = ent.position as any;
      const r = ent.rotation as any;

      const px = Array.isArray(p) ? p[0] : p?.x ?? 0;
      const py = Array.isArray(p) ? p[1] : p?.y ?? 0;
      const pz = Array.isArray(p) ? p[2] : p?.z ?? 0;

      const rx = Array.isArray(r) ? r[0] : r?.x ?? 0;
      const ry = Array.isArray(r) ? r[1] : r?.y ?? 0;
      const rz = Array.isArray(r) ? r[2] : r?.z ?? 0;

      obj.position.set(px, py, pz);
      euler.set(rx, ry, rz);
      quat.setFromEuler(euler);
      obj.quaternion.copy(quat);
      obj.scale.set(cubeSize, cubeSize, cubeSize);
      obj.updateMatrix();

      instRef.current.setMatrixAt(idx, obj.matrix);
      dirty = true;
    }

    if (dirty) instRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={instRef}
      args={[undefined as any, undefined as any, count]}
      castShadow
      receiveShadow
    >
      <boxGeometry />
      <meshStandardMaterial
        color="#e5e7eb"
        roughness={0.35}
        metalness={0.15}
      />
    </instancedMesh>
  );
}

/* ---------------- Main Canvas ---------------- */

export default function SimulationCanvas({
  simState = null,
  maxInstances = 1000,
  cubeSize = 0.6,
}: SimulationCanvasProps) {
  const entityCount = simState?.entities
    ? Object.keys(simState.entities).length
    : 0;

  if (!simState || entityCount === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        No simulation entities to display
      </div>
    );
  }

  return (
  <div className="w-full h-full">
    <Canvas
      shadows
      camera={{ position: [3, 3, 3], fov: 45, near: 0.1, far: 50 }}
    >
      {/* 🌫 Scene depth */}
      <fog attach="fog" args={["#0b1220", 4, 18]} />

      {/* 💡 Lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[6, 8, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* 🟫 Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* 📐 Grid */}
      <gridHelper args={[20, 40, "#22d3ee", "#020617"]} />

      {/* 🧊 Debug cubes */}
      <SceneContent
        simState={simState}
        maxInstances={maxInstances}
        cubeSize={cubeSize}
      />

      {/* 🎥 Controls */}
      <OrbitControls enableDamping dampingFactor={0.12} />
    </Canvas>
  </div>
);
}