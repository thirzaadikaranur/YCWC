# ReverseTutor — Rencana Build Bertahap

Urutan ini dirancang supaya di setiap tahap ada sesuatu yang BISA DIDEMOKAN,
bukan menunggu semua fitur selesai baru bisa dicoba. Cocok untuk timeline
3-4 minggu, dengan dua AI bekerja di sesi terpisah (frontend & backend)
untuk menghindari context rot.

**PENTING:** sebelum memulai Tahap 1, `types/index.ts` dan `API_CONTRACT.md`
HARUS sudah final dan diberikan ke KEDUA sesi AI. Ini bukan langkah opsional —
tanpa ini, hasil dua sesi terpisah kemungkinan besar tidak akan nyambung
mulus saat integrasi.

## Tahap 0 — Kontrak & Setup Fondasi (~2-3 hari, dikerjakan developer sendiri
atau salah satu AI, SEBELUM sesi paralel dimulai)
- [ ] Finalisasi `types/index.ts` berisi tipe data inti (Topic, Session,
      UnderstandingMapEntry, ScoreHistoryPoint, LearningProfileInsight,
      ChatMode) sesuai `SCHEMA.md`
- [ ] Finalisasi `API_CONTRACT.md` — pastikan semua endpoint, request/response
      shape sudah masuk akal untuk kebutuhan UI (baca ulang `BRIEF.md` bagian
      7 untuk memastikan tidak ada data yang kurang untuk kebutuhan tampilan)
- [ ] Inisialisasi project dengan `create-next-app` (App Router, Tailwind CSS,
      TypeScript diaktifkan)
- [ ] Setup project Supabase: buat tabel sesuai `SCHEMA.md` (termasuk
      `score_history` dan `learning_profile`), aktifkan RLS di SEMUA tabel
- [ ] Setup Supabase Auth (email/password minimal, cukup untuk MVP)
- [ ] Commit/push kerangka awal ini SEBELUM memecah ke dua sesi AI terpisah,
      supaya keduanya mulai dari titik yang sama

## Jalur A — Frontend (GPT-5.6 Luna via OpenCode, sesi terpisah)

REVISI ALUR: A1-A2c di bawah sekarang dikerjakan dalam DUA tahap, bukan
langsung sebagai komponen React:
1. **HTML+CSS langsung di OpenCode, satu halaman per sesi chat** — lihat
   `STEP5_BERTAHAP.md` untuk urutan 5 sesi (Login, Halaman Awal, Halaman
   Topik, Profil Belajar, Settings) dan `PROMPT_FRONTEND.md` untuk alasan
   format ini dipilih daripada Next.js langsung.
2. **Migrasi ke komponen React/Next.js** (Step 5.5 di `STEP_BY_STEP.md`) —
   baru di sinilah `<Sidebar />`, `<WorkArea />`, `<UnderstandingPanel />`,
   dan `lib/mockApi.ts` benar-benar dibuat sebagai kode Next.js.

Checklist A1-A2c di bawah tetap jadi acuan KELENGKAPAN FITUR (apa saja
yang harus ada), terlepas dari tahap mana yang sedang dikerjakan.

### A0 — Halaman Login/Daftar (~1 hari, sesi HTML pertama)
- [ ] Form Masuk & Daftar dalam satu halaman (toggle tanpa reload)
- [ ] State error (kredensial salah/email terdaftar) & loading tombol
- [ ] Link "Lupa password?" (flow reset password Supabase)
- [ ] Setelah migrasi ke Next.js: wiring ke `supabase.auth.signInWithPassword`
      / `supabase.auth.signUp` — INI DIPANGGIL LANGSUNG dari client lewat
      Supabase JS SDK, BUKAN lewat custom API Route di `API_CONTRACT.md`

### A1 — Layout & Desain Statis (~2-3 hari)
- [ ] Bangun layout 3 kolom sesuai `BRIEF.md` bagian 6-7 sebagai komponen
      React terpisah (`<Sidebar />`, `<WorkArea />`, `<UnderstandingPanel />`)
- [ ] Buat `lib/mockApi.ts` sesuai bentuk di `API_CONTRACT.md` bagian
      "Catatan untuk Frontend" — semua komponen dibangun melawan mock ini,
      BUKAN menunggu backend asli selesai
- [ ] Terapkan design tokens (warna, tipografi) lewat `tailwind.config.js`,
      disalin PERSIS dari `tokens.css` hasil sesi HTML (jangan menebak ulang)
- [ ] Pastikan responsive: sidebar & panel kanan collapsible di layar sempit

### A2 — Komponen per Mode (~4-6 hari)
- [ ] Kartu ringkasan (heading + bullet per sub-bagian) + tombol quick-action
- [ ] Kartu kuis (satu soal per giliran, state jawab/feedback instan, kartu
      hasil akhir)
- [ ] Bubble reverse-bot dengan visual cue beda (border accent) + kartu
      diagnosis akhir
- [ ] Bubble qa (chat biasa)
- [ ] Panel kanan: render understanding map dari mock data, termasuk empty
      state + animasi highlight saat skor "berubah" (test dengan mock dulu)
