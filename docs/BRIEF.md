# ReverseTutor — Project Brief

## 1. Ringkasan Produk

**ReverseTutor** adalah AI study assistant untuk pelajar/mahasiswa Indonesia. Berbeda
dari chatbot edukasi biasa yang pasif menjawab pertanyaan, ReverseTutor memiliki
mode di mana **siswa yang mengajar AI** (metode Feynman / reverse teaching). Dari
sesi ini, AI mendeteksi "titik buta" pemahaman siswa dan menyimpannya sebagai
peta pemahaman per topik. Peta ini lalu dipakai untuk mempersonalisasi kuis yang
di-generate berikutnya.

**Filosofi:** "Bukan kamu yang mengikuti materi, tapi materi yang mengikuti kamu."
Diagnostic-first, tapi tidak memaksa — user tetap bebas memilih mode kapan saja.

## 2. Masalah yang Diselesaikan

Siswa sering merasa "sudah paham" setelah membaca ringkasan atau catatan, padahal
pemahamannya dangkal (ilusi kompetensi). Tools belajar berbasis AI yang ada
sekarang (ringkasan, kuis) umumnya generate konten generik dari materi, tanpa
tahu bagian mana yang benar-benar lemah di kepala siswa tersebut secara spesifik.

## 3. Fitur Inti (MVP)

1. **Upload materi** — teks (paste) atau PDF (ekstrak teks di frontend, PDF.js)
2. **Chat dengan intent detection** — AI mendeteksi dari bahasa natural user mau:
   - `ringkasan` — rangkum materi
   - `kuis` — buat soal latihan + kunci jawaban + pembahasan
   - `reverse_bot` — AI berperan sebagai "murid" yang diajar oleh user
   - `qa` — tanya jawab bebas soal materi
3. **Sistem peta pemahaman (understanding map)** — HANYA diisi dari sesi
   `reverse_bot`. Kuis TIDAK memengaruhi skor pemahaman (keputusan sengaja,
   untuk MVP tetap simple: satu sumber kebenaran skor).
4. **Personalisasi kuis** — jika topik punya data understanding_map, soal kuis
   diprioritaskan (bukan 100%, tapi mayoritas) ke sub-bagian dengan skor rendah.
5. **Ajakan diagnostic (bukan paksaan)** — jika topik BELUM punya data
   understanding_map dan user minta ringkasan/kuis, AI menyisipkan ajakan halus
   di akhir responsnya untuk coba mode reverse_bot. User boleh mengabaikan.
6. **Dashboard peta pemahaman** — panel yang menampilkan skor per sub-bagian
   materi untuk topik yang sedang aktif dilihat.
7. **Autentikasi & penyimpanan** — Supabase Auth + Postgres, data topik/sesi/
   understanding map per user.

## 3b. Fitur Tambahan (Dibangun di Atas Fondasi Fitur Inti)

Dua fitur ini MEMPERDALAM value proposition yang sama (AI yang benar-benar
mengenal progres siswa), bukan fitur berdiri sendiri. Keduanya harus
dirancang SEKALIGUS dengan fitur inti sejak Step 5 (bangun halaman di
OpenCode, lihat `STEP5_BERTAHAP.md`) — bukan
ditambahkan belakangan setelah kode jadi, karena akan memicu bolak-balik
desain-ke-kode yang berisiko (lihat `PLAN.md` dan `STEP_BY_STEP.md`).

**Catatan prioritas:** jika waktu mepet di minggu-minggu akhir, fitur ini
BOLEH dipangkas (lihat `PLAN.md` bagian "Prioritas Jika Waktu Mepet") —
beda dengan reverse-bot + understanding_map dasar yang TIDAK BOLEH dipangkas.

8. **Grafik Histori Skor per Sub-Topik** — setiap kali understanding_map
   di suatu sub-topik diupdate (dari sesi reverse-bot baru), sistem
   MENYIMPAN snapshot skor lama sebagai catatan histori (append-only),
   bukan menimpa tanpa jejak. Panel kanan menampilkan tren skor dari waktu
   ke waktu di samping tiap baris sub-topik (misal 35% → 58% → 80% dalam
   3 sesi) — bukti visual konkret progres belajar, kuat untuk demo ke juri.

