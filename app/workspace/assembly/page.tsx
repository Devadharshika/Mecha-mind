"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Grid as ThreeGrid,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";
import {
  Wrench,
  Cpu,
  Component,
  Box,
  CircuitBoard,
  Compass,
  Activity,
  Layers,
  RotateCw,
  AlertTriangle,
  Plus,
  Trash2,
  ChevronRight,
  Camera,
  Move3d,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  SquareMousePointer,
} from "lucide-react";

type PartCategory = "Structure" | "Actuator" | "Joint" | "Sensor" | "Control";

type PartDefinition = {
  id: string;
  name: string;
  category: PartCategory;
  short: string;
  recommendedUse: string;
  specs: string[];
};

type JointType = "revolute" | "prismatic" | "fixed";

type AssemblyNode = {
  uid: string;
  partId: string;
  name: string;
  parentUid: string | null;
  jointType: JointType;
  axis: "X" | "Y" | "Z";
  min: number;
  max: number;
};

const PARTS: PartDefinition[] = [
  {
    id: "base_plate",
    name: "Base Plate",
    category: "Structure",
    short: "Rigid mounting base",
    recommendedUse: "Start of most robot arms and towers.",
    specs: ["Aluminium", "0 DOF", "High stiffness"],
  },
  {
    id: "link_10",
    name: "Link 10cm",
    category: "Structure",
    short: "Short structural link",
    recommendedUse: "Compact arms and wrist links.",
    specs: ["Length: 0.1 m", "0 DOF", "Low mass"],
  },
  {
    id: "link_20",
    name: "Link 20cm",
    category: "Structure",
    short: "Medium structural link",
    recommendedUse: "Standard arm segments.",
    specs: ["Length: 0.2 m", "0 DOF", "Moderate mass"],
  },
  {
    id: "servo_mid",
    name: "Servo Motor (Mid Torque)",
    category: "Actuator",
    short: "Position-controlled joint motor",
    recommendedUse: "General purpose robotic joints.",
    specs: ["Torque: 20 N·m", "Voltage: 24 V", "Encoder: absolute"],
  },
  {
    id: "servo_high",
    name: "Servo Motor (High Torque)",
    category: "Actuator",
    short: "High load shoulder joint",
    recommendedUse: "Base / shoulder of industrial arms.",
    specs: ["Torque: 80 N·m", "Voltage: 48 V", "Cooling: passive"],
  },
  {
    id: "joint_revolute",
    name: "Revolute Joint",
    category: "Joint",
    short: "1-DOF rotation joint",
    recommendedUse: "Most robot arm joints.",
    specs: ["1 DOF", "Axis: configurable", "±180° typical"],
  },
  {
    id: "joint_prismatic",
    name: "Prismatic Joint",
    category: "Joint",
    short: "Linear sliding joint",
    recommendedUse: "Scara, linear stages, Z-axis.",
    specs: ["1 DOF", "Stroke: configurable", "Lead-screw or belt"],
  },
  {
    id: "imu",
    name: "IMU Module",
    category: "Sensor",
    short: "Orientation & acceleration",
    recommendedUse: "Balancing, feedback control.",
    specs: ["9-axis", "1 kHz", "Low noise"],
  },
  {
    id: "lidar",
    name: "Lidar Sensor",
    category: "Sensor",
    short: "2D range scanner",
    recommendedUse: "Mapping & obstacle avoidance.",
    specs: ["Range: 20 m", "FoV: 270°", "Laser class 1"],
  },
  {
    id: "controller",
    name: "MechaCore Controller",
    category: "Control",
    short: "Main control computer",
    recommendedUse: "Central brain of the robot.",
    specs: ["ARM SoC", "Real-time OS", "EtherCAT / CAN"],
  },
  {
    id: "gripper",
    name: "Parallel Gripper",
    category: "Actuator",
    short: "Two-finger end effector",
    recommendedUse: "Pick-and-place tasks.",
    specs: ["Stroke: 80 mm", "Grip force: 120 N", "Payload: 3 kg"],
  },
];

