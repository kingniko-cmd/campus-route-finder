import { describe, expect, it } from "vitest";
import { buildings, createInitialEdges } from "../data/campus";
import { buildAdjacencyList, findShortestPath, runDijkstra } from "./dijkstra";
import { MinHeap } from "./minHeap";
import { validateDistance } from "./validation";
import type { Edge } from "../types";

const ids = buildings.map((b) => b.id);

function edgesWith(patch: (e: Edge) => Edge): Edge[] {
  return createInitialEdges().map(patch);
}
function close(...closedIds: number[]): Edge[] {
  return edgesWith((e) => (closedIds.includes(e.id) ? { ...e, closed: true } : e));
}

describe("MinHeap", () => {
  it("mengeluarkan elemen berurutan dari prioritas terkecil", () => {
    const h = new MinHeap<string>();
    [5, 1, 9, 3, 7, 2].forEach((p) => h.push(`n${p}`, p));
    const out: number[] = [];
    while (h.size) out.push(h.pop()!.priority);
    expect(out).toEqual([1, 2, 3, 5, 7, 9]);
  });
});

describe("Dijkstra - data awal", () => {
  const edges = createInitialEdges();
  const cases: [string, string, number, string[], number[]][] = [
    ["G1", "G10", 550, ["G1", "G9", "G10"], [3, 18]],
    ["G1", "G8", 400, ["G1", "G4", "G8"], [2, 11]],
    ["G1", "G7", 440, ["G1", "G4", "G6", "G7"], [2, 10, 14]],
    ["G3", "G5", 140, ["G3", "G5"], [7]],
  ];
  it.each(cases)("%s → %s", (s, t, total, nodes, edgePath) => {
    const r = findShortestPath(ids, edges, s, t);
    expect(r.found).toBe(true);
    expect(r.totalDistance).toBe(total);
    expect(r.nodePath).toEqual(nodes);
    expect(r.edgePath).toEqual(edgePath);
    expect(r.segments.reduce((a, x) => a + x.distance, 0)).toBe(total);
  });

  it("asal sama dengan tujuan: 0 meter, satu gedung", () => {
    const r = findShortestPath(ids, edges, "G4", "G4");
    expect(r.found).toBe(true);
    expect(r.totalDistance).toBe(0);
    expect(r.nodePath).toEqual(["G4"]);
    expect(r.edgePath).toEqual([]);
  });

  it("graf bersifat tidak berarah (hasil simetris)", () => {
    for (const s of ids) {
      for (const t of ids) {
        const a = findShortestPath(ids, edges, s, t).totalDistance;
        const b = findShortestPath(ids, edges, t, s).totalDistance;
        expect(a).toBe(b);
      }
    }
  });
});

describe("Jalur paralel G3-G5", () => {
  it("adjacency list menyimpan kedua jalur (7 dan 8) terpisah", () => {
    const adj = buildAdjacencyList(ids, createInitialEdges());
    const g3 = adj.get("G3")!.filter((x) => x.neighbor === "G5");
    expect(g3.map((x) => x.edgeId)).toEqual([7, 8]);
  });
  it("tutup jalur 7 → pakai G3,G4,G5 (190) karena lebih pendek dari jalur 8 (200)", () => {
    const r = findShortestPath(ids, close(7), "G3", "G5");
    expect(r.totalDistance).toBe(190);
    expect(r.nodePath).toEqual(["G3", "G4", "G5"]);
    expect(r.edgePath).toEqual([6, 9]);
  });
  it("tutup jalur 6 dan 7 → pakai jalur paralel kedua (#8) 200 m", () => {
    const r = findShortestPath(ids, close(6, 7), "G3", "G5");
    expect(r.totalDistance).toBe(200);
    expect(r.edgePath).toEqual([8]);
  });
  it("tutup 6, 7, 8 → G3,G2,G4,G5 (300)", () => {
    const r = findShortestPath(ids, close(6, 7, 8), "G3", "G5");
    expect(r.totalDistance).toBe(300);
    expect(r.nodePath).toEqual(["G3", "G2", "G4", "G5"]);
    expect(r.edgePath).toEqual([4, 5, 9]);
  });
  it("jalur 8 dipilih bila jaraknya diubah lebih pendek dari jalur 7", () => {
    const edges = edgesWith((e) => (e.id === 8 ? { ...e, distance: 50 } : e));
    const r = findShortestPath(ids, edges, "G3", "G5");
    expect(r.totalDistance).toBe(50);
    expect(r.edgePath).toEqual([8]);
  });
});

