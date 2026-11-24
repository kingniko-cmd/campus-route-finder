# HANDOFF — Campus Route Finder

> **STATUS: SELESAI.** Seluruh checklist di bagian 2 sudah tercentang. Proyek sudah dibangun, diuji (37 unit test + tes end-to-end di browser), dan dikemas dalam `campus-route-finder.zip`. Bagian 1 hanya diperlukan bila ada revisi atau fitur tambahan.

> File ini dibuat supaya pekerjaan bisa dilanjutkan di akun/sesi Claude lain tanpa kehilangan konteks.
> Baca bagian 1, lalu cek bagian 2 (progres) untuk tahu apa yang sudah dan belum selesai.

---

## 1. Cara melanjutkan di akun lain

1. Buka percakapan baru di akun lain.
2. Lampirkan file ini (`HANDOFF.md`) dan, kalau ada, zip folder `campus-route-finder` yang sudah dihasilkan.
3. Kirim prompt berikut:

```text
Saya melanjutkan proyek "Campus Route Finder" dari sesi sebelumnya.
Baca HANDOFF.md terlampir sampai habis. Cek bagian "Progres", lanjutkan dari
item pertama yang belum dicentang, jangan mengulang yang sudah selesai.
Jangan mengubah data awal gedung/jalur dan jangan mengganti algoritma Dijkstra.
Setelah selesai jalankan `npm run build` dan `npm test`, lalu perbarui checklist
di HANDOFF.md dan kirimkan hasilnya (zip proyek + HANDOFF.md yang sudah diperbarui).
```

4. Kalau folder proyek tidak ikut terlampir, bangun ulang dari bagian 4–9 di bawah. Semua yang dibutuhkan ada di file ini.

---

## 2. Progres (perbarui setiap kali ada kemajuan)

- [x] HANDOFF.md ditulis
- [x] Scaffold proyek (Vite + React + TS + Tailwind v3 + lucide-react + @fontsource-variable/inter + vitest)
- [x] `src/data/campus.ts` (data awal, posisi node)
- [x] `src/lib/minHeap.ts`
- [x] `src/lib/dijkstra.ts` (algoritma + perekaman langkah animasi)
- [x] `src/lib/dijkstra.test.ts` (kasus uji bagian 10 lulus)
- [x] `src/lib/graphGeometry.ts` (kurva jalur paralel)
- [x] `src/lib/validation.ts` (validasi bilangan bulat positif)
- [x] Context state + Toast
- [x] Sidebar, Header
- [x] GraphVisualization (SVG)
- [x] RouteSearch, RouteResult
- [x] DijkstraAnimation + hook `useDijkstraAnimation`
- [x] PathManagement, EditDistanceModal, ConfirmationModal
- [x] Dashboard, halaman Cari Rute, Visualisasi Graf, Tentang
- [x] `npm run build` sukses tanpa error TypeScript
- [x] `npm test` lulus
- [x] README.md (instalasi dan cara menjalankan)
- [x] Verifikasi fitur lewat tes end-to-end di browser (Chrome headless, 41 pemeriksaan lulus)

---

## 3. Ringkasan proyek dan keputusan teknis

**Tujuan:** website desktop interaktif untuk mencari rute terpendek antar gedung kampus dengan algoritma Dijkstra. Semua fitur benar-benar berfungsi, bukan prototype.

**Identitas:** Nama "Campus Route Finder". Subjudul "Smart Campus Navigation". Deskripsi "Sistem pencarian rute terpendek antar gedung kampus." Gaya modern, minimalis, profesional. Warna navy blue dan biru modern, latar putih, abu-abu untuk elemen pendukung. Font Inter. Target desktop.

**Stack:** React + TypeScript, Tailwind CSS (v3.4, stabil), lucide-react, **SVG murni** untuk graf (lebih stabil dan kurva jalur paralel mudah dikontrol), state React, tanpa backend/API/database/login, semua jalan di browser.

**Keputusan:**
- Routing antarhalaman memakai `useState` (tanpa react-router), transisi lewat animasi CSS dengan `key`.
- State global (jalur, pilihan asal/tujuan, hasil pencarian, animasi) lewat React Context.
- Hasil pencarian **diturunkan (`useMemo`) dari data jalur terbaru**. Yang disimpan hanya pasangan asal/tujuan yang dicari, supaya ubah jarak, tutup/buka jalur, dan reset langsung memengaruhi hasil dan graf.
- Animasi Dijkstra memakai **fungsi algoritma yang sama** dengan pencarian biasa. Fungsi itu merekam langkah (`steps`) saat berjalan, jadi bukan animasi dekoratif.
- Font Inter lewat paket npm `@fontsource-variable/inter` (tanpa CDN).
- Font, ikon, dan semua aset lokal.

