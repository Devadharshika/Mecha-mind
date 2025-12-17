"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import { Physics, RigidBody } from "@react-three/rapier";

import PhysicsGround from "./physics/PhysicsGround";
// import PhysicsTestCube from "./physics/PhysicsTestCube"; // Phase C-1 (COMMENTED)

/* -----------------------------------------
   Types
----------------------------------------- */

type SimEntity = {
  id: string;
  position?: { x?: number; y?: number; z?: number };
  rotation?: { x?: number; y?: number; z?: number };
};

type SimState = {
  entities?: Record<string, SimEntity>;
};

interface SimulationCanvasProps {
  simState?: SimState | null;
  maxInstances?: number;
  cubeSize?: number;
}

/* -----------------------------------------
   SceneContent — Phase C-2 (ACTIVE)
   One RigidBody per entity
----------------------------------------- */

function SceneContent({
  simState,
  cubeSize,
}: {
  simState?: SimState | null;
  cubeSize: number;
}) {
  if (!simState?.entities) return null;

  return (
    <>
      {Object.values(simState.entities).map((ent) => (
        <RigidBody
          key={ent.id}
          colliders="cuboid"
          position={[
            ent.position?.x ?? 0,
            (ent.position?.y ?? 0) + 2, // lift to avoid ground overlap
            ent.position?.z ?? 0,
          ]}
          rotation={[
            ent.rotation?.x ?? 0,
            ent.rotation?.y ?? 0,
            ent.rotation?.z ?? 0,
          ]}
        >
          <mesh castShadow>
            <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
            <meshStandardMaterial color="#55ccff" />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}

/* -----------------------------------------
   SceneContent — Phase B (INSTANCED, COMMENTED)
   Preserved for later optimization
----------------------------------------- */
/*
function SceneContent_Instanced({
  simState,
  maxInstances,
  cubeSize,
}: {
  simState?: SimState | null;
  maxInstances: number;
  cubeSize: number;
}) {
  const ids = useMemo(
    () => (simState?.entities ? Object.keys(simState.entities) : []),
    [simState]
  );

  const count = Math.min(ids.length, maxInstances);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current || !simState?.entities) return;

    for (let i = 0; i < count; i++) {
      const ent = simState.entities[ids[i]];
      if (!ent) continue;

      tmp.position.set(
        ent.position?.x ?? 0,
        ent.position?.y ?? 0,
        ent.position?.z ?? 0
      );

      tmp.rotation.set(
        ent.rotation?.x ?? 0,
        ent.rotation?.y ?? 0,
        ent.rotation?.z ?? 0
      );

      tmp.scale.setScalar(cubeSize);
      tmp.updateMatrix();
      meshRef.current.setMatrixAt(i, tmp.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#55ccff" />
    </instancedMesh>
  );
}
*/

/* -----------------------------------------
   Camera + Controls (LOCKED)
----------------------------------------- */

function CameraRig() {
  const { camera, gl } = useThree();
  const controls = useRef<any>(null);

  useEffect(() => {
    camera.up.set(0, 1, 0);
    camera.position.set(6, 6, 6);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    if (controls.current) {
      controls.current.target.set(0, 0, 0);
      controls.current.update();
    }

    gl.setClearColor("#0b0f19");
  }, [camera, gl]);

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.6}
      zoomSpeed={1.0}
      panSpeed={0.6}
      minDistance={2}
      maxDistance={60}
      maxPolarAngle={Math.PI * 0.495}
    />
  );
}

/* -----------------------------------------
   Main Canvas
----------------------------------------- */

export default function SimulationCanvas({
  simState = null,
  maxInstances = 1000,
  cubeSize = 0.5,
}: SimulationCanvasProps) {
  const entityCount = simState?.entities
    ? Object.keys(simState.entities).length
    : 0;

  if (!simState || entityCount === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        No simulation entities
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        frameloop="always"
        camera={{ fov: 55, near: 0.1, far: 500 }}
      >
        <Physics gravity={[0, -9.81, 0]}>
          {/* Atmosphere */}
          <color attach="background" args={["#0b0f19"]} />
          <fog attach="fog" args={["#0b0f19", 10, 80]} />

          {/* Lights */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[8, 12, 6]} intensity={1.1} castShadow />
          <directionalLight position={[-6, 4, -4]} intensity={0.5} color="#55ccff" />

          {/* Phase C-1 Ground (ACTIVE) */}
          <PhysicsGround />

          {/* Phase C-1 Test Cube (COMMENTED) */}
          {/*
          <PhysicsTestCube />
          */}

          {/* Helpers */}
          <Grid infiniteGrid />
          <axesHelper args={[2]} />

          {/* Phase C-2 Entities (ACTIVE) */}
          <SceneContent simState={simState} cubeSize={cubeSize} />

          {/* Camera */}
          <CameraRig />
        </Physics>
      </Canvas>
    </div>
  );
}