9. **Profil Belajar Lintas Topik** — halaman/tampilan terpisah (bukan
   bagian dari satu topik tertentu) yang menganalisis SEMUA sesi
   reverse-bot siswa di SELURUH topik yang pernah dipelajari, mencari pola
   kelemahan/kekuatan yang berulang secara umum. Contoh insight: "Kamu
   sering kesulitan memberi contoh konkret — ini muncul di beberapa topik
   berbeda" atau "Kamu kuat mengingat definisi, tapi lemah menjelaskan
   hubungan sebab-akibat". Dianalisis ON-DEMAND lewat tombol "Perbarui
   Analisis" (BUKAN otomatis tiap sesi selesai), untuk menghemat
   pemanggilan LLM dan menjaga rate limit Gemini tidak cepat habis.

## 4. Yang BUKAN Bagian dari MVP (jangan dikerjakan dulu)

- OCR gambar / upload foto tulisan tangan (stretch goal, bukan wajib)
- Full-text search isi materi (search sidebar hanya cari nama topik)
- Kuis memengaruhi skor pemahaman
- Mode belajar linear yang dipaksa berurutan
- Kolaborasi multi-user / sharing topik antar akun
- Gamifikasi (badge, XP, leaderboard) — bisa jadi ide lanjutan, bukan MVP

## 5. Tech Stack

- Frontend: **Next.js (App Router)** + **Tailwind CSS** + **TypeScript**.
  Developer sedang belajar TypeScript, jadi mulai dengan tipe-tipe sederhana
  dulu (interface untuk Topic, Session, UnderstandingMapEntry) sebelum masuk
  ke pola yang lebih kompleks (generics, discriminated unions untuk tiap
  mode chat, dsb).
- Struktur komponen: pecah per unit UI yang jelas (`components/QuizCard`,
  `components/ReverseBotBubble`, `components/UnderstandingPanel` — termasuk
  logic toggle buka/tutupnya, `components/TopicSidebar`, `components/
  AuthForm`, dst) — JANGAN taruh semua logic UI dalam satu file besar. ALASAN: kriteria penilaian lomba ini termasuk **kerapihan
  kode**, jadi struktur folder & pemisahan komponen yang jelas itu penting,
  bukan sekadar preferensi gaya.
- Tipe data inti didefinisikan terpusat di `types/index.ts`, merefleksikan
  struktur tabel di `SCHEMA.md`, misal:
  ```ts
  interface Topic {
    id: string;
    title: string;
    rawMaterial: string;
    createdAt: string;
    lastAccessedAt: string;
  }

  type ChatMode = 'ringkasan' | 'kuis' | 'reverse_bot' | 'qa';

  interface UnderstandingMapEntry {
    subTopic: string;
    score: number;
    label: 'merah' | 'kuning' | 'hijau';
    note: string | null;
  }

  interface ScoreHistoryPoint {
    score: number;
    recordedAt: string;
  }

  interface LearningProfileInsight {
    title: string;
    description: string;
    type: 'kekuatan' | 'kelemahan';
  }
  ```
  File terpusat ini juga bagus untuk penilaian kerapihan — juri bisa langsung
  lihat bentuk data aplikasi tanpa harus menelusuri banyak file.
- PDF parsing: pdf.js (client-side)
- Backend/DB/Auth: Supabase (Postgres + Auth)
- LLM: Google **Gemini 3.5 Flash** (`gemini-3.5-flash`, free tier — model
  Flash terbaru Google saat ini, rilis GA Mei 2026. CATATAN: `gemini-1.5-flash`
  dan `gemini-2.5-flash` adalah generasi lebih lama, pastikan pakai string
  model `gemini-3.5-flash` yang benar) atau Groq sebagai alternatif — dipanggil lewat
  Next.js API Route / Route Handler (JANGAN expose API key di client component)
- Deployment: target Vercel (paling native untuk Next.js, nyaris zero-config)

### Catatan Tim & Alat Bantu AI

Developer mengerjakan proyek ini dengan bantuan AI coding assistant, dengan
pembagian peran:
- **Frontend (UI/komponen)**: GPT-5.6 Luna, dikerjakan di sesi/chat terpisah
- **Backend (API routes, integrasi Supabase, integrasi LLM)**: DeepSeek V4.1
  Flash (via OpenCode), dikerjakan di sesi/chat terpisah, lalu mengintegrasikan
  hasil frontend dengan backend yang dibuat

