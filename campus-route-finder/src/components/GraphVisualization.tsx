import { MousePointerClick, Network } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { useApp } from "../context/AppContext";
import { GRAPH_VIEWBOX, NODE_LABEL_SIDE, NODE_POSITIONS, NODE_RADIUS, buildingName, buildings, type LabelSide } from "../data/campus";
import { computeEdgeGeometries } from "../lib/graphGeometry";

const COLORS = {
  edge: "#cbd5e1",
  edgeHover: "#94a3b8",
  closed: "#cbd5e1",
  route: "#2563eb",
  evaluating: "#f59e0b",
  evaluatingSoft: "#fcd34d",
  nodeStroke: "#94b0d8",
  nodeText: "#12213f",
  visitedFill: "#dbeafe",
  visitedStroke: "#3b82f6",
  routeFill: "#eff6ff",
  routeStroke: "#2563eb",
  source: "#10b981",
  sourceStroke: "#047857",
  target: "#f97316",
  targetStroke: "#c2410c",
  currentFill: "#fef3c7",
  currentStroke: "#f59e0b",
};

function splitName(name: string): string[] {
  if (name.length <= 14) return [name];
  const words = name.split(" ");
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

function nameLayout(side: LabelSide, count: number, i: number): { x: number; y: number; anchor: "middle" | "start" | "end" } {
  const R = NODE_RADIUS;
  switch (side) {
    case "above":
      return { x: 0, y: -(R + 8) - (count - 1 - i) * 14, anchor: "middle" };
    case "right":
      return { x: R + 10, y: (i - (count - 1) / 2) * 14 + 4, anchor: "start" };
    case "left":
      return { x: -(R + 10), y: (i - (count - 1) / 2) * 14 + 4, anchor: "end" };
    default:
      return { x: 0, y: R + 15 + i * 14, anchor: "middle" };
  }
}

function formatDist(d: number | undefined): string {
  return d === undefined || !Number.isFinite(d) ? "∞" : String(d);
}

type Hover = { type: "edge"; id: number } | { type: "node"; id: string } | null;

export function GraphVisualization() {
  const { edges, sourceId, targetId, result, animation, flashEdgeId, selectFromGraph, openEdit } = useApp();
  const [hover, setHover] = useState<Hover>(null);

  const geometries = useMemo(() => computeEdgeGeometries(edges), [edges]);

  const step = animation.status !== "idle" ? animation.currentStep : null;
  const animating = step !== null;

  const srcId = animating ? animation.pair?.source ?? "" : sourceId;
  const tgtId = animating ? animation.pair?.target ?? "" : targetId;

  let routeEdges: number[] = [];
  let routeNodes: string[] = [];
  if (step) {
    if (step.type === "done" && step.found && animation.run) {
      routeEdges = animation.run.result.edgePath;
      routeNodes = animation.run.result.nodePath;
    }
  } else if (result?.found) {
    routeEdges = result.edgePath;
    routeNodes = result.nodePath;
  }
  const routeEdgeSet = new Set(routeEdges);
  const routeNodeSet = new Set(routeNodes);
  const routeKey = `${animating ? "a" : "s"}:${routeEdges.join("-")}`;

  const visitedSet = new Set(step?.visited ?? []);
  const distances = step?.distances;
  const currentNode = step && (step.type === "visit" || step.type === "evaluate") ? step.current : null;
  const evalEdgeId = step?.type === "evaluate" ? step.edgeId : null;
  const evalNeighbor = step?.type === "evaluate" ? step.neighbor : null;
  const evalImproved = step?.type === "evaluate" ? step.outcome === "improved" : false;

  const orderedEdges = [...edges].sort((a, b) => a.id - b.id);

  const hoverEdge = hover?.type === "edge" ? edges.find((e) => e.id === hover.id) : null;
  const hoverNode = hover?.type === "node" ? hover.id : null;

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
            <Network size={17} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-navy-900">Jaringan Graf Kampus</h2>
            <p className="text-xs text-slate-500">Visualisasi graf tidak berarah, bukan peta geografis</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MousePointerClick size={14} />
          Klik gedung untuk memilih asal/tujuan
        </div>
      </div>

      <div className="bg-[radial-gradient(circle_at_1px_1px,#e2e8f0_1px,transparent_0)] [background-size:22px_22px]">
        <svg
          viewBox={`0 0 ${GRAPH_VIEWBOX.width} ${GRAPH_VIEWBOX.height}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Graf jaringan jalur antar gedung kampus"
        >
          {/* 1. Jalur biasa (aktif / ditutup) */}
          <g>
            {orderedEdges.map((e) => {
              const g = geometries[e.id];
              if (!g) return null;
              const hovered = hover?.type === "edge" && hover.id === e.id;
              return (
                <path
                  key={`base-${e.id}`}
                  d={g.d}
                  fill="none"
                  stroke={hovered ? COLORS.edgeHover : e.closed ? COLORS.closed : COLORS.edge}
                  strokeWidth={e.closed ? 2 : hovered ? 4 : 3}
                  strokeDasharray={e.closed ? "3 7" : undefined}
                  strokeLinecap="round"
                  opacity={e.closed ? 0.85 : 1}
                  style={{ transition: "stroke 0.3s, stroke-width 0.2s, opacity 0.3s" }}
                />
              );
            })}
          </g>

          {/* 2. Jalur hasil pencarian (highlight, digambar bertahap) */}
          <g key={routeKey}>
            {routeEdges.map((id, i) => {
              const g = geometries[id];
              if (!g) return null;
              const style = {
                strokeDasharray: 1,
                strokeDashoffset: 1,
                animation: "draw-path 0.5s ease-out forwards",
                animationDelay: `${i * 0.3}s`,
                "--len": 1,
              } as CSSProperties;
              return (
                <path
                  key={`route-${id}`}
                  d={g.d}
                  pathLength={1}
                  fill="none"
                  stroke={COLORS.route}
                  strokeWidth={6}
                  strokeLinecap="round"
                  style={style}
                />
              );
            })}
          </g>

          {/* 3. Jalur yang sedang dievaluasi pada animasi */}
          {evalEdgeId !== null && geometries[evalEdgeId] && (
            <path
              key={`eval-${animation.stepIndex}`}
              d={geometries[evalEdgeId].d}
              fill="none"
              stroke={evalImproved ? COLORS.evaluating : COLORS.evaluatingSoft}
              strokeWidth={6}
              strokeLinecap="round"
              className="edge-flow"
            />
          )}

          {/* 4. Label jarak */}
          <g>
            {orderedEdges.map((e) => {
              const g = geometries[e.id];
              if (!g) return null;
              const text = `${e.distance} m`;
              const idText = `#${e.id}`;
              const w = (text.length + idText.length) * 6.6 + 22;
              const onRoute = routeEdgeSet.has(e.id);
              const evaluating = evalEdgeId === e.id;
              const flashing = flashEdgeId === e.id;
              const stroke = e.closed ? "#cbd5e1" : onRoute ? COLORS.route : evaluating ? COLORS.evaluating : "#e2e8f0";
              const fill = onRoute ? COLORS.route : evaluating ? "#fffbeb" : "#ffffff";
              return (
                <g
                  key={`label-${e.id}`}
                  transform={`translate(${g.label.x} ${g.label.y})`}
                  className="cursor-pointer"
                  onClick={() => openEdit(e.id)}
                  onMouseEnter={() => setHover({ type: "edge", id: e.id })}
                  onMouseLeave={() => setHover(null)}
                >
                  <g
                    className={flashing ? "animate-pop-in" : undefined}
                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  >
                    <rect
                      x={-w / 2}
                      y={-11}
                      width={w}
                      height={22}
                      rx={11}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={flashing ? 2.5 : 1.5}
                      style={{ transition: "fill 0.3s, stroke 0.3s" }}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={11}
                      fontWeight={600}
                      fill={onRoute ? "#ffffff" : e.closed ? "#94a3b8" : "#334155"}
                      textDecoration={e.closed ? "line-through" : undefined}
                    >
                      <tspan fill={onRoute ? "#bfdbfe" : "#94a3b8"} fontWeight={500}>
                        {idText}{" "}
                      </tspan>
                      {text}
                    </text>
                    {e.closed && (
                      <g transform={`translate(${w / 2 - 2} -9)`}>
                        <circle r={7} fill="#e11d48" />
                        <path d="M -2.5 -2.5 L 2.5 2.5 M 2.5 -2.5 L -2.5 2.5" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </g>

          {/* 5. Node gedung */}
          <g>
            {buildings.map((b) => {
              const pos = NODE_POSITIONS[b.id];
              const isSource = b.id === srcId;
              const isTarget = b.id === tgtId;
              const isCurrent = b.id === currentNode;
              const isNeighbor = b.id === evalNeighbor;
              const isVisited = visitedSet.has(b.id);
              const onRoute = routeNodeSet.has(b.id);

              let fill = "#ffffff";
              let stroke = COLORS.nodeStroke;
              let textColor = COLORS.nodeText;
              let strokeWidth = 2.5;
              if (onRoute) {
                fill = COLORS.routeFill;
                stroke = COLORS.routeStroke;
                strokeWidth = 3.5;
              }
              if (isVisited) {
                fill = COLORS.visitedFill;
                stroke = COLORS.visitedStroke;
              }
              if (isCurrent) {
                fill = COLORS.currentFill;
                stroke = COLORS.currentStroke;
                strokeWidth = 4;
              }
              if (isSource) {
                fill = COLORS.source;
                stroke = COLORS.sourceStroke;
                textColor = "#ffffff";
                strokeWidth = 3.5;
              } else if (isTarget) {
                fill = COLORS.target;
                stroke = COLORS.targetStroke;
                textColor = "#ffffff";
                strokeWidth = 3.5;
              }

              const lines = splitName(b.name);
              const dist = distances?.[b.id];
              const finalDist = isVisited;

              return (
                <g
                  key={b.id}
                  transform={`translate(${pos.x} ${pos.y})`}
                  className="cursor-pointer outline-none"
                  tabIndex={0}
                  role="button"
                  aria-label={`${b.id} ${b.name}`}
                  onClick={() => selectFromGraph(b.id)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      selectFromGraph(b.id);
                    }
                  }}
                  onMouseEnter={() => setHover({ type: "node", id: b.id })}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover({ type: "node", id: b.id })}
                  onBlur={() => setHover(null)}
                >
                  {isCurrent && (
                    <circle r={NODE_RADIUS} fill="none" stroke={COLORS.currentStroke} strokeWidth={3} className="animate-pulse-ring" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
                  )}
                  {isNeighbor && (
                    <circle r={NODE_RADIUS + 7} fill="none" stroke={COLORS.evaluating} strokeWidth={2.5} strokeDasharray="5 5" />
                  )}
                  <circle
                    r={NODE_RADIUS}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    style={{ transition: "fill 0.3s, stroke 0.3s", filter: "drop-shadow(0 2px 4px rgba(15,23,42,0.12))" }}
                  />
                  {hoverNode === b.id && <circle r={NODE_RADIUS + 5} fill="none" stroke="#60a5fa" strokeWidth={2} opacity={0.7} />}
                  <text textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={700} fill={textColor}>
                    {b.id}
                  </text>

                  {lines.map((line, i) => {
                    const pos2 = nameLayout(NODE_LABEL_SIDE[b.id] ?? "below", lines.length, i);
                    return (
                    <text
                      key={i}
                      x={pos2.x}
                      y={pos2.y}
                      textAnchor={pos2.anchor}
                      fontSize={12}
                      fontWeight={500}
                      fill="#334155"
                      stroke="#ffffff"
                      strokeWidth={4}
                      strokeLinejoin="round"
                      paintOrder="stroke"
                    >
                      {line}
                    </text>
                    );
                  })}

                  {animating && (
                    <g transform={`translate(${NODE_RADIUS - 2} ${-NODE_RADIUS + 2})`}>
                      <rect
                        x={-4}
                        y={-10}
                        width={Math.max(26, formatDist(dist).length * 8 + 12)}
                        height={20}
                        rx={10}
                        fill={finalDist ? "#1d4ed8" : Number.isFinite(dist) ? "#f59e0b" : "#94a3b8"}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                      <text
                        x={Math.max(26, formatDist(dist).length * 8 + 12) / 2 - 4}
                        dominantBaseline="central"
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={700}
                        fill="#ffffff"
                      >
                        {formatDist(dist)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="flex min-h-[44px] items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-xs">
        <div className="min-w-0 text-slate-600">
          {hoverEdge ? (
            <span>
              <strong className="text-navy-800">Jalur #{hoverEdge.id}</strong> · {hoverEdge.source} ({buildingName(hoverEdge.source)}) ↔{" "}
              {hoverEdge.target} ({buildingName(hoverEdge.target)}) · <strong>{hoverEdge.distance} m</strong>
              {hoverEdge.distance !== hoverEdge.originalDistance && <span className="text-slate-400"> (awal {hoverEdge.originalDistance} m)</span>} ·{" "}
              <span className={hoverEdge.closed ? "font-semibold text-rose-600" : "font-semibold text-emerald-600"}>
                {hoverEdge.closed ? "Ditutup" : "Aktif"}
              </span>
              <span className="text-slate-400"> · klik label untuk mengubah jarak</span>
            </span>
          ) : hoverNode ? (
            <span>
              <strong className="text-navy-800">{hoverNode}</strong> · {buildingName(hoverNode)}
              <span className="text-slate-400"> · klik untuk memilih sebagai asal / tujuan</span>
            </span>
          ) : (
            <span className="text-slate-400">Arahkan kursor ke gedung atau label jarak untuk melihat detail.</span>
          )}
        </div>
        <Legend animating={animating} />
      </div>
    </section>
  );
}

function Legend({ animating }: { animating: boolean }) {
  const items: { color: string; label: string; ring?: boolean; dashed?: boolean; line?: boolean }[] = [
    { color: COLORS.source, label: "Asal" },
    { color: COLORS.target, label: "Tujuan" },
    { color: COLORS.route, label: "Rute", line: true },
    ...(animating
      ? [
          { color: COLORS.currentStroke, label: "Diperiksa", ring: true },
          { color: COLORS.visitedStroke, label: "Dikunjungi", ring: true },
        ]
      : []),
    { color: "#94a3b8", label: "Ditutup", line: true, dashed: true },
  ];
  return (
    <ul className="flex shrink-0 items-center gap-3.5 text-slate-500">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          {it.line ? (
            <span
              className="inline-block w-4"
              style={{ borderTop: `3px ${it.dashed ? "dotted" : "solid"} ${it.color}` }}
            />
          ) : (
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={it.ring ? { border: `2px solid ${it.color}`, background: `${it.color}22` } : { background: it.color }}
            />
          )}
          {it.label}
        </li>
      ))}
    </ul>
  );
}
