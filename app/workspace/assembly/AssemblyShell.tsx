"use client";

import { AssemblyProvider } from "../../../store/assemblyStore";
import { WorkspaceToolbar } from "./components/WorkspaceToolbar";
import { PartLibrary } from "./components/PartLibrary";
import { AssemblyTree } from "./components/AssemblyTree";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { ValidationPanel } from "./components/ValidationPanel";
import { RobotCanvas } from "./components/RobotCanvas";
import JointDebugOverlay from "./components/JointDebugOverlay";

export default function AssemblyShell() {
  return (
    <AssemblyProvider>
      {/* Rendered inside app/workspace/layout.tsx -> <main> */}
      <div className="flex flex-col gap-4 min-h-full">
        <WorkspaceToolbar />

        <section className="flex flex-1 gap-4">
          {/* Left: Library */}
          <div className="w-72 flex flex-col gap-3">
            <PartLibrary />
            <ValidationPanel />
          </div>

          {/* Center: Tree + Canvas */}
          <div className="flex-1 flex flex-col gap-3">
            <AssemblyTree />

            {/* Canvas container (relative for debug overlays) */}
            <div className="relative flex-1">
              <RobotCanvas />
              <JointDebugOverlay />
            </div>
          </div>

          {/* Right: Properties */}
          <div className="w-80">
            <PropertiesPanel />
          </div>
        </section>
      </div>
    </AssemblyProvider>
  );
}