- [ ] **Toggle buka/tutup panel kanan** (`BRIEF.md` 7.3) — `useState` lokal
      di komponen halaman topik, tidak perlu disimpan ke backend
- [ ] Sidebar: search real-time, indikator warna, badge jumlah sesi
- [ ] Footer sidebar: ikon gear membuka halaman Settings (LIHAT A2c di
      bawah — bukan dropdown kecil, keputusan ini sudah direvisi dari
      draft awal, ikuti `SETTINGS.md`)

### A2b — Fitur Tambahan: Sparkline & Profil Belajar (~2-3 hari)
- [ ] Nav switcher "Topik" / "Profil Belajar" di sidebar (`BRIEF.md` 7.1)
- [ ] Sparkline mini di tiap baris panel kanan, dari mock data score-history
      (`API_CONTRACT.md` bagian 6) — skip render kalau data < 2 titik
- [ ] Halaman Profil Belajar (`BRIEF.md` 7.4): daftar kartu insight, tombol
      "Perbarui Analisis" dengan loading state, empty state kalau data belum
      cukup (`enoughData: false` dari mock)
- [ ] Fitur ini BOLEH dikerjakan belakangan/dipangkas jika waktu di jalur ini
      mepet — lihat "Prioritas Jika Waktu Mepet" di bawah

### A2c — Halaman Settings (~1-2 hari)
- [ ] Halaman penuh (bukan modal) sesuai `SETTINGS.md`: 3 kategori Umum/
      Belajar/Akun, dengan sidebar kategori kiri + konten kanan
- [ ] Kategori Umum: nama tampilan (editable) + avatar/inisial preview,
      bahasa antarmuka (READ-ONLY text, bukan dropdown fungsional)
- [ ] Kategori Belajar: toggle "Tampilkan ajakan Jelaskan ke Saya", opsional
      dropdown jumlah soal kuis default, ringkasan singkat read-only
      (jumlah topik + rata-rata pemahaman keseluruhan)
- [ ] Kategori Akun: email (read-only), "Bergabung sejak" (read-only),
      tombol Ganti Password, tombol Keluar (redirect ke halaman Login
      setelah berhasil), tombol Hapus Akun di section "Zona Sensitif"
      terpisah dengan styling danger
- [ ] Fitur "Hapus Akun" BOLEH dipangkas jika waktu mepet — lihat
      "Prioritas Jika Waktu Mepet" di bawah

### A3 — Titik Sambung API (~1 hari)
- [ ] Pastikan `lib/api.ts` adalah SATU-SATUNYA titik pemanggilan data dari
      seluruh frontend (semua komponen memanggil lewat sini, bukan fetch
      langsung tersebar di banyak file) — ini yang akan diganti dari mock ke
      real endpoint saat integrasi

## Jalur B — Backend (DeepSeek V4.1 Flash via OpenCode, sesi terpisah)

### B1 — Route Handlers Dasar (~2-3 hari)
- [ ] Implementasi `POST /api/topics` dan `GET /api/topics` sesuai
      `API_CONTRACT.md` bagian 1-2
- [ ] Implementasi validasi token Supabase Auth di setiap Route Handler
      (`API_CONTRACT.md` bagian 9)
- [ ] Test lewat curl/Postman/Thunder Client — BELUM perlu frontend nyata

### B2 — Endpoint Chat & LLM Integration (~4-5 hari, paling kompleks)
- [ ] Implementasi `POST /api/chat` dengan intent detection sesuai
      `PROMPTS.md` bagian 1
- [ ] Implementasi logic tiap mode (ringkasan/kuis/reverse_bot/qa) sesuai
      `PROMPTS.md` bagian 2-5, mengembalikan bentuk `data` sesuai
      `API_CONTRACT.md` bagian 3
- [ ] Personalisasi kuis: fetch understanding_map sebelum generate soal
      (lihat `PROMPTS.md` bagian 3)
- [ ] Try-catch di sekitar parsing JSON dari LLM, fallback error yang jujur

### B3 — Sessions & Understanding Map (~2-3 hari)
- [ ] Implementasi `POST /api/sessions` sesuai `API_CONTRACT.md` bagian 4,
      termasuk upsert ke `understanding_map` DAN insert ke `score_history`
      saat mode reverse_bot selesai
- [ ] Implementasi `GET /api/topics/[topicId]/understanding-map` sesuai
      bagian 5
- [ ] Test seluruh alur backend end-to-end tanpa frontend (curl/Postman)

### B4 — Fitur Tambahan: Score History & Learning Profile (~2-3 hari)
- [ ] Implementasi `GET /api/topics/[topicId]/score-history` sesuai
      `API_CONTRACT.md` bagian 6
- [ ] Implementasi `GET /api/learning-profile` dan
      `POST /api/learning-profile/refresh` sesuai bagian 7-8, dengan prompt
      analisis lintas topik dari `PROMPTS.md` bagian 6
- [ ] Logic `enoughData`: tentukan threshold minimal (misal, understanding_map
      terisi di minimal 2 topic_id berbeda) sebelum mengizinkan refresh
