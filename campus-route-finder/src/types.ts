export interface Building {
  id: string;
  name: string;
}

export interface Edge {
  id: number;
  source: string;
  target: string;
  /** Jarak saat ini (meter). Bisa diubah pengguna. */
  distance: number;
  /** Jarak awal (meter). Dipakai untuk reset dan perbandingan. */
  originalDistance: number;
  /** true = jalur ditutup dan tidak dipakai Dijkstra. */
  closed: boolean;
}

export interface Segment {
  edgeId: number;
  from: string;
  to: string;
  distance: number;
}

export interface RouteResult {
  found: boolean;
  source: string;
  target: string;
  totalDistance: number;
  /** Urutan gedung yang dilewati, dari asal sampai tujuan. */
  nodePath: string[];
  /** ID jalur yang dipakai, sesuai urutan segmen. */
  edgePath: number[];
  segments: Segment[];
}

export type EvaluateOutcome = "improved" | "not-better" | "already-final";

export type DijkstraStep =
  | {
      type: "init";
      distances: Record<string, number>;
      visited: string[];
      message: string;
    }
  | {
      type: "visit";
      current: string;
      distances: Record<string, number>;
      visited: string[];
      message: string;
    }
  | {
      type: "evaluate";
      current: string;
      neighbor: string;
      edgeId: number;
      candidate: number;
      outcome: EvaluateOutcome;
      distances: Record<string, number>;
      visited: string[];
      message: string;
    }
  | {
      type: "done";
      found: boolean;
      distances: Record<string, number>;
      visited: string[];
      message: string;
    };

export interface DijkstraRun {
  result: RouteResult;
  steps: DijkstraStep[];
}

export type PageId = "dashboard" | "route" | "graph" | "paths" | "about";
