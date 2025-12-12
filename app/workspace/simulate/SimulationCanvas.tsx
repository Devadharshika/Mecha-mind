"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type Vec3 = [number, number, number];

type SimEntity = {
  id: string;
  position?: { x?: number; y?: number; z?: number };
  rotation?: { x?: number; y?: number; z?: number };
};

type SimState = {
  entities?: Record<string, SimEntity>;
};

/**
 * Debug Simulation Canvas - Instanced approach
 *
 * - Uses InstancedMesh for performance (single draw call)
 * - Maps entity ids -> instance index once (stable)
 * - Updates instance matrices in useFrame (cheap, no React updates)
 */

interface SimulationCanvasProps {
  simState?: SimState | null;
  maxInstances?: number;
  cubeSize?: number;
}

function SceneContent({
  simState,
  maxInstances = 1000,
  cubeSize = 0.25,
}: {
  simState?: SimState | null;
  maxInstances: number;
  cubeSize: number;
}) {
  // stable list of entity IDs (memoized) — rebuild only when entity set changes
  const ids = useMemo(() => {
    if (!simState?.entities) return [] as string[];
    return Object.keys(simState.entities);
  }, [simState]);

  // If nothing or too many, fallback UI handled by parent
  const instanceCount = Math.min(ids.length, maxInstances);

  // Map id -> index
  const idToIndex = useMemo(() => {
    const m = new Map<string, number>();
    for (let i = 0; i < instanceCount; i++) {
      m.set(ids[i], i);
    }
    return m;
  }, [ids, instanceCount]);

  // refs
  const instRef = useRef<THREE.InstancedMesh | null>(null);

  // temp objects for matrix math
  const tmpObj = useMemo(() => new THREE.Object3D(), []);
  const tmpQuat = useMemo(() => new THREE.Quaternion(), []);
  const tmpEuler = useMemo(() => new THREE.Euler(), []);
  const tmpMat = useMemo(() => new THREE.Matrix4(), []);

  // Initialize instance matrices on mount (optional)
  useEffect(() => {
    const inst = instRef.current;
    if (!inst) return;
    for (let i = 0; i < instanceCount; i++) {
      tmpObj.position.set(0, 0, 0);
      tmpObj.rotation.set(0, 0, 0);
      tmpObj.scale.set(1, 1, 1);
      tmpObj.updateMatrix();
      inst.setMatrixAt(i, tmpObj.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  }, [instanceCount, tmpObj]);

  // Update transforms every frame from simState via RAF
  useFrame(() => {
    const inst = instRef.current;
    if (!inst || !simState?.entities) return;

    let dirty = false;
    for (const [id, idx] of idToIndex.entries()) {
      const ent = simState.entities[id];
      if (!ent) continue;

      const px = ent.position?.x ?? 0;
      const py = ent.position?.y ?? 0;
      const pz = ent.position?.z ?? 0;

      const rx = ent.rotation?.x ?? 0;
      const ry = ent.rotation?.y ?? 0;
      const rz = ent.rotation?.z ?? 0;

      // set transform
      tmpObj.position.set(px, py, pz);
      tmpEuler.set(rx, ry, rz, "XYZ");
      tmpQuat.setFromEuler(tmpEuler);
      tmpObj.quaternion.copy(tmpQuat);
      tmpObj.scale.set(cubeSize, cubeSize, cubeSize);
      tmpObj.updateMatrix();
      inst.setMatrixAt(idx, tmpObj.matrix);
      dirty = true;
    }

    if (dirty) {
      inst.instanceMatrix.needsUpdate = true;
    }
  });

  // Material + geometry reused
  return (
    <>
      <instancedMesh
        ref={instRef}
        args={[undefined as any, undefined as any, instanceCount]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
        <meshStandardMaterial
          transparent
          opacity={0.9}
          roughness={0.4}
          metalness={0.1}
        />
      </instancedMesh>
    </>
  );
}

export default function SimulationCanvas({
  simState = null,
  maxInstances = 1000,
  cubeSize = 0.25,
}: SimulationCanvasProps) {
  const entityCount = simState?.entities ? Object.keys(simState.entities).length : 0;

  // If no state -> placeholder
  if (!simState || entityCount === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        No simulation entities to display
      </div>
    );
  }

  // If too many, show message instead of attempting to render everything
  if (entityCount > maxInstances) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-300">
        Too many entities to render ({entityCount}). Increase maxInstances to view.
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [4, 4, 4], fov: 55 }} shadows>
        {/* Lights */}
        <ambientLight intensity={0.45} />
        <directionalLight castShadow position={[8, 10, 8]} intensity={0.9} />

        {/* Grid */}
        <gridHelper args={[20, 40, "#0ea5a4", "#0f172a"]} />

        {/* Scene content: instanced debug cubes */}
        <SceneContent simState={simState} maxInstances={maxInstances} cubeSize={cubeSize} />

        {/* Controls */}
        <OrbitControls enableDamping dampingFactor={0.12} rotateSpeed={0.6} />
      </Canvas>
    </div>
  );
}
