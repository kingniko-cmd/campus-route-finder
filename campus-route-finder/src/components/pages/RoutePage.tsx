import { DijkstraAnimation } from "../DijkstraAnimation";
import { GraphVisualization } from "../GraphVisualization";
import { RouteResult } from "../RouteResult";
import { RouteSearch } from "../RouteSearch";

export function RoutePage() {
  return (
    <div className="grid grid-cols-12 items-start gap-6">
      <div className="col-span-4 space-y-6">
        <RouteSearch />
        <RouteResult />
      </div>
      <div className="col-span-8 space-y-6">
        <GraphVisualization />
        <DijkstraAnimation />
      </div>
    </div>
  );
}
