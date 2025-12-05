"use client";

import { useEffect, useState } from "react";
import { useAssembly } from "../../../../store/assemblyStore";

// Keep in sync with DEMO_PARTS above for now
const DEMO_PARTS = [
  {
    id: "demo-frame",
    name: "Demo Frame",
    code: "STR-DEMO-FRAME",
    category: "structure",
    subtype: "frame",
    description: "Basic demo structural frame used to test the properties panel.",
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

export function PropertiesPanel() {
  const { state, dispatch } = useAssembly();
  const node = state.selectedNodeId ? state.nodes[state.selectedNodeId] : null;
  const [name, setName] = useState("");

  useEffect(() => {
    setName(node?.name ?? "");
  }, [node?.id]);

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

  const part = node.partId
    ? DEMO_PARTS.find((p) => p.id === node.partId)
    : null;

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/60 backdrop-blur p-3 h-full flex flex-col">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-2">
        Properties
      </h2>

      <div className="mb-3">
        <label className="text-[11px] text-slate-400 mb-1 block">
          Node name
        </label>
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
          className="w-full bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded-md outline-none"
        />
      </div>

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

      {part && (
        <div className="mt-2 border-t border-slate-800 pt-2 text-[11px] text-slate-400 space-y-1">
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
    </div>
  );
}