Alasan pemisahan ini: menghindari context rot (kualitas output menurun saat
satu sesi chat AI menangani terlalu banyak konteks/kompleksitas sekaligus).

**KRITIS — Kontrak Data Harus Fixed Sebelum Kerja Paralel Dimulai**

Karena frontend dan backend dikerjakan di sesi terpisah oleh model berbeda,
TIDAK ADA proses "menyesuaikan sambil jalan" antara keduanya. Kontrak berikut
HARUS disepakati dan ditulis eksplisit sebelum kedua AI mulai kerja, supaya
integrasi di akhir tidak berantakan:

1. **Bentuk tipe data** — `types/index.ts` (lihat bagian Tech Stack) adalah
   sumber kebenaran tunggal. Berikan file ini ke KEDUA AI di awal sesi
   masing-masing, jangan biarkan salah satu AI membuat tipe sendiri.
2. **Kontrak API endpoint** — sebelum kerja paralel dimulai, tentukan dulu:
   - Daftar endpoint yang dibutuhkan (contoh: `POST /api/chat`,
     `POST /api/topics`, `GET /api/topics/[id]/understanding-map`)
   - Request body & response shape tiap endpoint (bentuk JSON persis)
   - Kode status/format error yang dikembalikan saat gagal
   Tulis ini di dokumen terpisah `API_CONTRACT.md` SEBELUM memberi instruksi
   ke kedua AI, supaya Luna bisa membangun frontend dengan MOCK data yang
   sesuai bentuk asli, dan DeepSeek membangun backend yang match persis.
3. **Frontend dibangun dengan mock/dummy data dulu** — supaya Luna tidak
   perlu menunggu backend selesai, gunakan mock function yang meniru bentuk
   response asli sesuai `API_CONTRACT.md`. Saat backend selesai, tinggal
   ganti mock dengan pemanggilan API asli (idealnya cukup ganti 1 file
   `lib/api.ts` yang jadi satu-satunya titik pemanggilan API dari frontend).
4. **Sesi integrasi terpisah** — setelah frontend dan backend masing-masing
   selesai dan bisa jalan sendiri-sendiri, lakukan sesi ketiga (bisa dengan
   AI mana saja, atau developer sendiri) khusus untuk menyambungkan
   keduanya dan memperbaiki ketidaksesuaian yang muncul. Jangan berharap
   hasil dari dua sesi terpisah langsung nyambung sempurna tanpa sesi ini.

Konsekuensi lain untuk kerapihan kode:
- Karena dua model berbeda mengerjakan frontend vs backend, ada risiko
  inkonsistensi penamaan (misal `camelCase` vs `snake_case` di response API
  vs yang dipakai komponen). `types/index.ts` dan `API_CONTRACT.md` adalah
  alat utama untuk mencegah ini — pastikan keduanya dirujuk secara konsisten.
- Developer tetap perlu memahami output dari kedua AI, minimal cukup untuk
  menjelaskan struktur kode saat sesi tanya-jawab dengan juri (jika ada), dan
  cukup untuk jadi "penengah" saat sesi integrasi menemukan ketidaksesuaian.

## 6. Desain Visual (Design Tokens)

