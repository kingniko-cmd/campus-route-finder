import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { buildingName, buildings, createInitialEdges } from "../data/campus";
import { useDijkstraAnimation, type AnimationApi } from "../hooks/useDijkstraAnimation";
import { findShortestPath } from "../lib/dijkstra";
import type { Edge, PageId, RouteResult } from "../types";
import { useToast } from "./ToastContext";

const NODE_IDS = buildings.map((b) => b.id);
const SEARCH_DELAY_MS = 450;
const FLASH_DURATION_MS = 1100;

interface AppContextValue {
  page: PageId;
  setPage: (page: PageId) => void;

  edges: Edge[];
  stats: { totalBuildings: number; totalEdges: number; activeEdges: number; closedEdges: number };

  sourceId: string;
  targetId: string;
  setSourceId: (id: string) => void;
  setTargetId: (id: string) => void;
  swapSelection: () => void;
  selectFromGraph: (id: string) => void;

  isSearching: boolean;
  hasSearched: boolean;
  result: RouteResult | null;
  searchRoute: () => void;

  animation: AnimationApi;
  startAnimation: () => void;

  updateDistance: (id: number, distance: number) => void;
  closeEdge: (id: number) => void;
  openEdge: (id: number) => void;
  flashEdgeId: number | null;

  editingEdgeId: number | null;
  openEdit: (id: number) => void;
  closeEdit: () => void;

  resetConfirmOpen: boolean;
  requestReset: () => void;
  cancelReset: () => void;
  confirmReset: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { push: pushToast } = useToast();

  const [page, setPageState] = useState<PageId>("dashboard");
  const [edges, setEdges] = useState<Edge[]>(() => createInitialEdges());
  const [sourceId, setSourceState] = useState("");
  const [targetId, setTargetState] = useState("");
  const [searched, setSearched] = useState<{ source: string; target: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [editingEdgeId, setEditingEdgeId] = useState<number | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [flashEdgeId, setFlashEdgeId] = useState<number | null>(null);

  const edgesRef = useRef(edges);
  edgesRef.current = edges;
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animation = useDijkstraAnimation(NODE_IDS, edges);
  const animationReset = animation.reset;
  const animationStart = animation.start;

  useEffect(
    () => () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    [],
  );

  // Hasil selalu dihitung ulang dari data jalur terbaru (tidak ada hasil yang disimpan/hardcode).
  const result = useMemo<RouteResult | null>(
    () => (searched ? findShortestPath(NODE_IDS, edges, searched.source, searched.target) : null),
    [searched, edges],
  );

  const stats = useMemo(() => {
    const closedEdges = edges.filter((e) => e.closed).length;
    return {
      totalBuildings: buildings.length,
      totalEdges: edges.length,
      activeEdges: edges.length - closedEdges,
      closedEdges,
    };
  }, [edges]);

  const cancelSearch = useCallback(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = null;
    setIsSearching(false);
  }, []);

  const clearResults = useCallback(() => {
    cancelSearch();
    setSearched(null);
    animationReset();
  }, [cancelSearch, animationReset]);

  const setPage = useCallback((p: PageId) => setPageState(p), []);

  const setSourceId = useCallback(
    (id: string) => {
      setSourceState(id);
      clearResults();
    },
    [clearResults],
  );

  const setTargetId = useCallback(
    (id: string) => {
      setTargetState(id);
      clearResults();
    },
    [clearResults],
  );

  const swapSelection = useCallback(() => {
    setSourceState(targetId);
    setTargetState(sourceId);
    clearResults();
  }, [sourceId, targetId, clearResults]);

  const selectFromGraph = useCallback(
    (id: string) => {
      clearResults();
      if (!sourceId) {
        setSourceState(id);
        pushToast({ kind: "info", title: "Gedung asal dipilih", message: `${id} · ${buildingName(id)}` });
      } else if (!targetId) {
        setTargetState(id);
        pushToast({ kind: "info", title: "Gedung tujuan dipilih", message: `${id} · ${buildingName(id)}` });
      } else {
        setSourceState(id);
        setTargetState("");
        pushToast({ kind: "info", title: "Pilihan diulang", message: `Gedung asal: ${id} · ${buildingName(id)}` });
      }
    },
    [sourceId, targetId, clearResults, pushToast],
  );

