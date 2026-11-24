import { DijkstraAnimation } from "../DijkstraAnimation";
import { GraphVisualization } from "../GraphVisualization";
import { RouteSearch } from "../RouteSearch";

export function GraphPage() {
  return (
    <div className="space-y-6">
      <RouteSearch layout="inline" />
      <GraphVisualization />
      <DijkstraAnimation />
    </div>
  );
}