### Warna
| Token | Hex | Penggunaan |
|---|---|---|
| `--color-bg` | `#1B1F3B` | Background utama (deep indigo-navy) |
| `--color-surface` | `#F5F3EE` | Background kartu/panel (off-white hangat) |
| `--color-accent` | `#E8542E` | CTA, elemen aktif, aksen mode reverse-bot (burnt orange-red) |
| `--color-success` | `#7C9885` | Indikator "paham/kuat" (sage green) |
| `--color-warning` | `#C9A959` | Indikator "perlu diulang" (muted gold) |
| `--color-danger` | `#C1443C`| Indikator "lemah" (merah, turunan dari accent, jangan pakai merah generik #FF0000) |
| `--color-border` | `#2E3358` | Border/elemen sekunder (indigo lebih terang) |

### Tipografi
- Display/heading: **Fraunces** (serif, untuk judul topik, headline)
- Body/UI: **Inter** (sans-serif, untuk chat, tombol, teks umum)
- Line length body text: < 80 karakter per baris

### Layout (3 kolom, desktop-first tapi responsive)
Implementasikan sebagai komponen terpisah: `<Sidebar />`, `<WorkArea />`,
`<UnderstandingPanel />`, disusun dalam satu `layout.js`/halaman utama.
```
┌─────────────────────────────────────────┐
│  Header: Logo | Nama User | Menu         │
├───────────┬───────────────────┬─────────┤
│ Sidebar   │   Area Kerja      │  Panel  │
│ Topik     │   (chat + kartu   │  Peta   │
│ (kiri)    │   kontekstual)    │  Paham  │
│           │                   │  (kanan)│
└───────────┴───────────────────┴─────────┘
```
Mobile: sidebar & panel kanan jadi drawer/collapsible, area kerja full width jadi prioritas.

### Motion
Hanya SATU signature animation: highlight transisi warna pada baris sub-bagian
di panel kanan saat skor ter-update setelah sesi reverse-bot selesai (dari abu-abu
netral ke warna status, transisi ~600ms ease-out). Jangan tambahkan animasi
hover/fade-in di elemen lain — sesuai prinsip "spend boldness in one place".

## 7. Detail UI per Komponen

### 7.-1 Halaman Login / Daftar

Muncul saat: belum ada sesi login aktif (pertama buka app, atau setelah
logout). Halaman berdiri sendiri, TANPA sidebar/panel — layout kartu
terpusat di atas `--color-bg`.

**Struktur:**
- Logo/ikon ReverseTutor warna aksen + judul Fraunces di atas kartu
- Kartu (`--color-surface`) berisi form dengan DUA mode yang bisa
  ditoggle tanpa reload halaman: **Masuk** (email, password) dan
  **Daftar** (nama tampilan, email, password)
- Link kecil "Lupa password?" di bawah form Masuk — mengarah ke flow
  reset password bawaan Supabase (kirim email reset), BUKAN form custom
- Tombol utama warna aksen ("Masuk" / "Buat Akun" sesuai mode aktif),
  dengan state loading saat submit
- Pesan error inline yang jujur (misal "Email atau password salah",
  "Email sudah terdaftar") — ikuti prinsip copy di bagian 8

**Alur setelah berhasil:** Masuk/Daftar sukses → redirect ke Halaman Awal
(7.0) kalau belum ada topik, atau ke topik terakhir diakses kalau sudah ada.

**Alur logout:** logout dipicu dari tombol "Keluar" di Settings (lihat
`SETTINGS.md` kategori Akun) — bukan dari halaman ini. Setelah logout,
user diarahkan kembali ke halaman ini.

### 7.0 Layar Awal / "Chat Baru" (Belum Ada Topik Aktif)

Muncul saat: pertama kali buka app (belum pernah ada topik sama sekali),
ATAU user sengaja klik "+ Topik Baru" tanpa memilih topik existing. Desain
meniru pola layar awal chatbot standar (referensi: layar awal aplikasi
Claude) — sengaja dibuat SEDERHANA dan familiar dulu, sebelum keunikan
ReverseTutor muncul lewat pemakaian sebenarnya.

**Struktur:**
- Header minimal: ikon hamburger (buka sidebar) di kiri, TANPA judul topik
  (karena belum ada topik aktif). Tidak perlu banner promosi apa pun (beda
  dari referensi Claude yang punya banner upgrade — tidak relevan untuk MVP
  lomba).
- **Tengah layar (vertically centered):**
  - Ikon/logo ReverseTutor berwarna aksen (`--color-accent`, burnt-orange),
    bentuk sederhana (misal bintang/asterisk atau ikon custom, BUKAN emoji
    generik)
  - Teks sapaan singkat dengan font Fraunces, contoh: **"Ada yang mau kamu
    pelajari hari ini?"**
- **Chip quick-start** di bawah teks sapaan — 4 pilihan mewakili tiap mode,
  supaya keunikan reverse-bot langsung terlihat sejak layar pertama, bukan
  tersembunyi di menu:
  - "Ringkas materi"
  - "Buat kuis"
  - **"Jelaskan ke saya"** — beri penekanan visual berbeda (border warna
    aksen, atau sedikit lebih menonjol dari 3 chip lain) karena ini fitur
    pembeda utama produk
  - "Tanya bebas"
  Klik salah satu chip mengarahkan fokus ke input bar dengan placeholder
  yang menyesuaikan mode terpilih.
- **Input bar fixed di bawah layar** (mengikuti pola Claude): bentuk pill
  besar, placeholder "Kirim atau tempel materi untuk mulai...", ikon "+" di
  kiri untuk upload PDF/paste teks lebih terstruktur, tombol kirim di kanan.

**Transisi ke chat normal:** begitu user mengirim pesan pertama (lewat chip
ATAU ngetik bebas + materi), sistem otomatis membuat topic baru (judul
di-generate AI dari materi), lalu tampilan bertransisi ke chat normal
dengan sidebar + panel kanan aktif seperti dijelaskan di 7.1-7.3. Layar
awal ini TIDAK pernah punya sidebar/panel kanan terbuka bersamaan — itu
baru muncul setelah topik pertama terbentuk.

### 7.1 Sidebar Kiri — Daftar Topik

Pola UI mengikuti gaya sidebar/drawer Claude (referensi: aplikasi Claude
mobile) — familiar bagi banyak user AI chat app, jadi tidak perlu belajar
pola baru:

- **Perilaku di mobile:** sidebar adalah **drawer yang di-toggle** (bukan
  kolom yang selalu terlihat), dibuka lewat ikon hamburger di header. Drawer
  menutupi/overlay area kerja saat terbuka, bukan mendorong konten ke
  samping. Di desktop/tablet (layar lebar), sidebar boleh tetap sebagai
  kolom persisten seperti rencana 3-kolom awal.
- **Tombol utama di paling atas:** "+ Topik Baru" — dibuat menonjol (warna
  aksen `--color-accent`), sejajar dengan pola "Chat baru" di Claude
- **Navigasi 2 tab di bawah tombol utama:** "Topik" dan "Profil Belajar" —
  mengikuti pola pemisah Obrolan/Proyek/Artefak di sidebar Claude. Tab
  "Topik" (default) menampilkan daftar topik seperti biasa. Tab "Profil
  Belajar" membuka tampilan terpisah (lihat 7.4) yang TIDAK terikat ke satu
  topik tertentu.
- **Search bar** tepat di bawah navigasi tab (hanya aktif di tab "Topik"),
  bentuk pill/rounded, dengan ikon kaca pembesar
- **Bagian "Terbaru"** sebagai label section di atas daftar topik (teks
  kecil, warna redup, mirip label "Terbaru" di Claude) — untuk MVP cukup
  satu section ini saja, tidak perlu pengelompokan tanggal yang lebih detail
  (hari ini/kemarin/minggu ini) kecuali ada waktu lebih
- **Item topik aktif/terpilih:** mendapat highlight pill berbentuk rounded
  penuh (bukan cuma garis/border kiri), mengikuti pola item terpilih di
  Claude
- **Footer sidebar (fixed di bawah, selalu terlihat meski daftar discroll):**
  avatar/inisial user + nama + ikon gear/settings — mengikuti pola akun
  user di bagian bawah sidebar Claude. Klik ikon gear membuka **halaman
  Settings penuh** (BUKAN dropdown kecil — lihat `SETTINGS.md` untuk detail
  lengkap 3 kategori: Umum, Belajar, Akun; termasuk ganti password, toggle
  preferensi belajar, dan logout).

Tiap item topik dalam daftar menampilkan:
1. Titik indikator warna (rata-rata understanding_map topik itu; abu-abu jika belum ada data)
2. Nama topik (auto-generated oleh AI dari materi yang diupload, maks ~40 karakter)
3. Jumlah sesi (badge kecil, misal "3 sesi")
4. Waktu relatif terakhir diakses (misal "2 hari lalu")

Urutan default: terakhir diakses paling atas.
Empty state search: "Nggak ketemu. Coba kata kunci lain, atau mulai topik baru."

### 7.2 Area Kerja Tengah
Satu alur chat berkelanjutan. Isi bubble berubah bentuk sesuai mode:

**Mode qa:** bubble teks biasa, AI kiri, user kanan.

**Mode ringkasan:** kartu terstruktur (heading per sub-bagian + bullet poin),
diakhiri 2 tombol quick-action: "Buat kuis dari ini" / "Uji pemahamanku".

**Mode kuis:** satu kartu soal per giliran (bukan semua soal sekaligus).
```
Soal N dari TOTAL
[pertanyaan]
○ A  ○ B  ○ C  ○ D
[Tombol: Jawab]
```
Setelah dijawab: kartu berubah state menampilkan benar/salah + pembahasan
singkat langsung (feedback instan, bukan di akhir semua soal). Di akhir sesi,
kartu ringkasan skor kuis + daftar soal yang salah.

**Mode reverse_bot:** bubble AI memakai border/aksen warna `--color-accent`
(beda dari mode lain yang netral) agar user sadar sedang di mode ini. Gaya
bahasa AI personal & penasaran (persona: murid yang ingin benar-benar paham,
bukan asisten formal). Di akhir sesi muncul "kartu diagnosis" berisi sub-bagian
lemah/kuat, disusul update animasi di panel kanan.

### 7.3 Panel Kanan — Peta Pemahaman

**Toggle buka/tutup (fitur wajib):** panel ini punya tombol ikon di header
area kerja tengah (sejajar judul topik, sisi kanan) untuk collapse/expand
panel. Saat ditutup, panel slide keluar/lebar jadi 0 dengan transisi CSS
singkat (~200-300ms), dan area kerja tengah otomatis melebar mengisi
ruang yang ditinggalkan. Klik lagi untuk membuka kembali. Ini state UI
murni di frontend (tidak perlu disimpan ke akun/API) — cukup diingat
sementara selama sesi browser berjalan (opsional: simpan di
`localStorage` browser supaya tidak reset tiap reload, TAPI tidak perlu
disinkronkan ke akun/`user_metadata` — beda dari preferensi lain di
`SETTINGS.md` yang memang lintas-perangkat).

- Header: nama topik + skor keseluruhan (rata-rata semua sub-bagian)
- Daftar baris per sub-bagian materi: nama sub-bagian, skor %, label warna,
  catatan singkat kenapa (diambil dari analisis sesi reverse-bot), DAN
  sparkline mini (garis tren kecil, bukan grafik penuh) di sisi kanan baris
  yang menunjukkan histori skor dari sesi-sesi sebelumnya. Kalau baru ada
  1 data point (baru sesi pertama), sparkline tidak perlu ditampilkan
  (butuh minimal 2 titik untuk garis tren bermakna).
- Empty state (topik belum ada sesi reverse-bot): ajakan aktif dengan tombol
  langsung ke mode reverse-bot, contoh copy:
  "Belum ada data pemahaman untuk topik ini. Coba mode 'Jelaskan ke Saya' biar
  aku tahu bagian mana yang perlu diperkuat."

### 7.4 Halaman Profil Belajar (Global, Lintas Topik)

Diakses lewat tab "Profil Belajar" di sidebar (lihat 7.1). Ini TIDAK
menggantikan panel kanan per-topik — ini tampilan terpisah untuk insight
level lebih tinggi.

- Header: judul "Profil Belajar" + timestamp "Terakhir diperbarui: [waktu
  relatif]" + tombol "Perbarui Analisis" (warna aksen, memicu pemanggilan
  LLM baru — beri user tahu ini butuh beberapa detik, tampilkan loading state)
