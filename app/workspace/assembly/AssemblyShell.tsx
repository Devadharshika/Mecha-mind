"use client";

import { AssemblyProvider } from "../../../store/assemblyStore";
import { WorkspaceToolbar } from "./components/WorkspaceToolbar";
import { PartLibrary } from "./components/PartLibrary";
import { AssemblyTree } from "./components/AssemblyTree";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { ValidationPanel } from "./components/ValidationPanel";
import { RobotCanvas } from "./components/RobotCanvas";
// import JointDebugOverlay from "./components/JointDebugOverlay"; // kept commented

export default function AssemblyShell() {
  return (
    <AssemblyProvider>
      <div className="flex flex-col gap-4 min-h-full">
        <WorkspaceToolbar />

        <section className="flex flex-1 gap-4 min-h-0">

          {/* ================= LEFT PANEL ================= */}
          {/* Future: collapsible library */}
          <div className="w-72 flex flex-col gap-3">
            <PartLibrary />
            <ValidationPanel />

            {/* FUTURE:
                collapse/expand button
                side docking behavior
            */}
          </div>

          {/* ================= CENTER CANVAS ================= */}
          {/* Canvas gets dominant space */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="relative flex-1 min-h-0">
              <RobotCanvas />

              {/* Old overlay mount preserved */}
              {/*
              <JointDebugOverlay />
              */}
            </div>
          </div>

          {/* ================= RIGHT PANEL ================= */}
          {/* Tree + Properties stacked */}
          <div className="w-80 flex flex-col min-h-0 gap-3">

            {/* Properties */}
            <div className="flex-none">
              <PropertiesPanel />
            </div>

            {/* Assembly tree scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <AssemblyTree />
            </div>

          </div>

        </section>
      </div>
    </AssemblyProvider>
  );
}
