import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { buildingName, buildings } from "../data/campus";
import { SPEED_OPTIONS } from "../hooks/useDijkstraAnimation";
import type { DijkstraStep } from "../types";

function stepTone(step: DijkstraStep): string {
  switch (step.type) {
    case "init":
      return "bg-slate-100 text-slate-600";
    case "visit":
      return "bg-brand-100 text-brand-700";
    case "evaluate":
      return step.outcome === "improved" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500";
    case "done":
      return step.found ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700";
  }
}

function stepLabel(step: DijkstraStep): string {
  switch (step.type) {
    case "init":
      return "Mulai";
    case "visit":
      return "Periksa";
    case "evaluate":
      return step.outcome === "improved" ? "Perbarui" : "Lewati";
    case "done":
      return "Selesai";
  }
}

export function DijkstraAnimation() {
  const { animation, startAnimation, sourceId, targetId } = useApp();
  const { status, speed, run, stepIndex, totalSteps, currentStep } = animation;
  const logRef = useRef<HTMLOListElement>(null);

  const visibleSteps = run ? run.steps.slice(0, stepIndex + 1) : [];

  useEffect(() => {
    // Gulirkan log ke langkah terbaru.
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [stepIndex, status]);

  const idle = status === "idle";
  const progress = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : idle ? 0 : 100;

  const currentNode = currentStep && (currentStep.type === "visit" || currentStep.type === "evaluate") ? currentStep.current : null;
  const evalNeighbor = currentStep?.type === "evaluate" ? currentStep.neighbor : null;
  const visited = new Set(currentStep?.visited ?? []);

  const statusText =
    status === "playing" ? "Berjalan" : status === "paused" ? "Dijeda" : status === "finished" ? "Selesai" : "Siap";
  const statusClass =
    status === "playing"
      ? "bg-brand-100 text-brand-700"
      : status === "paused"
        ? "bg-amber-100 text-amber-700"
        : status === "finished"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-500";

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-navy-900">
            Animasi Algoritma Dijkstra
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass}`}>{statusText}</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {animation.pair
              ? `Rute ${animation.pair.source} → ${animation.pair.target}`
              : sourceId && targetId
                ? `Siap menganimasikan ${sourceId} → ${targetId}`
                : "Pilih gedung asal dan tujuan, lalu mulai animasi."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-primary !py-2" onClick={startAnimation} disabled={status === "playing" || status === "paused"}>
            <Play size={15} />
            Mulai Animasi
          </button>
          <button className="btn-secondary !py-2" onClick={animation.pause} disabled={status !== "playing"}>
            <Pause size={15} />
            Pause
          </button>
          <button className="btn-secondary !py-2" onClick={animation.resume} disabled={status !== "paused"}>
            <SkipForward size={15} />
            Lanjutkan
          </button>
          <button className="btn-secondary !py-2" onClick={animation.reset} disabled={idle}>
            <RotateCcw size={15} />
            Reset Animasi
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-5">
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-[11px] text-slate-500">
            <span>{idle ? "Belum dimulai" : `Langkah ${stepIndex + 1} dari ${totalSteps}`}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Kecepatan</span>
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5" role="group" aria-label="Kecepatan animasi">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => animation.setSpeed(s)}
                aria-pressed={speed === s}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  speed === s ? "bg-white text-navy-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`mt-4 min-h-[48px] rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
          currentStep ? "border-brand-200 bg-brand-50/60 text-navy-800" : "border-dashed border-slate-200 text-slate-400"
        }`}
        aria-live="polite"
      >
        {currentStep ? currentStep.message : "Penjelasan setiap langkah algoritma akan muncul di sini."}
      </div>

      <div className="mt-4 grid grid-cols-5 gap-5">
        <div className="col-span-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Jarak sementara tiap gedung</h3>
          <div className="overflow-hidden rounded-lg border border-slate-100">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Gedung</th>
                  <th className="px-3 py-2 text-right font-semibold">Jarak</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buildings.map((b) => {
                  const d = currentStep?.distances[b.id];
                  const isCurrent = b.id === currentNode;
                  const isNeighbor = b.id === evalNeighbor;
                  const isVisited = visited.has(b.id);
                  let label = "—";
                  let chip = "text-slate-300";
                  if (currentStep) {
                    if (isCurrent) {
                      label = "Diperiksa";
                      chip = "bg-amber-100 text-amber-700";
                    } else if (isVisited) {
                      label = "Dikunjungi";
                      chip = "bg-brand-100 text-brand-700";
                    } else if (isNeighbor) {
                      label = "Dievaluasi";
                      chip = "bg-amber-50 text-amber-600";
                    } else if (d !== undefined && Number.isFinite(d)) {
                      label = "Sementara";
                      chip = "bg-slate-100 text-slate-600";
                    } else {
                      label = "Belum dijangkau";
                      chip = "text-slate-400";
                    }
                  }
                  return (
                    <tr key={b.id} className={isCurrent ? "bg-amber-50/60" : ""}>
                      <td className="px-3 py-1.5">
                        <span className="font-semibold text-navy-800">{b.id}</span>{" "}
                        <span className="text-slate-500">{buildingName(b.id)}</span>
                      </td>
                      <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-slate-800">
                        {currentStep ? (d === undefined || !Number.isFinite(d) ? "∞" : `${d} m`) : "—"}
                      </td>
                      <td className="px-3 py-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${chip}`}>{label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-2 flex flex-col">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Log langkah</h3>
          <ol
            ref={logRef}
            className="max-h-[22rem] flex-1 space-y-1.5 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/50 p-2.5"
          >
            {visibleSteps.length === 0 && <li className="p-2 text-xs text-slate-400">Belum ada langkah.</li>}
            {visibleSteps.map((s, i) => (
              <li
                key={i}
                className={`animate-fade-in rounded-md bg-white px-2.5 py-1.5 text-[11px] leading-relaxed text-slate-600 shadow-sm ${
                  i === stepIndex ? "ring-1 ring-brand-300" : ""
                }`}
              >
                <span className={`mr-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold ${stepTone(s)}`}>{stepLabel(s)}</span>
                {s.message}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {status === "finished" && run && currentStep?.type === "done" && (
        <div
          className={`mt-4 animate-pop-in rounded-lg border px-4 py-3 text-sm ${
            run.result.found ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {run.result.found ? (
            <>
              <strong>Hasil akhir:</strong> {run.result.nodePath.join(" → ")} · <strong>{run.result.totalDistance} m</strong>
              {run.result.edgePath.length > 0 && (
                <span className="text-emerald-700"> (jalur {run.result.edgePath.map((id) => `#${id}`).join(", ")})</span>
              )}
            </>
          ) : (
            <>
              <strong>Rute tidak tersedia.</strong> Semua gedung yang dapat dijangkau sudah diperiksa dan tujuan tidak termasuk.
            </>
          )}
        </div>
      )}
    </section>
  );
}
