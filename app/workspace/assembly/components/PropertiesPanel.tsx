"use client";

import { useEffect, useMemo, useState } from "react";
import { useAssembly } from "../../../../store/assemblyStore";
import { uid } from "../../../../core/uid";

type DemoPart = {
  id: string;
  name: string;
  code: string;
  category: string;
  subtype: string;
  description: string;
  premiumTier: string;
};

const DEMO_PARTS: DemoPart[] = [
  {
    id: "demo-frame",
    name: "Demo Frame",
    code: "STR-DEMO-FRAME",
    category: "structure",
    subtype: "frame",
    description:
      "Basic demo structural frame used to test the properties panel.",
    premiumTier: "standard",
  },
  {
    id: "demo-motor",
    name: "Demo Motor",
    code: "ACT-DEMO-MOTOR",
    category: "actuator",
    subtype: "motor",
    description: "Generic actuator for testing.",
    premiumTier: "standard",
  },
  {
    id: "demo-imu",
    name: "Demo IMU",
    code: "SNS-DEMO-IMU",
    category: "sensor",
    subtype: "imu",
    description: "Demo IMU for testing sensor wiring.",
    premiumTier: "standard",
  },
];

type JointType = "fixed" | "revolute" | "prismatic";

export function PropertiesPanel() {
  const { state, dispatch } = useAssembly();
  const node = state.selectedNodeId ? state.nodes[state.selectedNodeId] : null;

  const [name, setName] = useState("");

  /* =========================================================
     Joint Form State
     (Must remain above conditional return — hook order safety)
     ========================================================= */

  const [jointType, setJointType] = useState<JointType>("fixed");
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [axisX, setAxisX] = useState("1");
  const [axisY, setAxisY] = useState("0");
  const [axisZ, setAxisZ] = useState("0");

  useEffect(() => {
    setName(node?.name ?? "");
  }, [node?.id, node?.name]);

  /* =========================================================
     Joint Computation
     IMPORTANT:
     Hooks must run unconditionally.
     Never place below `if (!node)` return.
     ========================================================= */

  const outgoingJoints = useMemo(() => {
    if (!node) return [];
    return Object.values(state.joints).filter(
      (j) => j.parentId === node.id
    );
  }, [state.joints, node]);

  const childrenWithoutJoint = useMemo(() => {
    if (!node) return [];
    return node.children.filter((childId) => {
      return !outgoingJoints.some((j) => j.childId === childId);
    });
  }, [node, outgoingJoints]);

  const canCreateJoint =
    selectedChildId &&
    (jointType === "fixed"
      ? true
      : axisX !== "" && axisY !== "" && axisZ !== "");

  /* =========================================================
     Early Return — Safe Now (hooks already executed)
     ========================================================= */

  if (!node) {
    return (
      <div className="border border-slate-800 rounded-xl bg-slate-900/60 backdrop-blur p-3 h-full">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-2">
          Properties
        </h2>
        <p className="text-xs text-slate-500">
          Select a node in the assembly tree to edit its properties.
        </p>
      </div>
    );
  }

  const part: DemoPart | null =
    node.partId ? DEMO_PARTS.find((p) => p.id === node.partId) ?? null : null;

  const isRoot = node.id === state.rootId;

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/60 backdrop-blur p-3 h-full flex flex-col overflow-y-auto">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-3">
        Properties
      </h2>

      {/* Node Header */}
      <div className="mb-4">
        <label className="text-[11px] text-slate-400 mb-1 block">
          Node name
        </label>

        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() =>
              dispatch({
                type: "RENAME_NODE",
                nodeId: node.id,
                name: name.trim() || node.name,
              })
            }
            className="flex-1 bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded-md outline-none"
          />

          {!isRoot && (
            <button
              onClick={() =>
                dispatch({
                  type: "REMOVE_NODE",
                  nodeId: node.id,
                })
              }
              className="text-[11px] text-slate-500 hover:text-red-400 transition"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Basic metadata */}
      <div className="mb-3 text-[11px] text-slate-400 space-y-1">
        <div>
          <span className="text-slate-500">Category:</span>{" "}
          <span className="text-slate-200">{node.category}</span>
        </div>
        {node.parentId && (
          <div>
            <span className="text-slate-500">Parent:</span>{" "}
            <span className="text-slate-200">
              {state.nodes[node.parentId]?.name ?? "Unknown"}
            </span>
          </div>
        )}
        <div>
          <span className="text-slate-500">Children:</span>{" "}
          <span className="text-slate-200">{node.children.length}</span>
        </div>
      </div>

      {/* Part details */}
      {part && (
        <div className="mt-2 border-t border-slate-800 pt-3 text-[11px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-200">Part details</div>
          <div>
            <span className="text-slate-500">Code:</span> {part.code}
          </div>
          <div>
            <span className="text-slate-500">Subtype:</span> {part.subtype}
          </div>
          <div>
            <span className="text-slate-500">Tier:</span> {part.premiumTier}
          </div>
          <div className="text-slate-300 mt-1">{part.description}</div>
        </div>
      )}

      {/* Joint Section */}
      <div className="mt-4 border-t border-slate-800 pt-3">
        <h3 className="text-[11px] font-semibold uppercase text-slate-400 mb-2">
          Joints
        </h3>

        {outgoingJoints.length === 0 && (
          <div className="text-[11px] text-slate-600 mb-2">
            No joints defined.
          </div>
        )}

        {outgoingJoints.map((j) => {
          const childName =
            state.nodes[j.childId]?.name ?? "Unknown";

          return (
            <div
              key={j.id}
              className="flex items-center justify-between text-[11px] text-slate-300 mb-1"
            >
              <div>
                {j.type} → {childName}
                {j.axis && (
                  <span className="text-slate-500 ml-1">
                    axis [{j.axis.join(",")}]
                  </span>
                )}
              </div>

              <button
                onClick={() =>
                  dispatch({
                    type: "REMOVE_JOINT",
                    jointId: j.id,
                  })
                }
                className="text-slate-500 hover:text-red-400 transition"
                title="Remove joint"
              >
                Remove
              </button>
            </div>
          );
        })}

        {childrenWithoutJoint.length > 0 && (
          <div className="mt-3 space-y-2 text-[11px] text-slate-300">
            <div className="font-semibold text-slate-400">
              Create Joint
            </div>

            <select
              value={jointType}
              onChange={(e) =>
                setJointType(e.target.value as JointType)
              }
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1"
            >
              <option value="fixed">fixed</option>
              <option value="revolute">revolute</option>
              <option value="prismatic">prismatic</option>
            </select>

            <select
              value={selectedChildId ?? ""}
              onChange={(e) =>
                setSelectedChildId(e.target.value)
              }
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1"
            >
              <option value="">Select child</option>
              {childrenWithoutJoint.map((childId) => (
                <option key={childId} value={childId}>
                  {state.nodes[childId]?.name}
                </option>
              ))}
            </select>

            {jointType !== "fixed" && (
              <div className="flex gap-1">
                <input
                  value={axisX}
                  onChange={(e) => setAxisX(e.target.value)}
                  className="w-1/3 bg-slate-950 border border-slate-700 rounded px-1 py-1"
                />
                <input
                  value={axisY}
                  onChange={(e) => setAxisY(e.target.value)}
                  className="w-1/3 bg-slate-950 border border-slate-700 rounded px-1 py-1"
                />
                <input
                  value={axisZ}
                  onChange={(e) => setAxisZ(e.target.value)}
                  className="w-1/3 bg-slate-950 border border-slate-700 rounded px-1 py-1"
                />
              </div>
            )}

            <button
              disabled={!canCreateJoint}
              onClick={() => {
                if (!selectedChildId) return;

                dispatch({
                  type: "ADD_JOINT",
                  joint: {
                    id: uid("joint"),
                    parentId: node.id,
                    childId: selectedChildId,
                    type: jointType,
                    axis:
                      jointType === "fixed"
                        ? undefined
                        : [
                            parseFloat(axisX),
                            parseFloat(axisY),
                            parseFloat(axisZ),
                          ],
                  },
                });

                setSelectedChildId(null);
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded py-1 transition"
            >
              Add Joint
            </button>
          </div>
        )}
      </div>
    </div>
  );
}