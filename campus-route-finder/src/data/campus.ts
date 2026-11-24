import type { Building, Edge } from "../types";

export const buildings: Building[] = [
  { id: "G1", name: "Gerbang Utama" },
  { id: "G2", name: "Perpustakaan" },
  { id: "G3", name: "Laboratorium Komputer" },
  { id: "G4", name: "Gedung Kuliah A" },
  { id: "G5", name: "Gedung Kuliah B" },
  { id: "G6", name: "Auditorium" },
  { id: "G7", name: "Pusat Kegiatan Mahasiswa" },
  { id: "G8", name: "Kantin" },
  { id: "G9", name: "Gedung Rektorat" },
  { id: "G10", name: "Asrama Mahasiswa" },
];

export const initialEdges: ReadonlyArray<{
  id: number;
  source: string;
  target: string;
  distance: number;
}> = [
  { id: 1, source: "G1", target: "G2", distance: 120 },
  { id: 2, source: "G1", target: "G4", distance: 180 },
  { id: 3, source: "G1", target: "G9", distance: 250 },
  { id: 4, source: "G2", target: "G3", distance: 100 },
  { id: 5, source: "G2", target: "G4", distance: 90 },
  { id: 6, source: "G3", target: "G4", distance: 80 },
  { id: 7, source: "G3", target: "G5", distance: 140 },
  { id: 8, source: "G3", target: "G5", distance: 200 },
  { id: 9, source: "G4", target: "G5", distance: 110 },
  { id: 10, source: "G4", target: "G6", distance: 160 },
  { id: 11, source: "G4", target: "G8", distance: 220 },
  { id: 12, source: "G5", target: "G6", distance: 130 },
  { id: 13, source: "G5", target: "G7", distance: 170 },
  { id: 14, source: "G6", target: "G7", distance: 100 },
  { id: 15, source: "G6", target: "G8", distance: 150 },
  { id: 16, source: "G7", target: "G8", distance: 90 },
  { id: 17, source: "G8", target: "G10", distance: 180 },
  { id: 18, source: "G9", target: "G10", distance: 300 },
];

/** Membuat salinan data jalur awal (semua aktif, jarak = jarak awal). */
export function createInitialEdges(): Edge[] {
  return initialEdges.map((e) => ({
    ...e,
    originalDistance: e.distance,
    closed: false,
  }));
}

/** Posisi node pada kanvas SVG (viewBox 1000 x 640). Murni tata letak graf, bukan peta geografis. */
export const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  G1: { x: 60, y: 300 },
  G2: { x: 250, y: 120 },
  G3: { x: 500, y: 90 },
  G4: { x: 330, y: 310 },
  G5: { x: 650, y: 200 },
  G6: { x: 620, y: 380 },
  G7: { x: 880, y: 300 },
  G8: { x: 800, y: 540 },
  G9: { x: 110, y: 550 },
  G10: { x: 450, y: 570 },
};

/** Sisi tempat nama gedung diletakkan agar tidak menabrak garis jalur atau label jarak. */
export type LabelSide = "below" | "above" | "left" | "right";
export const NODE_LABEL_SIDE: Record<string, LabelSide> = {
  G1: "above",
  G2: "above",
  G3: "above",
  G4: "below",
  G5: "above",
  G6: "right",
  G7: "above",
  G8: "right",
  G9: "below",
  G10: "below",
};

export const GRAPH_VIEWBOX = { width: 1000, height: 640 };
export const NODE_RADIUS = 30;

export function buildingName(id: string): string {
  return buildings.find((b) => b.id === id)?.name ?? id;
}
