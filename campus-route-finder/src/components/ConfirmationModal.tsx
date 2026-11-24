import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { useApp } from "../context/AppContext";

export function ConfirmationModal() {
  const { resetConfirmOpen, cancelReset, confirmReset, stats } = useApp();

  useEffect(() => {
    if (!resetConfirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelReset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetConfirmOpen, cancelReset]);

  if (!resetConfirmOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) cancelReset();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-title"
        className="w-full max-w-md animate-modal-in rounded-2xl bg-white p-6 shadow-pop"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h2 id="reset-title" className="text-lg font-bold text-navy-900">
              Reset seluruh data?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              Semua jarak akan dikembalikan ke nilai awal, seluruh jalur dibuka kembali, hasil pencarian dihapus, dan
              animasi dihentikan.
              {stats.closedEdges > 0 && (
                <>
                  {" "}
                  Saat ini ada <strong className="text-slate-700">{stats.closedEdges} jalur ditutup</strong>.
                </>
              )}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-secondary" onClick={cancelReset} autoFocus>
            Batal
          </button>
          <button className="btn-danger" onClick={confirmReset}>
            Ya, Reset Data
          </button>
        </div>
      </div>
    </div>
  );
}