  const searchRoute = useCallback(() => {
    if (!sourceId || !targetId) {
      pushToast({
        kind: "warning",
        title: "Pilihan belum lengkap",
        message: "Pilih gedung asal dan gedung tujuan terlebih dahulu.",
      });
      return;
    }
    animationReset();
    setSearched(null);
    setIsSearching(true);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      searchTimer.current = null;
      const r = findShortestPath(NODE_IDS, edgesRef.current, sourceId, targetId);
      setSearched({ source: sourceId, target: targetId });
      setIsSearching(false);
      if (r.found) {
        pushToast({
          kind: "success",
          title: "Rute ditemukan",
          message:
            r.nodePath.length === 1
              ? `${sourceId} sama dengan tujuan · 0 meter`
              : `${sourceId} → ${targetId} · ${r.totalDistance} meter`,
        });
      } else {
        pushToast({
          kind: "error",
          title: "Rute tidak tersedia",
          message: `Tidak ada jalur aktif yang menghubungkan ${sourceId} dan ${targetId}.`,
        });
      }
    }, SEARCH_DELAY_MS);
  }, [sourceId, targetId, pushToast, animationReset]);

  const startAnimation = useCallback(() => {
    if (!sourceId || !targetId) {
      pushToast({
        kind: "warning",
        title: "Pilihan belum lengkap",
        message: "Pilih gedung asal dan tujuan sebelum memulai animasi.",
      });
      return;
    }
    cancelSearch();
    animationStart(sourceId, targetId);
    pushToast({ kind: "info", title: "Animasi dimulai", message: `Dijkstra ${sourceId} → ${targetId}` });
  }, [sourceId, targetId, animationStart, cancelSearch, pushToast]);

  const flash = useCallback((id: number) => {
    setFlashEdgeId(id);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashEdgeId(null), FLASH_DURATION_MS);
  }, []);

  const updateDistance = useCallback(
    (id: number, distance: number) => {
      const current = edgesRef.current.find((e) => e.id === id);
      if (!current) return;
      setEdges((list) => list.map((e) => (e.id === id ? { ...e, distance } : e)));
      animationReset();
      flash(id);
      pushToast({
        kind: "success",
        title: `Jarak jalur #${id} diperbarui`,
        message: `${current.distance} m → ${distance} m`,
      });
    },
    [animationReset, flash, pushToast],
  );

  const closeEdge = useCallback(
    (id: number) => {
      setEdges((list) => list.map((e) => (e.id === id ? { ...e, closed: true } : e)));
      animationReset();
      flash(id);
      pushToast({
        kind: "warning",
        title: `Jalur #${id} ditutup`,
        message: "Jalur ini tidak akan dipakai dalam pencarian rute.",
      });
    },
    [animationReset, flash, pushToast],
  );

  const openEdge = useCallback(
    (id: number) => {
      setEdges((list) => list.map((e) => (e.id === id ? { ...e, closed: false } : e)));
      animationReset();
      flash(id);
      pushToast({
        kind: "success",
        title: `Jalur #${id} dibuka kembali`,
        message: "Jalur ini kembali dapat digunakan.",
      });
    },
    [animationReset, flash, pushToast],
  );

  const openEdit = useCallback((id: number) => setEditingEdgeId(id), []);
  const closeEdit = useCallback(() => setEditingEdgeId(null), []);

  const requestReset = useCallback(() => setResetConfirmOpen(true), []);
  const cancelReset = useCallback(() => setResetConfirmOpen(false), []);

  const confirmReset = useCallback(() => {
    setEdges(createInitialEdges());
    setSourceState("");
    setTargetState("");
    setSearched(null);
    cancelSearch();
    animationReset();
    setEditingEdgeId(null);
    setFlashEdgeId(null);
    setResetConfirmOpen(false);
    pushToast({
      kind: "success",
      title: "Data berhasil direset",
      message: "Semua jarak kembali ke nilai awal dan semua jalur aktif.",
    });
  }, [cancelSearch, animationReset, pushToast]);

  const value: AppContextValue = {
    page,
    setPage,
    edges,
    stats,
    sourceId,
    targetId,
    setSourceId,
    setTargetId,
    swapSelection,
    selectFromGraph,
    isSearching,
    hasSearched: searched !== null,
    result,
    searchRoute,
    animation,
    startAnimation,
    updateDistance,
    closeEdge,
    openEdge,
    flashEdgeId,
    editingEdgeId,
    openEdit,
    closeEdit,
    resetConfirmOpen,
    requestReset,
    cancelReset,
    confirmReset,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp harus dipakai di dalam AppProvider");
  return ctx;
}
