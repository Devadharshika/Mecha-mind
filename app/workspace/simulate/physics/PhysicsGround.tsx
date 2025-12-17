"use client";

import { RigidBody } from "@react-three/rapier";

export default function PhysicsGround() {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={[0, -0.5, 0]} receiveShadow>
        {/* Ground thickness = 1
            Top surface aligns at y = 0 */}
        <boxGeometry args={[200, 1, 200]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </RigidBody>
  );
}