---

## 4. Data awal (JANGAN DIUBAH)

```ts
const buildings = [
  { id: "G1", name: "Gerbang Utama" },
  { id: "G2", name: "Perpustakaan" },
  { id: "G3", name: "Laboratorium Komputer" },
  { id: "G4", name: "Gedung Kuliah A" },
  { id: "G5", name: "Gedung Kuliah B" },
  { id: "G6", name: "Auditorium" },
  { id: "G7", name: "Pusat Kegiatan Mahasiswa" },
  { id: "G8", name: "Kantin" },
  { id: "G9", name: "Gedung Rektorat" },
  { id: "G10", name: "Asrama Mahasiswa" },
];

const initialEdges = [
  { id: 1,  source: "G1", target: "G2",  distance: 120 },
  { id: 2,  source: "G1", target: "G4",  distance: 180 },
  { id: 3,  source: "G1", target: "G9",  distance: 250 },
  { id: 4,  source: "G2", target: "G3",  distance: 100 },
  { id: 5,  source: "G2", target: "G4",  distance: 90  },
  { id: 6,  source: "G3", target: "G4",  distance: 80  },
  { id: 7,  source: "G3", target: "G5",  distance: 140 },
  { id: 8,  source: "G3", target: "G5",  distance: 200 },
  { id: 9,  source: "G4", target: "G5",  distance: 110 },
  { id: 10, source: "G4", target: "G6",  distance: 160 },
  { id: 11, source: "G4", target: "G8",  distance: 220 },
  { id: 12, source: "G5", target: "G6",  distance: 130 },
  { id: 13, source: "G5", target: "G7",  distance: 170 },
  { id: 14, source: "G6", target: "G7",  distance: 100 },
  { id: 15, source: "G6", target: "G8",  distance: 150 },
  { id: 16, source: "G7", target: "G8",  distance: 90  },
  { id: 17, source: "G8", target: "G10", distance: 180 },
  { id: 18, source: "G9", target: "G10", distance: 300 },
];
```

- Graf **tidak berarah**.
- Jalur **7 dan 8** adalah dua jalur paralel G3–G5 dan **tidak boleh digabung**. Keduanya tetap dua entitas dengan ID unik.
- Model state: `{ id, source, target, distance, originalDistance, closed }`.

---

## 5. Spesifikasi fitur

1. **Dashboard**: total gedung (10), total jalur (18), jalur aktif, jalur ditutup, panel pencarian rute, visualisasi graf.
2. **Visualisasi graf** (bukan peta geografis): node lingkaran dengan kode dan nama gedung. Garis jalur dengan label jarak (m) dan nomor jalur. Jalur aktif dan ditutup tampil berbeda. Jalur hasil pencarian di-highlight. Node asal dan tujuan punya warna khusus. Jalur paralel G3–G5 digambar sebagai dua kurva terpisah. Posisi node rapi (lihat bagian 8).
3. **Pencarian rute**: dropdown asal dan tujuan, tombol "Cari Rute Terpendek" (ada loading state). Output: total jarak, urutan gedung, nomor jalur yang dipakai, jarak tiap segmen, highlight di graf. Tidak ada rute: tampilkan pesan "rute tidak tersedia". Asal = tujuan: jarak 0 m dan satu gedung.
4. **Animasi Dijkstra**: tombol "Mulai Animasi", "Pause", "Lanjutkan", "Reset Animasi", pengatur kecepatan. Tampilkan node yang diperiksa, jalur yang dievaluasi, jarak sementara tiap node, node yang sudah dikunjungi, dan hasil akhir. Animasi halus, tidak berlebihan, berasal dari langkah algoritma asli.
5. **Manajemen jalur**: tabel (nomor, asal, tujuan, jarak, jarak asli, status, aksi). Fitur: ubah jarak (modal, validasi bilangan bulat positif), tutup jalur, buka kembali, reset seluruh data, cari berdasarkan nomor atau gedung, filter status. Jalur ditutup **tidak boleh** dipakai Dijkstra.
6. **Reset** (dengan modal konfirmasi): semua jarak kembali ke nilai awal, semua jalur aktif, hasil pencarian dihapus, animasi dihentikan, status node dan garis kembali normal.

