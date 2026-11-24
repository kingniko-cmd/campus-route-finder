# Campus Route Finder

**Smart Campus Navigation** · Sistem pencarian rute terpendek antar gedung kampus.

Website interaktif (desktop) yang menghitung rute terpendek antar gedung kampus dengan **algoritma Dijkstra**
(adjacency list + min-heap), lengkap dengan visualisasi graf, animasi proses algoritma, dan manajemen jalur.
Semua berjalan di browser: tanpa backend, API eksternal, database, maupun login.

## Menjalankan

Prasyarat: **Node.js 18 atau lebih baru**.

```bash
npm install
npm run dev        # buka http://localhost:5173
```

Perintah lain:

```bash
npm test           # unit test algoritma Dijkstra, min-heap, validasi (37 tes)
npm run build      # build produksi ke folder dist/
npm run preview    # pratinjau hasil build di http://localhost:4173
```

## Fitur

- **Dashboard**: statistik (total gedung, total jalur, jalur aktif, jalur ditutup), graf jaringan, pencarian rute, hasil.
- **Pencarian rute**: dropdown asal/tujuan (atau klik gedung pada graf), total jarak, urutan gedung, nomor jalur, jarak tiap segmen. Menangani "rute tidak tersedia" dan asal = tujuan (0 meter).
- **Visualisasi graf (SVG)**: jalur aktif/ditutup berbeda, rute di-highlight, node asal/tujuan berwarna khusus, jalur paralel G3–G5 (#7 dan #8) digambar sebagai dua kurva terpisah.
- **Animasi Dijkstra**: Mulai, Pause, Lanjutkan, Reset, kecepatan 0.5x–3x. Menampilkan node yang diperiksa, jalur yang dievaluasi, jarak sementara tiap gedung, node yang sudah dikunjungi, dan hasil akhir. Animasi memutar ulang langkah algoritma yang sebenarnya.
- **Manajemen jalur**: ubah jarak (validasi bilangan bulat positif), tutup/buka jalur, cari berdasarkan nomor atau gedung, filter status, reset seluruh data (dengan konfirmasi).
- Toast notifikasi, modal konfirmasi, loading state, transisi halaman.

## Struktur

```text
src/
├─ lib/
│  ├─ dijkstra.ts        # algoritma (murni, tanpa UI): runDijkstra, findShortestPath, buildAdjacencyList
│  ├─ minHeap.ts         # priority queue
│  ├─ validation.ts      # validasi jarak
│  ├─ graphGeometry.ts   # garis/kurva jalur untuk SVG
│  └─ dijkstra.test.ts   # unit test
├─ data/campus.ts        # data gedung, jalur awal, posisi node
├─ context/              # state aplikasi dan toast
├─ hooks/useDijkstraAnimation.ts
└─ components/           # Sidebar, Header, Dashboard, GraphVisualization, RouteSearch, RouteResult,
                         # DijkstraAnimation, PathManagement, EditDistanceModal, ConfirmationModal, ...
```

## Catatan algoritma

- Graf tidak berarah; jalur yang ditutup tidak dimasukkan ke adjacency list.
- Setiap jalur menyimpan ID unik, sehingga jalur paralel (#7 dan #8) tidak pernah digabung, dan hasil rute menyebut jalur mana yang dipakai.
- Hasil tidak pernah di-hardcode: selalu dihitung ulang dari data jalur terbaru (ubah jarak, tutup/buka jalur, dan reset langsung memengaruhi hasil).
- Data tersimpan sementara di memori browser dan kembali ke nilai awal saat halaman dimuat ulang.

Lihat `HANDOFF.md` untuk spesifikasi lengkap dan panduan melanjutkan pekerjaan.
