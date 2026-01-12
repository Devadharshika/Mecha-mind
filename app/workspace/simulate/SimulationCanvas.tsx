"use client";

import React, { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import {
  Physics,
  RigidBody,
  type RigidBodyApi,
} from "@react-three/rapier";

import PhysicsGround from "./physics/PhysicsGround";
import { FixedJointConstraint } from "@/core/sim/joints/fixedJoint";
import { createBodyRegistry } from "@/core/sim/joints/bodyRegistry";

/* -----------------------------------------
   Types (USED LATER — DO NOT REMOVE)
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
   MAIN CANVAS — PHASE D-3.2
----------------------------------------- */

export default function SimulationCanvas({
  simState = null,
  running,
}: SimulationCanvasProps) {
  // Registry survives renders
  const bodyRegistry = useRef(createBodyRegistry());

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

        <Physics
          key={simState?.resetId}
          gravity={[0, -9.81, 0]}
          paused={!running}
        >
          <PhysicsGround />

          {/* Body A */}
          <RigidBody
            ref={(api: RigidBodyApi | null) => {
              if (api) bodyRegistry.current.set("bodyA", api);
            }}
            colliders="cuboid"
            position={[0, 4, 0]}
          >
            <mesh castShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#22d3ee" />
            </mesh>
          </RigidBody>

          {/* Body B */}
          <RigidBody
            ref={(api: RigidBodyApi | null) => {
              if (api) bodyRegistry.current.set("bodyB", api);
            }}
            colliders="cuboid"
            position={[0, 5.2, 0]}
          >
            <mesh castShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#0ea5e9" />
            </mesh>
          </RigidBody>

          {/* Fixed Joint */}
          <FixedJointConstraint
            joint={{
              id: "test-fixed",
              type: "fixed",
              parentId: "bodyA",
              childId: "bodyB",
            }}
            bodyA={bodyRegistry.current.get("bodyA")}
            bodyB={bodyRegistry.current.get("bodyB")}
          />
        </Physics>

        <Grid infiniteGrid />
        <axesHelper args={[2]} />
        <CameraRig />
      </Canvas>
    </div>
  );
}
