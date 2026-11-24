import { Ban, CheckCircle2, Lock, LockOpen, Pencil, RotateCcw, Search, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { buildingName } from "../data/campus";

type StatusFilter = "all" | "active" | "closed";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "active", label: "Aktif" },
  { id: "closed", label: "Ditutup" },
];

export function PathManagement() {
  const { edges, stats, openEdit, closeEdge, openEdge, requestReset, flashEdgeId } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  const parallelIds = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of edges) {
      const key = [e.source, e.target].sort().join("|");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return new Set(edges.filter((e) => (counts.get([e.source, e.target].sort().join("|")) ?? 0) > 1).map((e) => e.id));
  }, [edges]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, "");
    return [...edges]
      .sort((a, b) => a.id - b.id)
      .filter((e) => {
        if (filter === "active" && e.closed) return false;
        if (filter === "closed" && !e.closed) return false;
        if (!q) return true;
        return (
          String(e.id) === q ||
          (/^\d+$/.test(q) && String(e.id).startsWith(q)) ||
          e.source.toLowerCase() === q ||
          e.target.toLowerCase() === q ||
          buildingName(e.source).toLowerCase().includes(q) ||
          buildingName(e.target).toLowerCase().includes(q)
        );
      });
  }, [edges, query, filter]);

  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
        <div>
          <h2 className="text-sm font-bold text-navy-900">Daftar Jalur</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {stats.totalEdges} jalur · <span className="text-emerald-600">{stats.activeEdges} aktif</span> ·{" "}
            <span className="text-rose-600">{stats.closedEdges} ditutup</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nomor atau gedung…"
              aria-label="Cari jalur berdasarkan nomor atau gedung"
              className="field !w-64 !pl-9"
            />
          </div>

          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5" role="group" aria-label="Filter status jalur">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  filter === f.id ? "bg-white text-navy-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button className="btn-secondary" onClick={requestReset}>
            <RotateCcw size={15} />
            Reset Data
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">No. Jalur</th>
              <th className="px-5 py-3 font-semibold">Gedung Asal</th>
              <th className="px-5 py-3 font-semibold">Gedung Tujuan</th>
              <th className="px-5 py-3 text-right font-semibold">Jarak</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((e) => {
              const changed = e.distance !== e.originalDistance;
              return (
                <tr
                  key={e.id}
                  className={`transition-colors hover:bg-slate-50/80 ${flashEdgeId === e.id ? "animate-row-flash" : ""} ${
                    e.closed ? "bg-slate-50/60" : ""
                  }`}
                >
                  <td className="px-5 py-3">
                    <span className="font-bold text-navy-800">#{e.id}</span>
                    {parallelIds.has(e.id) && (
                      <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                        Paralel
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-slate-800">{e.source}</span>{" "}
                    <span className="text-slate-500">{buildingName(e.source)}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-slate-800">{e.target}</span>{" "}
                    <span className="text-slate-500">{buildingName(e.target)}</span>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    <span className={`font-semibold ${e.closed ? "text-slate-400 line-through" : "text-slate-800"}`}>{e.distance} m</span>
                    {changed && <p className="text-[11px] text-slate-400">awal {e.originalDistance} m</p>}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      key={String(e.closed)}
                      className={`inline-flex animate-pop-in items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        e.closed ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {e.closed ? <Ban size={12} /> : <CheckCircle2 size={12} />}
                      {e.closed ? "Ditutup" : "Aktif"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn-secondary !px-3 !py-1.5 !text-xs" onClick={() => openEdit(e.id)}>
                        <Pencil size={13} />
                        Ubah Jarak
                      </button>
                      {e.closed ? (
                        <button
                          className="btn !border !border-emerald-200 !bg-emerald-50 !px-3 !py-1.5 !text-xs !text-emerald-700 hover:!bg-emerald-100"
                          onClick={() => openEdge(e.id)}
                        >
                          <LockOpen size={13} />
                          Buka Jalur
                        </button>
                      ) : (
                        <button
                          className="btn !border !border-rose-200 !bg-rose-50 !px-3 !py-1.5 !text-xs !text-rose-700 hover:!bg-rose-100"
                          onClick={() => closeEdge(e.id)}
                        >
                          <Lock size={13} />
                          Tutup Jalur
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <SearchX size={22} />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">Tidak ada jalur yang cocok</p>
            <p className="mt-1 text-xs text-slate-500">Ubah kata kunci pencarian atau filter status.</p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
        Menampilkan {rows.length} dari {stats.totalEdges} jalur. Jalur yang ditutup tidak dipakai dalam pencarian rute.
      </div>
    </section>
  );
}