describe("Perubahan jarak dan penutupan jalur", () => {
  it("mengubah jarak jalur 18 langsung memengaruhi hasil", () => {
    const edges = edgesWith((e) => (e.id === 18 ? { ...e, distance: 100 } : e));
    const r = findShortestPath(ids, edges, "G1", "G10");
    expect(r.totalDistance).toBe(350);
    expect(r.edgePath).toEqual([3, 18]);
  });
  it("jarak jalur 3 diperbesar → rute lain lebih pendek", () => {
    const edges = edgesWith((e) => (e.id === 3 ? { ...e, distance: 900 } : e));
    const r = findShortestPath(ids, edges, "G1", "G10");
    expect(r.totalDistance).toBe(580); // G1-G4(180)+G4-G8(220)+G8-G10(180)
    expect(r.edgePath).toEqual([2, 11, 17]);
  });
  it("tutup jalur 3: G1 → G9 lewat G10 (880)", () => {
    const r = findShortestPath(ids, close(3), "G1", "G9");
    expect(r.totalDistance).toBe(880);
    expect(r.edgePath).toEqual([2, 11, 17, 18]);
  });
  it("tutup jalur 3 dan 18: G9 terisolasi → rute tidak tersedia", () => {
    const r = findShortestPath(ids, close(3, 18), "G1", "G9");
    expect(r.found).toBe(false);
    expect(r.nodePath).toEqual([]);
  });
  it("tutup jalur 17 dan 18: G10 terisolasi", () => {
    const r = findShortestPath(ids, close(17, 18), "G1", "G10");
    expect(r.found).toBe(false);
  });
  it("membuka kembali jalur memulihkan rute", () => {
    const closed = close(3, 18);
    expect(findShortestPath(ids, closed, "G1", "G9").found).toBe(false);
    const reopened = closed.map((e) => ({ ...e, closed: false }));
    expect(findShortestPath(ids, reopened, "G1", "G9").totalDistance).toBe(250);
  });
  it("jalur yang ditutup tidak pernah muncul pada rute", () => {
    const closedIds = [2, 5, 7, 11];
    const edges = close(...closedIds);
    for (const s of ids) {
      for (const t of ids) {
        const r = findShortestPath(ids, edges, s, t);
        for (const id of r.edgePath) expect(closedIds).not.toContain(id);
      }
    }
  });
});

describe("Langkah animasi", () => {
  it("dimulai dengan init, berakhir dengan done, hasil sama dengan pencarian biasa", () => {
    const edges = createInitialEdges();
    const run = runDijkstra(ids, edges, "G1", "G10");
    expect(run.steps[0].type).toBe("init");
    expect(run.steps[run.steps.length - 1].type).toBe("done");
    expect(run.result).toEqual(findShortestPath(ids, edges, "G1", "G10"));
  });
  it("jarak node sumber 0 dan node lain ∞ pada langkah awal", () => {
    const run = runDijkstra(ids, createInitialEdges(), "G1", "G10");
    const d = run.steps[0].distances;
    expect(d.G1).toBe(0);
    expect(d.G2).toBe(Infinity);
  });
  it("urutan kunjungan nondecreasing dalam jarak (sifat Dijkstra)", () => {
    const run = runDijkstra(ids, createInitialEdges(), "G1", "G10");
    const last = run.steps[run.steps.length - 1];
    const dists = last.visited.map((v) => last.distances[v]);
    expect([...dists].sort((a, b) => a - b)).toEqual(dists);
  });
  it("rute tidak tersedia menghasilkan langkah done found=false", () => {
    const run = runDijkstra(ids, close(3, 18), "G1", "G9");
    const last = run.steps[run.steps.length - 1];
    expect(last.type).toBe("done");
    expect(last.type === "done" && last.found).toBe(false);
  });
});

describe("Validasi jarak", () => {
  it.each(["1", "50", " 120 ", "99999"])("menerima %j", (v) => {
    expect(validateDistance(v).valid).toBe(true);
  });
  it.each(["", "   ", "0", "-5", "3.5", "abc", "12a", "1e3", "+5", "007"])("menolak %j", (v) => {
    expect(validateDistance(v).valid).toBe(false);
  });
});
