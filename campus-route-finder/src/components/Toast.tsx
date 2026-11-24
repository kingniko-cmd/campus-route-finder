import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from "lucide-react";
import { useToast, type ToastKind } from "../context/ToastContext";

const STYLES: Record<ToastKind, { icon: LucideIcon; ring: string; iconColor: string }> = {
  success: { icon: CheckCircle2, ring: "border-emerald-200", iconColor: "text-emerald-500" },
  error: { icon: XCircle, ring: "border-rose-200", iconColor: "text-rose-500" },
  warning: { icon: AlertTriangle, ring: "border-amber-200", iconColor: "text-amber-500" },
  info: { icon: Info, ring: "border-brand-200", iconColor: "text-brand-500" },
};

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[60] flex w-80 flex-col gap-3"
      aria-live="polite"
      role="status"
    >
      {toasts.map((t) => {
        const { icon: Icon, ring, iconColor } = STYLES[t.kind];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex animate-toast-in items-start gap-3 rounded-xl border bg-white p-3.5 shadow-pop ${ring}`}
          >
            <Icon size={20} className={`mt-0.5 shrink-0 ${iconColor}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">{t.title}</p>
              {t.message && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{t.message}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Tutup notifikasi"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
