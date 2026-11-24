import type { Edge } from "../types";
import { NODE_POSITIONS, NODE_RADIUS } from "../data/campus";

export interface EdgeGeometry {
  /** Atribut `d` untuk elemen <path>. */
  d: string;
  /** Titik label jarak (di tengah kurva/garis). */
  label: { x: number; y: number };
}

const PARALLEL_OFFSET = 38;

/**
 * Menghitung geometri tiap jalur. Jalur tunggal = garis lurus.
 * Jalur paralel (pasangan node yang sama) = kurva kuadratik dengan offset
 * tegak lurus berlawanan, sehingga tampil sebagai dua garis terpisah.
 */
export function computeEdgeGeometries(edges: Edge[]): Record<number, EdgeGeometry> {
  const groups = new Map<string, Edge[]>();
  for (const e of edges) {
    const key = [e.source, e.target].sort().join("|");
    const list = groups.get(key) ?? [];
    list.push(e);
    groups.set(key, list);
  }

  const out: Record<number, EdgeGeometry> = {};
  for (const list of groups.values()) {
    list.sort((a, b) => a.id - b.id);
    list.forEach((e, idx) => {
      const a = NODE_POSITIONS[e.source];
      const b = NODE_POSITIONS[e.target];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      // Normal terhadap arah garis.
      const nx = -uy;
      const ny = ux;

      // Offset simetris: [-k..+k] dengan jarak PARALLEL_OFFSET.
      const offset = (idx - (list.length - 1) / 2) * 2 * PARALLEL_OFFSET;

      const sx = a.x + ux * NODE_RADIUS;
      const sy = a.y + uy * NODE_RADIUS;
      const ex = b.x - ux * NODE_RADIUS;
      const ey = b.y - uy * NODE_RADIUS;

      if (offset === 0) {
        out[e.id] = {
          d: `M ${sx} ${sy} L ${ex} ${ey}`,
          label: { x: (sx + ex) / 2, y: (sy + ey) / 2 },
        };
      } else {
        const mx = (a.x + b.x) / 2 + nx * offset * 2;
        const my = (a.y + b.y) / 2 + ny * offset * 2;
        // Titik tengah kurva kuadratik pada t = 0.5.
        const cx = 0.25 * a.x + 0.5 * mx + 0.25 * b.x;
        const cy = 0.25 * a.y + 0.5 * my + 0.25 * b.y;
        out[e.id] = {
          d: `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`,
          label: { x: cx, y: cy },
        };
      }
    });
  }
  return out;
}
