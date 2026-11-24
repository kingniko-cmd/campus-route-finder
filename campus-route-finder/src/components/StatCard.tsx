import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "navy" | "blue" | "emerald" | "rose";
  hint?: string;
}

const TONES: Record<Props["tone"], string> = {
  navy: "bg-navy-50 text-navy-700",
  blue: "bg-brand-50 text-brand-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
};

export function StatCard({ label, value, icon: Icon, tone, hint }: Props) {
  return (
    <div className="card flex items-center gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pop">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${TONES[tone]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p key={value} className="animate-pop-in text-3xl font-bold leading-tight tracking-tight text-navy-900">
          {value}
        </p>
        {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
