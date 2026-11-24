import { Building2, CircleCheck, CircleSlash, Waypoints } from "lucide-react";
import { useApp } from "../context/AppContext";
import { DijkstraAnimation } from "./DijkstraAnimation";
import { GraphVisualization } from "./GraphVisualization";
import { RouteResult } from "./RouteResult";
import { RouteSearch } from "./RouteSearch";
import { StatCard } from "./StatCard";

export function Dashboard() {
  const { stats } = useApp();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        <StatCard label="Total Gedung" value={stats.totalBuildings} icon={Building2} tone="navy" hint="Node pada graf" />
        <StatCard label="Total Jalur" value={stats.totalEdges} icon={Waypoints} tone="blue" hint="Termasuk jalur paralel" />
        <StatCard label="Jalur Aktif" value={stats.activeEdges} icon={CircleCheck} tone="emerald" hint="Dipakai algoritma" />
        <StatCard label="Jalur Ditutup" value={stats.closedEdges} icon={CircleSlash} tone="rose" hint="Diabaikan algoritma" />
      </div>

      <div className="grid grid-cols-12 items-start gap-6">
        <div className="col-span-8">
          <GraphVisualization />
        </div>
        <div className="col-span-4 space-y-6">
          <RouteSearch />
          <RouteResult />
        </div>
      </div>

      <DijkstraAnimation />
    </div>
  );
}
