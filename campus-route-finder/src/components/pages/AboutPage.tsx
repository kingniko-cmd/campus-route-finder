import { Cpu, HardDrive, MousePointerClick, Workflow } from "lucide-react";

const FEATURES = [
  {
    icon: Cpu,
    title: "Algoritma Dijkstra",
    body: "Pencarian rute terpendek memakai adjacency list dan priority queue (min-heap). Jalur yang ditutup diabaikan, dan hasil selalu dihitung ulang dari data terbaru.",
  },
  {
    icon: Workflow,
    title: "Jalur paralel",
    body: "Setiap jalur punya nomor unik. Jalur #7 dan #8 antara G3 dan G5 diperlakukan sebagai dua jalur terpisah, sehingga hasil rute menunjukkan jalur mana yang dipakai.",
  },
  {
    icon: MousePointerClick,
    title: "Interaktif",
    body: "Pilih gedung dari dropdown atau klik langsung pada graf. Klik label jarak pada graf untuk mengubah jaraknya.",
  },
  {
    icon: HardDrive,
    title: "Berjalan lokal",
    body: "Tidak ada backend, API eksternal, database, maupun login. Semua data disimpan sementara di memori browser dan kembali ke nilai awal saat halaman dimuat ulang.",
  },
];

const STEPS = [
  "Pilih gedung asal dan tujuan, lalu klik Cari Rute Terpendek.",
  "Lihat total jarak, urutan gedung, nomor jalur, dan jarak tiap segmen. Rute di-highlight pada graf.",
  "Klik Mulai Animasi untuk melihat proses Dijkstra: node yang diperiksa, jalur yang dievaluasi, dan jarak sementara tiap gedung.",
  "Buka Manajemen Jalur untuk mengubah jarak atau menutup/membuka jalur, lalu cari rute lagi untuk melihat dampaknya.",
  "Gunakan Reset Data untuk mengembalikan semua jarak dan status jalur ke kondisi awal.",
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="card bg-navy-900 p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">Smart Campus Navigation</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">Campus Route Finder</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-200">
          Sistem pencarian rute terpendek antar gedung kampus. Aplikasi ini menampilkan jaringan jalur sebagai graf tidak
          berarah dan menghitung rute terpendek dengan algoritma Dijkstra, lengkap dengan animasi proses pencariannya.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-5">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pop">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon size={20} />
            </div>
            <h3 className="mt-3 text-sm font-bold text-navy-900">{title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{body}</p>
          </div>
        ))}
      </div>

      <section className="card p-6">
        <h3 className="text-sm font-bold text-navy-900">Cara menggunakan</h3>
        <ol className="mt-4 space-y-3">
          {STEPS.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-600">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card p-6">
        <h3 className="text-sm font-bold text-navy-900">Teknologi</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {["React", "TypeScript", "Tailwind CSS", "Lucide React", "SVG", "Vite", "Vitest"].map((t) => (
            <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {t}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