- [ ] Fitur ini BOLEH dikerjakan belakangan/dipangkas jika waktu di jalur ini
      mepet — lihat "Prioritas Jika Waktu Mepet" di bawah

### B5 — Endpoint Settings (~1 hari)
- [ ] Implementasi `GET/PATCH /api/user/preferences` — baca/tulis lewat
      `user_metadata` Supabase Auth (BUKAN tabel baru, lihat `SETTINGS.md`)
- [ ] Implementasi `POST /api/user/delete-account` (opsional/bonus): hapus
      data user di semua tabel + panggil Supabase Admin API untuk hapus akun
- [ ] Update logic `should_suggest_diagnostic` di `POST /api/chat` supaya
      menghormati `showDiagnosticPrompt` dari preferensi user

## Sesi Integrasi (~3-4 hari, developer sendiri atau sesi AI ketiga)
- [ ] Gabungkan kode frontend (Jalur A) dan backend (Jalur B) dalam satu
      project/repo
- [ ] Ganti `lib/mockApi.ts` dengan pemanggilan real endpoint di `lib/api.ts`
- [ ] Jalankan tiap alur end-to-end, catat SEMUA ketidaksesuaian yang muncul
      antara ekspektasi frontend vs bentuk asli response backend
- [ ] Perbaiki ketidaksesuaian — kemungkinan besar akan ada beberapa meski
      sudah pakai `API_CONTRACT.md`, ini normal, jangan panik
- [ ] Integrasi PDF.js untuk ekstraksi teks dari PDF (bisa dikerjakan di sini
      jika belum sempat di Jalur A/B, karena ini murni client-side)
- [ ] Uji alur "Perbarui Analisis" Profil Belajar dengan data 2+ topik asli
      (bukan mock) untuk memastikan prompt lintas topik menghasilkan insight
      yang masuk akal, bukan cuma merangkum ulang tiap topik terpisah

## Tahap Akhir — Polish & Testing (~3-5 hari, sisa waktu sebelum deadline)
- [ ] Uji alur end-to-end dengan materi pelajaran asli (bukan lorem ipsum)
- [ ] Perbaiki edge case: materi kosong, PDF gagal parse, LLM response gagal
      di-parse JSON, sesi reverse-bot yang aneh/pendek
- [ ] Cek RLS Supabase benar-benar membatasi akses antar user (coba dengan
      2 akun berbeda) — termasuk tabel `score_history` dan `learning_profile`
- [ ] Accessibility check dasar: kontras warna, keyboard navigation, focus state
- [ ] Siapkan skenario demo yang SENGAJA mulai dari mode reverse-bot dulu
      (supaya juri melihat fitur unik produk, bukan cuma ringkasan/kuis biasa)
- [ ] (Jika ada waktu sisa) Stretch goal: dukungan gambar/OCR via vision model

## Prioritas Jika Waktu Mepet

Jika di minggu ke-3 ternyata waktu tidak cukup, urutan yang BOLEH dipangkas
(dari yang paling aman dipangkas ke paling penting dipertahankan):
1. Tombol "Hapus Akun" di Settings (A2c/B5 bagian ini) — paling aman
   dipangkas, fitur bonus yang tidak memengaruhi fungsi inti
2. Profil Belajar lintas topik (A2b/B4 bagian ini) — fitur tambahan,
   bukan fitur inti; kalau dipangkas, produk tetap utuh tanpa halaman ini
3. Sparkline histori skor (A2b/B4 bagian ini) — kalau dipangkas, panel kanan
   cukup tampilkan skor terkini saja seperti rencana awal (tanpa tren)
4. PDF upload (fallback: cukup teks paste saja untuk MVP)
5. Personalisasi kuis dari understanding_map (fallback: kuis generic tapi
   understanding_map & reverse-bot tetap ada, karena INI fitur unik utama)
6. Quick-action buttons di kartu ringkasan (fallback: user ketik manual)
7. Animasi highlight di panel kanan (fallback: update tanpa animasi)

JANGAN PERNAH memangkas: mode reverse-bot + understanding_map dasar (skor
terkini per sub-topik, TANPA histori), DAN tombol "Keluar" di Settings
(aplikasi tidak bisa dipakai wajar tanpa logout). Ini adalah value unik
produk yang
membedakan dari kompetitor lain di lomba — beda dengan Profil Belajar &
sparkline yang sifatnya penambah kedalaman, bukan fondasi.

## Peringatan Khusus Alur Kerja Paralel

- **Jangan mulai Jalur A dan B sebelum Tahap 0 selesai total.** Godaan
  terbesar adalah langsung lompat ke frontend/backend karena sudah tidak
  sabar, tapi kalau kontrak belum fixed, waktu yang "dihemat" dari kerja
  paralel akan habis lagi saat integrasi.
- **Kalau di tengah jalan salah satu AI perlu mengubah kontrak** (misal
  Luna sadar butuh field tambahan yang belum ada di `API_CONTRACT.md`),
  JANGAN biarkan sesi itu mengubah sendiri — bawa perubahan itu keluar,
  update `API_CONTRACT.md`, baru sampaikan perubahan itu ke sesi satunya
  juga. Ini mencegah dua sesi diam-diam punya asumsi kontrak yang beda.