**Layout:** Sidebar (logo, Dashboard, Cari Rute, Visualisasi Graf, Manajemen Jalur, Tentang Aplikasi). Header (judul halaman, deskripsi singkat, indikator "Sistem Aktif", info "Data berjalan secara lokal"). Konten utama sesuai halaman.

**Interaksi:** transisi antarhalaman halus, hover pada tombol dan kartu, animasi saat rute ditemukan, animasi highlight jalur, animasi perubahan status jalur, loading saat algoritma jalan, toast untuk setiap tindakan, modal konfirmasi sebelum reset.

**Batasan:** desktop-first, tanpa login/backend/database, jangan ubah data awal, jangan hilangkan fitur, tidak ada tombol yang tidak berfungsi, tidak ada peta geografis palsu, algoritma harus tetap Dijkstra.

---

## 6. Struktur file

```text
campus-route-finder/
├─ index.html
├─ package.json
├─ vite.config.ts            (plugin react + konfigurasi vitest)
├─ tsconfig.json
├─ tailwind.config.js        (palet navy/blue, font Inter)
├─ postcss.config.js
├─ README.md
├─ HANDOFF.md
└─ src/
   ├─ main.tsx
   ├─ App.tsx
   ├─ index.css
   ├─ types.ts
   ├─ data/campus.ts                  (buildings, initialEdges, createInitialEdges, NODE_POSITIONS)
   ├─ lib/
   │  ├─ minHeap.ts
   │  ├─ dijkstra.ts                  (buildAdjacencyList, runDijkstra, findShortestPath)
   │  ├─ dijkstra.test.ts
   │  ├─ graphGeometry.ts             (path garis/kurva, titik tengah label)
   │  └─ validation.ts
   ├─ context/
   │  ├─ AppContext.tsx               (jalur, pilihan, pencarian, animasi, aksi)
   │  └─ ToastContext.tsx
   ├─ hooks/useDijkstraAnimation.ts
   └─ components/
      ├─ Sidebar.tsx
      ├─ Header.tsx
      ├─ Dashboard.tsx
      ├─ StatCard.tsx
      ├─ GraphVisualization.tsx
      ├─ RouteSearch.tsx
      ├─ RouteResult.tsx
      ├─ DijkstraAnimation.tsx
      ├─ PathManagement.tsx
      ├─ EditDistanceModal.tsx
      ├─ ConfirmationModal.tsx
      ├─ Toast.tsx
      └─ pages/ (RoutePage.tsx, GraphPage.tsx, AboutPage.tsx)
```

---

## 7. Desain algoritma

- `buildAdjacencyList(edges)`: hanya jalur `closed === false`; tiap jalur masuk ke dua sisi (tidak berarah), menyimpan `edgeId`. Jalur paralel menjadi dua entri terpisah.
- Priority queue: **min-heap** (`MinHeap`), dengan lazy deletion (entri basi dilewati saat di-pop).
- Relaksasi memakai `<` ketat. Saat seri, jalur yang lebih dulu ditemukan dipertahankan. Urutan tetangga diurutkan berdasarkan `edgeId` agar deterministik.
- Berhenti dini saat node tujuan di-pop (valid untuk Dijkstra).
- Predecessor menyimpan `{ node, edgeId }` supaya jalur paralel bisa dibedakan.
- Hasil: `{ found, source, target, totalDistance, nodePath, edgePath, segments[{edgeId, from, to, distance}] }`. Tidak ditemukan: `found=false`. Asal = tujuan: `totalDistance=0`, `nodePath=[source]`, `edgePath=[]`.
- Tidak ada hasil yang di-hardcode.

**Skema langkah animasi** (`DijkstraStep`), semuanya membawa snapshot `distances` dan `visited`:

| type | isi | keterangan |
|---|---|---|
| `init` | distances awal | sumber = 0, lainnya = ∞ |
| `visit` | `current` | node di-pop dari heap, ditandai dikunjungi |
| `evaluate` | `current`, `neighbor`, `edgeId`, `candidate`, `outcome` | outcome: `improved`, `not-better`, `already-final`, `closed` |
| `done` | `found`, hasil akhir | tujuan dipilih, atau antrean habis (tidak terjangkau) |

---

## 8. Layout graf (viewBox 1000 × 640, radius node 30)

