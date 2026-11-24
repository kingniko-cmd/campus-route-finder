import { useCallback, useEffect, useMemo, useState } from "react";
import { runDijkstra } from "../lib/dijkstra";
import type { DijkstraRun, DijkstraStep, Edge } from "../types";

export type AnimationStatus = "idle" | "playing" | "paused" | "finished";

export const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 3] as const;
const BASE_DELAY_MS = 1000;

export interface AnimationApi {
  status: AnimationStatus;
  speed: number;
  pair: { source: string; target: string } | null;
  run: DijkstraRun | null;
  stepIndex: number;
  totalSteps: number;
  currentStep: DijkstraStep | null;
  start: (source: string, target: string) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
}

/**
 * Memutar ulang langkah-langkah Dijkstra yang direkam oleh `runDijkstra`.
 * Animasi menampilkan proses algoritma yang sebenarnya, bukan efek dekoratif.
 */
export function useDijkstraAnimation(nodeIds: string[], edges: Edge[]): AnimationApi {
  const [pair, setPair] = useState<{ source: string; target: string } | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [status, setStatus] = useState<AnimationStatus>("idle");
  const [speed, setSpeed] = useState<number>(1);

  const run = useMemo(
    () => (pair ? runDijkstra(nodeIds, edges, pair.source, pair.target) : null),
    [pair, nodeIds, edges],
  );

  const totalSteps = run?.steps.length ?? 0;
  const safeIndex = totalSteps > 0 ? Math.min(stepIndex, totalSteps - 1) : 0;
  const currentStep = run && totalSteps > 0 ? run.steps[safeIndex] : null;

  useEffect(() => {
    if (status !== "playing" || !run) return;
    if (stepIndex >= run.steps.length - 1) {
      setStatus("finished");
      return;
    }
    const timer = setTimeout(() => setStepIndex((i) => i + 1), BASE_DELAY_MS / speed);
    return () => clearTimeout(timer);
  }, [status, stepIndex, run, speed]);

  const start = useCallback((source: string, target: string) => {
    setPair({ source, target });
    setStepIndex(0);
    setStatus("playing");
  }, []);

  const pause = useCallback(() => setStatus((s) => (s === "playing" ? "paused" : s)), []);
  const resume = useCallback(() => setStatus((s) => (s === "paused" ? "playing" : s)), []);

  const reset = useCallback(() => {
    setStatus("idle");
    setStepIndex(0);
    setPair(null);
  }, []);

  return {
    status,
    speed,
    pair,
    run,
    stepIndex: safeIndex,
    totalSteps,
    currentStep,
    start,
    pause,
    resume,
    reset,
    setSpeed,
  };
}
