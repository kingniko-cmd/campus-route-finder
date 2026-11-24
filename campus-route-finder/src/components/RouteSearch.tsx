import { ArrowLeftRight, Loader2, MapPin, Navigation, Search } from "lucide-react";
import { useApp } from "../context/AppContext";
import { buildings } from "../data/campus";

interface Props {
  layout?: "stacked" | "inline";
}

export function RouteSearch({ layout = "stacked" }: Props) {
  const { sourceId, targetId, setSourceId, setTargetId, swapSelection, searchRoute, isSearching } = useApp();
  const inline = layout === "inline";

  const options = (
    <>
      <option value="">Pilih gedung…</option>
      {buildings.map((b) => (
        <option key={b.id} value={b.id}>
          {b.id} · {b.name}
        </option>
      ))}
    </>
  );

  const sourceField = (
    <div className="min-w-0 flex-1">
      <label htmlFor="source-select" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        <MapPin size={13} className="text-emerald-500" />
        Gedung Asal
      </label>
      <select id="source-select" className="field" value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
        {options}
      </select>
    </div>
  );

  const targetField = (
    <div className="min-w-0 flex-1">
      <label htmlFor="target-select" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        <Navigation size={13} className="text-orange-500" />
        Gedung Tujuan
      </label>
      <select id="target-select" className="field" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
        {options}
      </select>
    </div>
  );

  const swapButton = (
    <button
      type="button"
      onClick={swapSelection}
      disabled={!sourceId && !targetId}
      className="btn-secondary !px-2.5 !py-2"
      title="Tukar asal dan tujuan"
      aria-label="Tukar asal dan tujuan"
    >
      <ArrowLeftRight size={16} className={inline ? "" : "rotate-90"} />
    </button>
  );

  const searchButton = (
    <button type="button" onClick={searchRoute} disabled={isSearching} className="btn-primary">
      {isSearching ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Menghitung…
        </>
      ) : (
        <>
          <Search size={16} />
          Cari Rute Terpendek
        </>
      )}
    </button>
  );

  if (inline) {
    return (
      <section className="card flex items-end gap-3 p-4">
        {sourceField}
        {swapButton}
        {targetField}
        {searchButton}
      </section>
    );
  }

  return (
    <section className="card p-5">
      <h2 className="text-sm font-bold text-navy-900">Pencarian Rute</h2>
      <p className="mt-0.5 text-xs text-slate-500">Pilih gedung asal dan tujuan, atau klik gedung pada graf.</p>

      <div className="mt-4 space-y-3">
        {sourceField}
        <div className="flex justify-center">{swapButton}</div>
        {targetField}
      </div>

      <div className="mt-5 [&>button]:w-full">{searchButton}</div>
    </section>
  );
}