let uidCounter = 1;
const makeUid = () => `node_${uidCounter++}`;

export default function RobotAssemblyLabPage() {
  const [categoryFilter, setCategoryFilter] = useState<PartCategory | "All">(
    "All"
  );
  const [assembly, setAssembly] = useState<AssemblyNode[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  const selectedNode = useMemo(
    () => assembly.find((n) => n.uid === selectedUid) ?? null,
    [assembly, selectedUid]
  );

  const filteredParts = useMemo(
    () =>
      categoryFilter === "All"
        ? PARTS
        : PARTS.filter((p) => p.category === categoryFilter),
    [categoryFilter]
  );
const addPartToAssembly = (partId: string) => {
  const part = PARTS.find((p) => p.id === partId);
  if (!part) return;

  const isRoot = assembly.length === 0;

  // Parent: root has no parent; otherwise attach to selected, or last node
  const parentForNew =
    isRoot
      ? null
      : selectedUid ?? (assembly.length ? assembly[assembly.length - 1].uid : null);

  // Decide default joint type based on WHAT the part is
  let jointType: JointType = "fixed";

  if (!isRoot) {
    if (part.category === "Joint") {
      // Real kinematic joints
      jointType = part.id === "joint_prismatic" ? "prismatic" : "revolute";
    } else if (part.category === "Actuator") {
      // Motors / grippers → treat as actuated joints for now
      jointType = "revolute";
    } else {
      // Structure / Sensor / Control → fixed
      jointType = "fixed";
    }
  }

  const node: AssemblyNode = {
    uid: makeUid(),
    partId: part.id,
    name: part.name,
    parentUid: parentForNew,
    jointType,
    axis: "Z",
    min: jointType === "fixed" ? 0 : -90,
    max: jointType === "fixed" ? 0 : 90,
  };

  setAssembly((prev) => [...prev, node]);
  setSelectedUid(node.uid);
};

  const removeNode = (uid: string) => {
    setAssembly((prev) => prev.filter((n) => n.uid !== uid && n.parentUid !== uid));
    if (selectedUid === uid) setSelectedUid(null);
  };

  const updateSelected = (updates: Partial<AssemblyNode>) => {
    if (!selectedUid) return;
    setAssembly((prev) =>
      prev.map((n) => (n.uid === selectedUid ? { ...n, ...updates } : n))
    );
  };

  const rootNodes = assembly.filter((n) => n.parentUid === null);

  const childrenOf = (uid: string) =>
    assembly.filter((n) => n.parentUid === uid);

  const hasBasePlate = assembly.some((n) => n.partId === "base_plate");
  const hasController = assembly.some((n) => n.partId === "controller");
  const totalJoints = assembly.filter((n) => {
  if (n.jointType === "fixed") return false;
  const part = PARTS.find((p) => p.id === n.partId);
  // Count joints + actuators; ignore pure structure
  return part?.category === "Joint" || part?.category === "Actuator";
}).length;


  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50 flex items-center gap-2">
            <Wrench className="w-7 h-7 text-cyan-400" />
            Robot Assembly Lab
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-1 max-w-2xl">
            Build robots from modular parts: structure, actuators, joints, sensors,
            and controllers. MechaMind will later simulate and analyze the complete
            kinematic chain.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 text-[10px] md:text-xs">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-cyan-200">
            <Layers className="w-3 h-3" />
            Parts-based assembly mode
          </span>
          <span className="text-slate-500">
            Assembly is UI-only for now – ready for 3D & physics integration.
          </span>
        </div>
      </div>

      {/* Main layout – bigger center workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,2.1fr)_minmax(0,0.8fr)] gap-6">
        {/* LEFT: Parts library */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.7)] p-4 md:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Component className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm md:text-base font-medium text-slate-100">
                Parts Library
              </h2>
            </div>
            <span className="text-[10px] md:text-xs text-slate-500">
              Click a part → <span className="text-cyan-300">Add to Assembly</span>
            </span>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5 text-[10px] md:text-xs">
            {(["All", "Structure", "Actuator", "Joint", "Sensor", "Control"] as const).map(
              (cat) => {
                const active = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat as any)}
                    className={`rounded-full border px-3 py-1 transition-all ${
                      active
                        ? "border-cyan-400/80 bg-cyan-400/15 text-cyan-100"
                        : "border-slate-700 bg-slate-950/90 text-slate-300 hover:border-cyan-500/40 hover:bg-slate-900"
                    }`}
                  >
                    {cat}
                  </button>
                );
              }
            )}
          </div>

          {/* Parts list */}
          <div className="mt-1 space-y-2 max-h-[420px] overflow-auto pr-1">
            {filteredParts.map((part) => (
              <button
                key={part.id}
                type="button"
                onClick={() => addPartToAssembly(part.id)}
                className="w-full text-left rounded-xl border border-slate-800 bg-slate-950/80 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all px-3 py-2.5 text-[11px] md:text-xs flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Box className="w-3.5 h-3.5 text-cyan-300" />
                    <span className="font-medium text-slate-100">
                      {part.name}
                    </span>
                  </div>
                  <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400">
                    {part.category}
                  </span>
                </div>
                <p className="text-slate-400">{part.short}</p>
                <p className="text-slate-500 text-[10px]">
                  Use: {part.recommendedUse}
                </p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {part.specs.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-slate-900/80 border border-slate-700/70 px-2 py-0.5 text-[9px] text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-cyan-300">
                  <Plus className="w-3 h-3" />
                  Add to assembly
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* CENTER: 3D assembly canvas (hero workspace) */}
        <section className="relative rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-[0_0_40px_rgba(0,0,0,0.7)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-5 pt-4 pb-3 border-b border-slate-800/70 backdrop-blur-sm bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm md:text-base font-medium text-slate-100">
                3D Assembly Workspace
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Build mode
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                r3f / CAD integration ready
              </span>
            </div>
          </div>

          {/* Pro toolbar */}
          <div className="flex items-center justify-between px-4 md:px-5 py-2 border-b border-slate-800/70 bg-slate-950/80 text-[10px] md:text-xs">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-slate-400 mr-1">View</span>
              <button className="inline-flex items-center gap-1 rounded-full border border-cyan-500/70 bg-cyan-500/15 px-2.5 py-1 text-cyan-100">
                <Camera className="w-3 h-3" />
                Perspective
              </button>
              <button className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-300">
                Top
              </button>
              <button className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-300">
                Side
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-slate-400">Tools</span>
              <button className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-300">
                <Move3d className="w-3 h-3" />
                Move
              </button>
              <button className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-300">
                <SquareMousePointer className="w-3 h-3" />
                Select
              </button>
              <button className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-300">
                <Grid3X3 className="w-3 h-3" />
                Snap
              </button>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              <button className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 w-6 h-6">
                <ZoomOut className="w-3 h-3 text-slate-300" />
              </button>
              <button className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 w-6 h-6">
                <ZoomIn className="w-3 h-3 text-slate-300" />
              </button>
            </div>
          </div>

          {/* Canvas area */}
          <div className="relative h-[460px] md:h-[520px] lg:h-[560px]">
            {/* 3D Canvas container */}
            <div className="absolute inset-[14%] md:inset-[12%] rounded-[1.5rem] border border-slate-800/80 bg-slate-950/90 overflow-hidden">
              <Canvas
                camera={{ position: [3.5, 2.5, 3.5], fov: 45 }}
                shadows
              >
                {/* Scene background */}
                <color attach="background" args={["#020617"]} />

                {/* Lights */}
                <ambientLight intensity={0.4} />
                <directionalLight
                  position={[4, 6, 4]}
                  intensity={1.1}
                  castShadow
                  shadow-mapSize-width={1024}
                  shadow-mapSize-height={1024}
                />
                <directionalLight position={[-4, 3, -2]} intensity={0.4} />

                {/* Ground grid */}
                <ThreeGrid
                  args={[20, 20]}
                  cellSize={0.25}
                  sectionSize={1}
                  sectionThickness={1}
                  cellThickness={0.5}
                  infiniteGrid
                  fadeDistance={20}
                  fadeStrength={1}
                  position={[0, 0, 0]}
                />

                {/* Robot visual driven by current assembly */}
                <AssemblyRobotVisual assembly={assembly} />


                {/* Camera controls */}
                <OrbitControls
                  enableDamping
                  enablePan
                  makeDefault
                  minDistance={1.5}
                  maxDistance={10}
                  maxPolarAngle={Math.PI * 0.9}
                />

                {/* Gizmo helper in corner */}
                <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                  <GizmoViewport
                    axisHeadScale={1}
                    axisColors={["#22d3ee", "#4ade80", "#f97316"]}
                    labelColor="#e2e8f0"
                  />
                </GizmoHelper>
              </Canvas>
            </div>

            {/* Subtle outer glow / frame */}
            <div className="pointer-events-none absolute inset-5 rounded-[1.5rem] border border-cyan-400/15 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />

            {/* HUD overlays */}
            <div className="pointer-events-none absolute left-6 top-6 flex flex-col gap-2 text-[10px] md:text-xs">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/70 bg-cyan-500/15 px-3 py-1 text-cyan-100">
                Drag with mouse to orbit · Scroll to zoom · Right-click to pan
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1 text-slate-300">
                Scene:{" "}
                <span className="text-cyan-300">
                  MechaMind Assembly Sandbox (mock)
                </span>
              </span>
            </div>

            <div className="pointer-events-none absolute left-4 bottom-4 flex flex-col gap-2 text-[10px] md:text-xs">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/85 border border-slate-800 px-3 py-1">
                <Activity className="w-3 h-3 text-emerald-300" />
                <span className="text-slate-200">
                  Next step: bind assembly → simulation scene
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/85 border border-slate-800 px-3 py-1">
                <RotateCw className="w-3 h-3 text-cyan-300 animate-spin-slow" />
                <span className="text-slate-300">
                  Export target: URDF / custom MechaMind format
                </span>
              </div>
            </div>

            <div className="pointer-events-none absolute right-4 bottom-4 flex flex-col items-end gap-2 text-[10px] md:text-xs">
              <span className="rounded-full border border-slate-700 bg-slate-950/90 px-3 py-1 text-slate-300">
                Nodes: {assembly.length || 0} · Joints: {totalJoints}
              </span>
            </div>
          </div>
        </section>

        {/* RIGHT: Assembly tree + properties + validation */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.7)] p-4 md:p-5 flex flex-col gap-4">
          {/* Tree */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm md:text-base font-medium text-slate-100">
                Assembly Hierarchy
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setAssembly([]);
                setSelectedUid(null);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[10px] md:text-xs text-slate-300 hover:bg-slate-900"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>

          <div className="max-h-44 overflow-auto rounded-xl border border-slate-800 bg-slate-950/90 px-2 py-2 text-[10px] md:text-xs">
            {assembly.length === 0 && (
              <p className="text-slate-500">
                No parts added yet. Start by adding a{" "}
                <span className="text-cyan-300">Base Plate</span>, then attach links,
                joints, and actuators.
              </p>
            )}

            {rootNodes.map((root) => (
              <AssemblyTreeNode
                key={root.uid}
                node={root}
                depth={0}
                childrenOf={childrenOf}
                selectedUid={selectedUid}
                onSelect={setSelectedUid}
              />
            ))}
          </div>

          {/* Properties */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs md:text-sm font-medium text-slate-100">
                  Joint & Part Properties
                </h3>
              </div>
              {selectedNode && (
                <button
                  type="button"
                  onClick={() => removeNode(selectedNode.uid)}
                  className="inline-flex items-center gap-1 rounded-full border border-red-500/60 bg-red-500/10 px-2.5 py-1 text-[10px] md:text-xs text-red-100 hover:bg-red-500/20"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              )}
            </div>

            {!selectedNode && (
              <p className="text-[11px] md:text-xs text-slate-500">
                Select a node from the assembly hierarchy to edit joint type, axis and
                limits. Base nodes default to <span className="text-cyan-300">fixed</span>{" "}
                joints.
              </p>
            )}

            {selectedNode && (
              <div className="space-y-3 text-[11px] md:text-xs">
                <div>
                  <div className="text-slate-400 uppercase tracking-wide text-[10px] mb-1">
                    Node
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-slate-50">
                      {selectedNode.name}
                    </span>
                    <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-slate-400">
                      UID: {selectedNode.uid}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-slate-400 text-[10px] mb-1">
                      Joint Type
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(["fixed", "revolute", "prismatic"] as JointType[]).map((jt) => {
                        const active = selectedNode.jointType === jt;
                        return (
                          <button
                            key={jt}
                            type="button"
                            onClick={() => updateSelected({ jointType: jt })}
                            className={`rounded-full border px-2.5 py-1 transition-all ${
                              active
                                ? "border-emerald-400/80 bg-emerald-400/15 text-emerald-100"
                                : "border-slate-700 bg-slate-950 text-slate-300 hover:border-emerald-400/40"
                            }`}
                          >
                            {jt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] mb-1">
                      Joint Axis
                    </div>
                    <div className="flex gap-1.5">
                      {(["X", "Y", "Z"] as const).map((ax) => {
                        const active = selectedNode.axis === ax;
                        return (
                          <button
                            key={ax}
                            type="button"
                            onClick={() => updateSelected({ axis: ax })}
                            className={`rounded-full border px-2.5 py-1 transition-all ${
                              active
                                ? "border-cyan-400/80 bg-cyan-400/15 text-cyan-100"
                                : "border-slate-700 bg-slate-950 text-slate-300 hover:border-cyan-400/40"
                            }`}
                          >
                            {ax}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {selectedNode.jointType !== "fixed" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-slate-400 text-[10px] mb-1">
                        Min Limit ({selectedNode.jointType === "revolute" ? "°" : "m"})
                      </div>
                      <input
                        type="number"
                        value={selectedNode.min}
                        onChange={(e) =>
                          updateSelected({ min: Number(e.target.value) })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/60"
                      />
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] mb-1">
                        Max Limit ({selectedNode.jointType === "revolute" ? "°" : "m"})
                      </div>
                      <input
                        type="number"
                        value={selectedNode.max}
                        onChange={(e) =>
                          updateSelected({ max: Number(e.target.value) })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/60"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Validation & export preview */}
          <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-3 text-[10px] md:text-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-medium text-slate-100">
                  Design Checks (static)
                </span>
              </div>
              <span className="text-slate-500">
                Export target: <span className="text-cyan-300">URDF / JSON</span>
              </span>
            </div>

            <ul className="space-y-1">
              <li className="flex items-start gap-2">
                <span
                  className={`mt-1 h-1.5 w-1.5 rounded-full ${
                    hasBasePlate ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <span className="text-slate-300">
                  {hasBasePlate
                    ? "Base structure detected."
                    : "No base plate detected. Most robots start from a rigid base."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={`mt-1 h-1.5 w-1.5 rounded-full ${
                    totalJoints > 0 ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <span className="text-slate-300">
                  {totalJoints > 0
                    ? `Kinematic chain includes ${totalJoints} actuated joint(s).`
                    : "No actuated joints yet. Add revolute or prismatic joints for motion."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={`mt-1 h-1.5 w-1.5 rounded-full ${
                    hasController ? "bg-emerald-400" : "bg-slate-500"
                  }`}
                />
                <span className="text-slate-300">
                  {hasController
                    ? "Control unit present – ready for future control mapping."
                    : "No controller added. Consider adding a MechaCore Controller as the brain."}
                </span>
              </li>
            </ul>

            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 rounded-full border border-cyan-500/70 bg-cyan-500/15 px-3 py-1.5 text-[10px] md:text-xs font-medium text-cyan-100 hover:bg-cyan-500/25 transition-colors"
            >
              <CircuitBoard className="w-3 h-3" />
              Export assembly to simulation (future)
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

// Simple placeholder robot model for the 3D scene
// Robot visual driven by the assembly chain (simple stacked representation)
function AssemblyRobotVisual({ assembly }: { assembly: AssemblyNode[] }) {
  const chain = useMemo(() => {
    if (assembly.length === 0) return [];

    const root = assembly.find((n) => n.parentUid === null);
    if (!root) return [];

    const result: AssemblyNode[] = [root];
    let current = root;

    while (true) {
      const child = assembly.find((n) => n.parentUid === current.uid);
      if (!child) break;
      result.push(child);
      current = child;
    }

    return result;
  }, [assembly]);

  if (chain.length === 0) {
    return null;
  }

  return (
    <group position={[0, 0, 0]}>
      {chain.map((node, index) => {
        const yBase = 0.05 + index * 0.35;

        if (node.partId === "base_plate") {
          return (
            <mesh key={node.uid} position={[0, yBase, 0]} receiveShadow castShadow>
              <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
              <meshStandardMaterial
                color="#0f172a"
                metalness={0.4}
                roughness={0.4}
              />
            </mesh>
          );
        }

        if (node.partId === "link_10" || node.partId === "link_20") {
          const length = node.partId === "link_10" ? 0.5 : 0.7;
          return (
            <mesh
              key={node.uid}
              position={[0, yBase + length / 2, 0]}
              castShadow
            >
              <boxGeometry args={[0.12, length, 0.12]} />
              <meshStandardMaterial
                color={node.partId === "link_10" ? "#22c55e" : "#0ea5e9"}
                metalness={0.5}
                roughness={0.35}
              />
            </mesh>
          );
        }

        if (node.partId === "joint_revolute" || node.partId === "joint_prismatic") {
          return (
            <mesh key={node.uid} position={[0, yBase + 0.12, 0]} castShadow>
              <sphereGeometry args={[0.09, 32, 32]} />
              <meshStandardMaterial
                color={node.partId === "joint_revolute" ? "#38bdf8" : "#eab308"}
                metalness={0.6}
                roughness={0.3}
              />
            </mesh>
          );
        }

        if (node.partId === "gripper") {
          return (
            <group key={node.uid} position={[0, yBase + 0.25, 0]}>
              <mesh castShadow position={[-0.05, 0, 0]}>
                <boxGeometry args={[0.04, 0.2, 0.04]} />
                <meshStandardMaterial color="#eab308" metalness={0.5} roughness={0.4} />
              </mesh>
              <mesh castShadow position={[0.05, 0, 0]}>
                <boxGeometry args={[0.04, 0.2, 0.04]} />
                <meshStandardMaterial color="#eab308" metalness={0.5} roughness={0.4} />
              </mesh>
            </group>
          );
        }

        return (
          <mesh key={node.uid} position={[0, yBase + 0.15, 0]} castShadow>
            <boxGeometry args={[0.1, 0.3, 0.1]} />
            <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}
// Recursive tree node component
function AssemblyTreeNode({
  node,
  depth,
  childrenOf,
  selectedUid,
  onSelect,
}: {
  node: AssemblyNode;
  depth: number;
  childrenOf: (uid: string) => AssemblyNode[];
  selectedUid: string | null;
  onSelect: (uid: string) => void;
}) {
  const children = childrenOf(node.uid);
  const selected = selectedUid === node.uid;

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => onSelect(node.uid)}
        className={`flex items-center gap-1.5 rounded-lg px-2 py-1 ${
          selected
            ? "bg-cyan-500/20 text-cyan-100"
            : "hover:bg-slate-900 text-slate-200"
        }`}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <ChevronRight className="w-3 h-3 text-slate-500" />
        <span className="font-medium">{node.name}</span>
        <span className="text-[10px] text-slate-400">
          [{node.jointType} · axis {node.axis}]
        </span>
      </button>
      {children.map((child) => (
        <AssemblyTreeNode
          key={child.uid}
          node={child}
          depth={depth + 1}
          childrenOf={childrenOf}
          selectedUid={selectedUid}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
