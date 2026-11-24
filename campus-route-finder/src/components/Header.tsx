import { HardDrive, RotateCcw } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { PageId } from "../types";

const PAGE_META: Record<PageId, { title: string; description: string }> = {
  dashboard: {
    title: "Dashboard",
    description: "Sistem pencarian rute terpendek antar gedung kampus.",
  },
  route: {
    title: "Cari Rute",
    description: "Pilih gedung asal dan tujuan, lalu hitung rute terpendek dengan algoritma Dijkstra.",
  },
  graph: {
    title: "Visualisasi Graf",
    description: "Jaringan jalur antar gedung kampus dan proses algoritma Dijkstra langkah demi langkah.",
  },
  paths: {
    title: "Manajemen Jalur",
    description: "Ubah jarak, tutup, atau buka kembali jalur. Perubahan langsung memengaruhi hasil rute.",
  },
  about: {
    title: "Tentang Aplikasi",
    description: "Informasi aplikasi, algoritma, dan cara penggunaan.",
  },
};

export function Header() {
  const { page, requestReset } = useApp();
  const meta = PAGE_META[page];

  return (
    <header className="flex items-center justify-between gap-6 border-b border-slate-200 bg-white px-8 py-4">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-navy-900">{meta.title}</h1>
        <p className="truncate text-sm text-slate-500">{meta.description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Sistem Aktif
        </div>
        <div
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
          title="Seluruh perhitungan dan data berjalan di browser Anda. Tidak ada server atau database."
        >
          <HardDrive size={14} className="text-slate-400" />
          Data berjalan secara lokal
        </div>
        <button onClick={requestReset} className="btn-secondary !py-1.5 !text-xs">
          <RotateCcw size={14} />
          Reset Data
        </button>
      </div>
    </header>
  );
}
