"use client";

import { useState } from "react";
import { PART_CATEGORIES } from "../../../../core/partCategories";
import { useAssembly } from "../../../../store/assemblyStore";

// Local demo parts – avoids BASE_PARTS import issues for now
const DEMO_PARTS = [
  {
    id: "demo-frame",
    name: "Demo Frame",
    code: "STR-DEMO-FRAME",
    category: "structure",
  },
  {
    id: "demo-motor",
    name: "Demo Motor",
    code: "ACT-DEMO-MOTOR",
    category: "actuator",
  },
  {
    id: "demo-imu",
    name: "Demo IMU",
    code: "SNS-DEMO-IMU",
    category: "sensor",
  },
];

export function PartLibrary() {
  const { dispatch } = useAssembly();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = DEMO_PARTS.filter((p) => {
    const byCat = categoryFilter === "all" || p.category === categoryFilter;
    const byQuery =
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.code.toLowerCase().includes(query.toLowerCase());
    return byCat && byQuery;
  });

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/60 backdrop-blur p-3 flex flex-col h-[340px]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Part Library
        </h2>
      </div>

      <div className="flex gap-2 mb-2">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded-md outline-none"
        >
          <option value="all">All categories</option>
          {PART_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search parts…"
        className="mb-2 bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded-md outline-none"
      />

      <div className="flex-1 overflow-auto flex flex-col gap-1 pr-1">
        {filtered.map((part) => (
          <button
            key={part.id}
            onClick={() =>
              dispatch({
                type: "ADD_PART",
                partId: part.id,
                name: part.name,
                category: part.category as any,
              })
            }
            className="w-full text-left text-xs border border-slate-800 rounded-lg px-2 py-1.5 bg-slate-950/60 hover:bg-slate-800 transition flex flex-col gap-0.5"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{part.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-slate-700 text-slate-300">
                {part.category}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">{part.code}</div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="text-[11px] text-slate-500 text-center mt-4">
            No parts match your filters yet.
          </div>
        )}
      </div>

      <div className="mt-2 text-[10px] text-slate-500">
        Tip: click a part to attach it under the currently selected node.
      </div>
    </div>
  );
}
