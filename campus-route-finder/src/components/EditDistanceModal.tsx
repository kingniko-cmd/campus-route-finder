import { Pencil } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useApp } from "../context/AppContext";
import { buildingName } from "../data/campus";
import { validateDistance } from "../lib/validation";

export function EditDistanceModal() {
  const { editingEdgeId, edges, closeEdit, updateDistance } = useApp();
  const edge = edges.find((e) => e.id === editingEdgeId) ?? null;

  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Isi ulang form setiap kali modal dibuka untuk jalur yang berbeda.
  useEffect(() => {
    if (edge) {
      setValue(String(edge.distance));
      setError(null);
      requestAnimationFrame(() => inputRef.current?.select());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingEdgeId]);

  useEffect(() => {
    if (!edge) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEdit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [edge, closeEdit]);

  if (!edge) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = validateDistance(value);
    if (!v.valid || v.value === undefined) {
      setError(v.error ?? "Nilai tidak valid.");
      return;
    }
    if (v.value === edge.distance) {
      closeEdit();
      return;
    }
    updateDistance(edge.id, v.value);
    closeEdit();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeEdit();
      }}
    >
      <form
        onSubmit={submit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
        className="w-full max-w-md animate-modal-in rounded-2xl bg-white p-6 shadow-pop"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <Pencil size={20} />
          </div>
          <div>
            <h2 id="edit-title" className="text-lg font-bold text-navy-900">
              Ubah Jarak Jalur #{edge.id}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {edge.source} · {buildingName(edge.source)} ↔ {edge.target} · {buildingName(edge.target)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="distance-input" className="mb-1.5 block text-sm font-medium text-slate-700">
            Jarak baru (meter)
          </label>
          <div className="relative">
            <input
              id="distance-input"
              ref={inputRef}
              inputMode="numeric"
              autoComplete="off"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby="distance-help"
              className={`field pr-10 ${error ? "!border-rose-400 !ring-2 !ring-rose-100" : ""}`}
              placeholder="Contoh: 150"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">m</span>
          </div>
          <p id="distance-help" className={`mt-1.5 text-xs ${error ? "text-rose-600" : "text-slate-500"}`}>
            {error ?? `Hanya bilangan bulat positif. Jarak awal: ${edge.originalDistance} m.`}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={closeEdit}>
            Batal
          </button>
          <button type="submit" className="btn-primary">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
