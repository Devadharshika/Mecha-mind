"use client";

import React, { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";

/* ------------------------------------------------
   ⚠ PROTOTYPE PHYSICS (COMMENTED — DO NOT DELETE)
   These were used when React owned physics.
   Simulation authority is now simService.
   May be reused later for debug overlay tools.
------------------------------------------------- */

// import {
//   Physics,
//   RigidBody,
//   type RigidBodyApi,
// } from "@react-three/rapier";

// import PhysicsGround from "./physics/PhysicsGround";
// import { FixedJointConstraint } from "@/core/sim/joints/fixedJoint";
// import { createBodyRegistry } from "@/core/sim/joints/bodyRegistry";

/* -----------------------------------------
   Types (MIRROR simService OUTPUT)
   DO NOT ADD SIMULATION LOGIC HERE
----------------------------------------- */

type SimEntity = {
  id: string;
  position?: { x?: number; y?: number; z?: number };
  rotation?: { x?: number; y?: number; z?: number };
};

type SimState = {
  resetId: number;
  entities?: Record<string, SimEntity>;
};

interface SimulationCanvasProps {
  simState?: SimState | null;

  /*
    running is intentionally preserved.
    It will later drive:
    - visual simulation status overlays
    - frame stepping diagnostics
    - performance instrumentation
    DO NOT REMOVE.
  */
  running: boolean;
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
   Simulation Bodies — PURE VISUAL MIRROR
   NEVER CREATE PHYSICS HERE
----------------------------------------- */

function SimulationBodies({ simState }: { simState?: SimState | null }) {
  if (!simState?.entities) return null;

  const entities = Object.values(simState.entities);

  return (
    <>
      {entities.map((entity) => {
        const pos = entity.position ?? { x: 0, y: 0, z: 0 };
        const rot = entity.rotation ?? { x: 0, y: 0, z: 0 };

        return (
          <mesh
            key={entity.id}
            position={[pos.x ?? 0, pos.y ?? 0, pos.z ?? 0]}
            rotation={[rot.x ?? 0, rot.y ?? 0, rot.z ?? 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#22d3ee" />
          </mesh>
        );
      })}
    </>
  );
}

/* -----------------------------------------
   MAIN CANVAS — PASSIVE RENDERER
----------------------------------------- */

export default function SimulationCanvas({
  simState = null,
  running, // preserved for future
}: SimulationCanvasProps) {

  /*
    Future expansion point:
    if (running) {
      // could show visual indicator / HUD
    }
    DO NOT REMOVE running even if unused.
  */

  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ fov: 55, near: 0.1, far: 500 }}>

        <color attach="background" args={["#0b0f19"]} />
        <fog attach="fog" args={["#0b0f19", 10, 80]} />

        <ambientLight intensity={0.3} />
        <directionalLight position={[8, 12, 6]} intensity={1.1} castShadow />
        <directionalLight
          position={[-6, 4, -4]}
          intensity={0.5}
          color="#55ccff"
        />

        {/* -----------------------------------------
            Render Simulation Entities
            Source of truth: simService
        ----------------------------------------- */}
        <SimulationBodies simState={simState} />

        {/* -----------------------------------------
            Scene Helpers
        ----------------------------------------- */}
        <Grid infiniteGrid />
        <axesHelper args={[2]} />

        <CameraRig />

      </Canvas>
    </div>
  );
}