- Daftar kartu insight, tiap kartu berisi: judul singkat pola yang
  ditemukan, deskripsi 1-2 kalimat, warna border sesuai tipe (`--color-success`
  untuk kekuatan, `--color-warning`/`--color-danger` untuk kelemahan)
- Empty state (belum pernah generate, atau user belum punya cukup sesi
  reverse-bot di berbagai topik): "Belum ada cukup data untuk profil
  belajar. Selesaikan beberapa sesi 'Jelaskan ke Saya' di topik yang
  berbeda-beda dulu." — TIDAK menampilkan tombol "Perbarui Analisis" yang
  aktif kalau data belum cukup (nonaktifkan tombol, jangan biarkan user
  memicu analisis kosong yang buang-buang kuota Gemini)

## 8. Prinsip Penulisan Copy (UI Text)

- Bahasa Indonesia santai tapi jelas, bukan formal kaku
- Tombol pakai kata kerja aktif dan konsisten (misal "Jawab" bukan "Submit",
  "Mulai Topik Baru" bukan "Create")
- Error/empty state: jelaskan apa yang terjadi + apa yang bisa dilakukan,
  jangan generic "Terjadi kesalahan"
- Hindari eyebrow label ALL CAPS, hindari '→' di akhir tombol, hindari
  meta text dengan middle dot

## 9. Referensi Dokumen Lain

- `SCHEMA.md` — struktur tabel Supabase
- `PROMPTS.md` — system prompt untuk tiap mode AI + format structured output
- `PLAN.md` — urutan build yang disarankan
