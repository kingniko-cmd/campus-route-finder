import type { DijkstraRun, DijkstraStep, Edge, RouteResult, Segment } from "../types";
import { MinHeap } from "./minHeap";

export interface AdjacencyEntry {
  neighbor: string;
  edgeId: number;
  distance: number;
}

export type AdjacencyList = Map<string, AdjacencyEntry[]>;

/**
 * Membangun adjacency list graf tidak berarah.
 * Jalur yang ditutup diabaikan. Setiap jalur (termasuk jalur paralel)
 * menjadi entri tersendiri dengan edgeId unik.
 */
export function buildAdjacencyList(nodeIds: string[], edges: Edge[]): AdjacencyList {
  const adj: AdjacencyList = new Map();
  for (const id of nodeIds) adj.set(id, []);
  for (const e of edges) {
    if (e.closed) continue;
    adj.get(e.source)?.push({ neighbor: e.target, edgeId: e.id, distance: e.distance });
    adj.get(e.target)?.push({ neighbor: e.source, edgeId: e.id, distance: e.distance });
  }
  // Urutan deterministik: berdasarkan ID jalur.
  for (const list of adj.values()) list.sort((a, b) => a.edgeId - b.edgeId);
  return adj;
}

/**
 * Dijkstra dengan min-heap (lazy deletion) dan perekaman langkah untuk animasi.
 * Fungsi yang sama dipakai untuk pencarian biasa dan animasi.
 */
export function runDijkstra(
  nodeIds: string[],
  edges: Edge[],
  source: string,
  target: string,
): DijkstraRun {
  const steps: DijkstraStep[] = [];
  const adj = buildAdjacencyList(nodeIds, edges);

  const dist: Record<string, number> = {};
  const prev: Record<string, { node: string; edgeId: number; distance: number } | null> = {};
  for (const id of nodeIds) {
    dist[id] = Infinity;
    prev[id] = null;
  }
  const visited = new Set<string>();
  const visitedOrder: string[] = [];

  const snapshot = () => ({ distances: { ...dist }, visited: [...visitedOrder] });

  const notFound = (): RouteResult => ({
    found: false,
    source,
    target,
    totalDistance: 0,
    nodePath: [],
    edgePath: [],
    segments: [],
  });

  if (!adj.has(source) || !adj.has(target)) {
    steps.push({
      type: "done",
      found: false,
      ...snapshot(),
      message: "Gedung asal atau tujuan tidak valid.",
    });
    return { result: notFound(), steps };
  }

  dist[source] = 0;
  const heap = new MinHeap<string>();
  heap.push(source, 0);
  steps.push({
    type: "init",
    ...snapshot(),
    message: `Inisialisasi: jarak ${source} = 0, semua gedung lain = ∞.`,
  });

  let reached = false;

  while (heap.size > 0) {
    const popped = heap.pop()!;
    const u = popped.value;
    // Entri basi (sudah ada jarak yang lebih baik / sudah final): lewati.
    if (visited.has(u) || popped.priority > dist[u]) continue;

    visited.add(u);
    visitedOrder.push(u);
    steps.push({
      type: "visit",
      current: u,
      ...snapshot(),
      message: `Periksa ${u} (jarak sementara ${dist[u]} m). Jarak ini sudah final.`,
    });

    if (u === target) {
      reached = true;
      break;
    }

    for (const { neighbor, edgeId, distance } of adj.get(u) ?? []) {
      const candidate = dist[u] + distance;
      if (visited.has(neighbor)) {
        steps.push({
          type: "evaluate",
          current: u,
          neighbor,
          edgeId,
          candidate,
          outcome: "already-final",
          ...snapshot(),
          message: `Jalur #${edgeId} ke ${neighbor}: ${neighbor} sudah final, dilewati.`,
        });
        continue;
      }
      if (candidate < dist[neighbor]) {
        const old = dist[neighbor];
        dist[neighbor] = candidate;
        prev[neighbor] = { node: u, edgeId, distance };
        heap.push(neighbor, candidate);
        steps.push({
          type: "evaluate",
          current: u,
          neighbor,
          edgeId,
          candidate,
          outcome: "improved",
          ...snapshot(),
          message: `Jalur #${edgeId} ke ${neighbor}: ${dist[u]} + ${distance} = ${candidate} m lebih kecil dari ${
            old === Infinity ? "∞" : old + " m"
          }. Jarak ${neighbor} diperbarui.`,
        });
      } else {
        steps.push({
          type: "evaluate",
          current: u,
          neighbor,
          edgeId,
          candidate,
          outcome: "not-better",
          ...snapshot(),
          message: `Jalur #${edgeId} ke ${neighbor}: ${candidate} m tidak lebih baik dari ${dist[neighbor]} m.`,
        });
      }
    }
  }

  if (!reached) {
    steps.push({
      type: "done",
      found: false,
      ...snapshot(),
      message: `Selesai: ${target} tidak dapat dijangkau dari ${source}. Rute tidak tersedia.`,
    });
    return { result: notFound(), steps };
  }

  // Rekonstruksi rute dari predecessor (menyimpan edgeId agar jalur paralel dapat dibedakan).
  const nodePath: string[] = [target];
  const edgePath: number[] = [];
  const segments: Segment[] = [];
  let cur = target;
  while (cur !== source) {
    const p = prev[cur];
    if (!p) break;
    segments.unshift({ edgeId: p.edgeId, from: p.node, to: cur, distance: p.distance });
    edgePath.unshift(p.edgeId);
    nodePath.unshift(p.node);
    cur = p.node;
  }

  const result: RouteResult = {
    found: true,
    source,
    target,
    totalDistance: dist[target],
    nodePath,
    edgePath,
    segments,
  };

  steps.push({
    type: "done",
    found: true,
    ...snapshot(),
    message: `Selesai: rute terpendek ${source} → ${target} adalah ${dist[target]} m.`,
  });

  return { result, steps };
}

/** Pencarian rute terpendek tanpa langkah animasi. */
export function findShortestPath(
  nodeIds: string[],
  edges: Edge[],
  source: string,
  target: string,
): RouteResult {
  return runDijkstra(nodeIds, edges, source, target).result;
}
