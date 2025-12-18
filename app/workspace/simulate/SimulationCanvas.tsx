"use client";

import React, { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";

import {
  Physics,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";

import PhysicsGround from "./physics/PhysicsGround";
// import PhysicsTestCube from "./physics/PhysicsTestCube"; // Phase C-1 (COMMENTED)

/* -----------------------------------------
   Types (USED LATER — DO NOT REMOVE)
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
   Phase C-2 — SceneContent (COMMENTED)
   Restore AFTER C-3
----------------------------------------- */
/*
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
            (ent.position?.y ?? 0) + 2,
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
*/

/* -----------------------------------------
   Phase C-3 — Joint Sanity Test (ACTIVE)
   Two bodies + one revolute joint
----------------------------------------- */

function JointSanityTest() {
  const baseRef = useRef(null);
  const armRef = useRef(null);

  // ✅ Correct API for @react-three/rapier
  useRevoluteJoint(baseRef, armRef, [
  [0, 0.5, 0],
  [0, -0.6, 0],
  [0, 0, 1],
], {
  limits: [-Math.PI / 4, Math.PI / 4],
});


  return (
    <>
      {/* Fixed base */}
      <RigidBody ref={baseRef} type="fixed" position={[0, 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </RigidBody>

      {/* Arm */}
      <RigidBody ref={armRef} position={[0.05, 3.2, 0]} canSleep={false}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 2, 0.4]} />
          <meshStandardMaterial color="#22d3ee" />
        </mesh>
      </RigidBody>
    </>
  );
}


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

    controls.current?.target.set(0, 0, 0);
    controls.current?.update();

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
  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ fov: 55, near: 0.1, far: 500 }}>
        <Physics gravity={[0, -9.81, 0]}>
          {/* Atmosphere */}
          <color attach="background" args={["#0b0f19"]} />
          <fog attach="fog" args={["#0b0f19", 10, 80]} />

          {/* Lights */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[8, 12, 6]} intensity={1.1} castShadow />
          <directionalLight position={[-6, 4, -4]} intensity={0.5} color="#55ccff" />

          {/* Ground */}
          <PhysicsGround />

          {/* Helpers */}
          <Grid infiniteGrid />
          <axesHelper args={[2]} />

          {/* Phase C-3 Joint Test */}
          <JointSanityTest />

          {/* Phase C-2 Restore later */}
          {/*
          <SceneContent simState={simState} cubeSize={cubeSize} />
          */}

          <CameraRig />
        </Physics>
      </Canvas>
    </div>
  );
}
