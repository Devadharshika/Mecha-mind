// app/workspace/assembly/components/AssemblyTree.tsx
"use client";

import { useAssembly } from "../../../../store/assemblyStore";

export function AssemblyTree() {
  const { state, dispatch } = useAssembly();

  const root = state.nodes[state.rootId];

  const renderNode = (id: string, depth = 0) => {
    const node = state.nodes[id];
    if (!node) return null;

    const isSelected = state.selectedNodeId === id;

    return (
      <div key={id}>
        <button
          onClick={() => dispatch({ type: "SELECT_NODE", nodeId: id })}
          className={`w-full text-left text-xs px-2 py-1 rounded-md mb-0.5 flex items-center gap-2
            ${
              isSelected
                ? "bg-emerald-500/20 border border-emerald-500/60 text-emerald-100"
                : "hover:bg-slate-800 border border-transparent text-slate-200"
            }`}
          style={{ paddingLeft: 8 + depth * 12 }}
        >
          <span className="text-[10px] uppercase tracking-wide text-slate-400">
            {node.category === "root" ? "root" : node.category}
          </span>
          <span className="font-medium truncate">{node.name}</span>
        </button>
        {node.children.length > 0 && (
          <div className="ml-0.5">
            {node.children.map((childId) => renderNode(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!root) return null;

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/60 backdrop-blur p-3 h-56 overflow-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Assembly Tree
        </h2>
        <span className="text-[10px] text-slate-500">
          Nodes: {Object.keys(state.nodes).length}
        </span>
      </div>

      {renderNode(root.id)}
    </div>
  );
}
