"use client";

import { RigidBody } from "@react-three/rapier";

export default function PhysicsTestCube() {
  return (
    <RigidBody
      colliders="cuboid"
      position={[0, 3, 0]}
      restitution={0.2}
      friction={1}
      canSleep={false} // important for sanity testing
    >
      <mesh castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#55ccff" />
      </mesh>
    </RigidBody>
  );
}
