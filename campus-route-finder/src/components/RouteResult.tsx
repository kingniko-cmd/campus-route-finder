import { ArrowRight, CheckCircle2, Flag, Route as RouteIcon, SearchX } from "lucide-react";
import { Fragment } from "react";
import { useApp } from "../context/AppContext";
import { buildingName } from "../data/campus";

export function RouteResult() {
  const { result, isSearching, hasSearched } = useApp();

  if (isSearching) {
    return (
      <section className="card p-5" aria-busy="true">
        <div className="mb-4 h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-5 space-y-2.5">
          <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
        <p className="mt-4 text-xs text-slate-400">Menjalankan algoritma Dijkstra…</p>
      </section>
    );
  }

  if (!hasSearched || !result) {
    return (
      <section className="card flex flex-col items-center justify-center p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <RouteIcon size={22} />
        </div>
        <h2 className="mt-3 text-sm font-bold text-slate-700">Belum ada hasil</h2>
        <p className="mt-1 max-w-[16rem] text-xs leading-relaxed text-slate-500">
          Pilih gedung asal dan tujuan, lalu klik <strong>Cari Rute Terpendek</strong>.
        </p>
      </section>
    );
  }

  if (!result.found) {
    return (
      <section className="card animate-pop-in border-rose-200 bg-rose-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <SearchX size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-rose-700">Rute tidak tersedia</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Tidak ada jalur aktif yang menghubungkan <strong>{result.source}</strong> ({buildingName(result.source)}) dengan{" "}
              <strong>{result.target}</strong> ({buildingName(result.target)}). Buka kembali jalur yang ditutup di halaman
              Manajemen Jalur.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const sameBuilding = result.nodePath.length === 1;

  return (
    <section className="card animate-pop-in overflow-hidden" key={result.edgePath.join("-") + result.totalDistance}>
      <div className="flex items-center justify-between bg-navy-900 px-5 py-4 text-white">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-navy-200">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Rute terpendek ditemukan
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight">
            {result.totalDistance} <span className="text-base font-medium text-navy-200">meter</span>
          </p>
        </div>
        <div className="text-right text-xs text-navy-200">
          <p>{result.nodePath.length} gedung</p>
          <p>{result.edgePath.length} jalur</p>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Urutan gedung</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {result.nodePath.map((id, i) => (
              <Fragment key={`${id}-${i}`}>
                <span
                  title={buildingName(id)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    i === 0
                      ? "bg-emerald-100 text-emerald-700"
                      : i === result.nodePath.length - 1 && !sameBuilding
                        ? "bg-orange-100 text-orange-700"
                        : "bg-brand-50 text-brand-700"
                  }`}
                >
                  {id}
                </span>
                {i < result.nodePath.length - 1 && <ArrowRight size={13} className="text-slate-300" />}
              </Fragment>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            {result.nodePath.map((id) => buildingName(id)).join(" → ")}
          </p>
        </div>

        {sameBuilding ? (
          <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
            Gedung asal dan tujuan sama, sehingga jarak tempuh 0 meter dan rute hanya berisi satu gedung.
          </p>
        ) : (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Segmen jalur</h3>
            <ol className="divide-y divide-slate-100 rounded-lg border border-slate-100">
              {result.segments.map((s, i) => (
                <li key={`${s.edgeId}-${i}`} className="flex items-center gap-3 px-3 py-2.5 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                    {i + 1}
                  </span>
                  <span className="rounded bg-navy-50 px-1.5 py-0.5 font-semibold text-navy-700">Jalur #{s.edgeId}</span>
                  <span className="flex-1 text-slate-600">
                    {s.from} <ArrowRight size={11} className="mx-0.5 inline text-slate-300" /> {s.to}
                  </span>
                  <span className="font-semibold text-slate-800">{s.distance} m</span>
                </li>
              ))}
              <li className="flex items-center gap-3 bg-slate-50 px-3 py-2.5 text-xs font-semibold">
                <Flag size={14} className="text-navy-600" />
                <span className="flex-1 text-slate-600">Total jarak</span>
                <span className="text-navy-900">{result.totalDistance} m</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