| Node | x | y |
|---|---|---|
| G1 | 60 | 300 |
| G2 | 250 | 120 |
| G3 | 500 | 90 |
| G4 | 330 | 310 |
| G5 | 650 | 200 |
| G6 | 620 | 380 |
| G7 | 880 | 300 |
| G8 | 800 | 540 |
| G9 | 110 | 550 |
| G10 | 450 | 570 |

- Nama gedung memakai sisi per node (`NODE_LABEL_SIDE` di `src/data/campus.ts`): G1, G2, G3, G5, G7 = atas; G4, G9, G10 = bawah; G6, G8 = kanan. Posisi dan sisi ini dipilih lewat pencarian otomatis agar nama, label jarak, dan garis tidak saling menimpa. Ubah satu posisi → cek ulang tampilan.
- Jalur tunggal: garis lurus. Jalur paralel: kurva kuadratik dengan offset tegak lurus berlawanan (±35). Offset dihitung dari urutan jalur di antara pasangan node yang sama.
- Warna: asal emerald, tujuan oranye/amber, jalur hasil biru terang tebal, node dikunjungi biru muda, node sedang diperiksa amber berdenyut, jalur ditutup abu-abu putus-putus dengan tanda ×.
- Nama gedung memakai efek halo putih (`paint-order: stroke`) agar terbaca di atas garis.
- Interaksi: hover pada jalur/node menampilkan tooltip, klik node memilih asal lalu tujuan, klik label jarak membuka modal ubah jarak.

---

## 9. Perilaku state

- `edges` berubah (ubah jarak, tutup/buka, reset) → hasil pencarian dihitung ulang otomatis dan animasi direset.
- Tombol "Cari Rute Terpendek": validasi pilihan, tampilkan loading ±450 ms, simpan pasangan `searched`, tampilkan toast.
- Reset: modal konfirmasi → `edges = createInitialEdges()`, `searched = null`, animasi direset, toast.
- Validasi jarak: `/^[1-9]\d*$/` pada teks yang di-trim, ditambah `Number.isSafeInteger`. Tolak kosong, 0, negatif, desimal, huruf.

---

## 10. Kasus uji (nilai sudah dihitung manual)

Semua jalur aktif, jarak awal:

| Kasus | Hasil yang diharapkan |
|---|---|
| G1 → G10 | 550 m, `G1,G9,G10`, jalur `[3,18]` |
| G1 → G8 | 400 m, `G1,G4,G8`, jalur `[2,11]` |
| G1 → G7 | 440 m, `G1,G4,G6,G7`, jalur `[2,10,14]` |
| G3 → G5 | 140 m, jalur `[7]` (bukan 8) |
| G4 → G4 | 0 m, `G4`, jalur `[]` |

Variasi data:

| Kasus | Hasil yang diharapkan |
|---|---|
| Tutup jalur 7, G3 → G5 | 190 m, `G3,G4,G5`, jalur `[6,9]` |
| Tutup jalur 6 dan 7, G3 → G5 | 200 m, jalur `[8]` (memakai jalur paralel kedua) |
| Tutup 6, 7, 8, G3 → G5 | 300 m, `G3,G2,G4,G5`, jalur `[4,5,9]` |
| Jarak jalur 18 diubah jadi 100, G1 → G10 | 350 m, jalur `[3,18]` |
| Tutup jalur 3, G1 → G9 | 880 m, jalur `[2,11,17,18]` |
| Tutup jalur 3 dan 18, G1 → G9 | tidak ada rute (G9 terisolasi) |
| Tutup jalur 17 dan 18, G1 → G10 | tidak ada rute |
| Setelah reset | seluruh kasus kembali ke tabel pertama |

Verifikasi manual UI: ubah jarak lewat modal lalu cek hasil dan label graf, tutup/buka jalur lalu cek highlight, jalankan animasi lalu Pause/Lanjutkan/Reset, ganti kecepatan, reset data lewat modal konfirmasi, cari jalur berdasarkan nomor dan gedung, filter status.

---

## 11. Instalasi dan menjalankan

```bash
cd campus-route-finder
npm install
npm run dev        # buka http://localhost:5173
npm test           # unit test algoritma
npm run build      # build produksi ke dist/
npm run preview    # pratinjau hasil build
```

Butuh Node.js 18 atau lebih baru.

---

## 12. Catatan dan ide lanjutan (opsional, setelah semua checklist selesai)

- Drag node untuk menyusun ulang posisi graf, dengan tombol "Susun ulang".
- Tombol "Langkah berikutnya" untuk animasi manual.
- Ekspor/impor data jalur sebagai JSON.
- Mode gelap.
