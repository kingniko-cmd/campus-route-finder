import { Info, LayoutDashboard, Network, Route, Table2, Waypoints, type LucideIcon } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { PageId } from "../types";

const NAV_ITEMS: { id: PageId; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "route", label: "Cari Rute", icon: Route },
  { id: "graph", label: "Visualisasi Graf", icon: Network },
  { id: "paths", label: "Manajemen Jalur", icon: Table2 },
  { id: "about", label: "Tentang Aplikasi", icon: Info },
];

export function Sidebar() {
  const { page, setPage, stats } = useApp();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-navy-950 text-slate-300">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
          <Waypoints size={22} />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-bold tracking-tight text-white">Campus Route Finder</p>
          <p className="text-xs text-navy-300">Smart Campus Navigation</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3" aria-label="Navigasi utama">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              aria-current={active ? "page" : undefined}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-white/10 text-white shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                size={18}
                className={`transition-colors ${active ? "text-brand-300" : "text-slate-500 group-hover:text-brand-300"}`}
              />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />}
            </button>
          );
        })}
      </nav>

      <div className="m-4 rounded-xl border border-white/10 bg-white/5 p-4 text-xs">
        <p className="mb-2 font-semibold text-white">Ringkasan Jaringan</p>
        <div className="flex justify-between text-slate-400">
          <span>Gedung</span>
          <span className="font-semibold text-slate-200">{stats.totalBuildings}</span>
        </div>
        <div className="mt-1 flex justify-between text-slate-400">
          <span>Jalur aktif</span>
          <span className="font-semibold text-emerald-300">
            {stats.activeEdges}/{stats.totalEdges}
          </span>
        </div>
        <div className="mt-1 flex justify-between text-slate-400">
          <span>Jalur ditutup</span>
          <span className="font-semibold text-rose-300">{stats.closedEdges}</span>
        </div>
      </div>
    </aside>
  );
}
