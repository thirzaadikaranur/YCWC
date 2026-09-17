# ReverseTutor — Halaman Settings

Referensi pola visual: halaman Settings Claude (sidebar kategori kiri +
konten kanan berubah sesuai kategori dipilih). TAPI kategori yang dipakai
di sini SUDAH DISARING — bukan semua kategori Claude relevan untuk
ReverseTutor. Lihat bagian "Kategori yang Dilewati" di bawah untuk alasan
tiap coretan.

Dokumen ini adalah SPESIFIKASI FINAL Settings — dibangun langsung sebagai
kode (lihat `STEP5_BERTAHAP.md` Sesi 5), bukan lagi lewat prototipe desain
terpisah.

## Konsep & Pola Desain

- **Layout: halaman penuh terpisah** (bukan modal overlay seperti di
  Claude) — mengganti konten utama sementara, dengan tombol "Kembali ke
  belajar" untuk balik ke tampilan chat/topik terakhir. TIDAK menampilkan
  sidebar topik/drawer utama di halaman ini.
- **Header:** breadcrumb kecil "PREFERENSI AKUN" + judul besar "Pengaturan"
  (font Fraunces) + tombol "Kembali ke belajar" di kanan atas
- **Sidebar kategori kiri** (dalam halaman Settings ini, terpisah dari
  sidebar topik utama): list kategori, kategori aktif di-highlight
- **Konten kanan:** berubah sesuai kategori yang dipilih di sidebar kiri,
  berpindah lewat JS tanpa reload halaman
- **Akses:** klik ikon gear di footer sidebar utama membuka halaman ini

## Kategori yang DIPERLUKAN

### 1. Umum
- **Nama tampilan** — text input, disimpan ke profil user, dipakai untuk
  sapaan di aplikasi (misal di layar awal chat baru)
- **Avatar/inisial** — preview kecil di sebelah field nama tampilan,
  diambil otomatis dari huruf pertama nama (tidak perlu upload foto untuk
  MVP, cukup inisial bulat dengan warna aksen)
- **Bahasa antarmuka** — **read-only text "Bahasa Indonesia"**, BUKAN
  dropdown fungsional. Seluruh UI ReverseTutor memang hardcode Bahasa
  Indonesia (tidak ada rencana dukungan bahasa lain di `BRIEF.md`/`PLAN.md`
  manapun) — dropdown yang terlihat bisa diganti tapi sebenarnya tidak
  mengubah apa pun adalah elemen UI "pura-pura berfungsi" yang buruk untuk
  penilaian kerapihan/fungsi ke juri.

### 2. Belajar (fitur khas ReverseTutor — TIDAK ada di Claude, ini yang bikin beda)
- **Toggle "Tampilkan ajakan 'Jelaskan ke Saya' untuk topik baru"**
  (default ON) — kontrol langsung atas field `shouldSuggestDiagnostic` yang
  sudah ada di `API_CONTRACT.md`. User yang merasa ajakan ini mengganggu
  bisa mematikannya.
- **(Opsional) Jumlah soal default per sesi kuis** — dropdown 5/10, default
  5. Kalau waktu mepet, skip ini dan hardcode 5 saja di backend, tidak
  perlu jadi setting.
- **Ringkasan singkat (read-only)** — "Kamu sudah mempelajari N topik,
  rata-rata pemahaman keseluruhan X%". Dihitung dari data yang SUDAH ADA
  (`GET /api/topics` untuk jumlah topik + rata-rata `overallScore` tiap
  topik yang tidak null) — TIDAK butuh endpoint baru, TIDAK butuh tabel
  baru. Kalau belum ada topik sama sekali, tampilkan "Belum ada topik
  yang dipelajari" alih-alih angka 0%/NaN.

### 3. Akun
- **Email** — read-only, diambil dari Supabase Auth, bukan bisa diedit di
  sini
- **Bergabung sejak [tanggal]** — read-only, diambil dari
  `created_at` bawaan Supabase Auth (tidak perlu kolom baru)
- **Tombol "Ganti Password"** — arahkan ke flow reset password bawaan
  Supabase (kirim email reset), JANGAN bikin form ganti password custom
  sendiri (butuh validasi current password, menambah kompleksitas tanpa
  manfaat besar untuk MVP)
- **Tombol "Keluar"** — logout via Supabase Auth (`supabase.auth.signOut()`),
  WAJIB ADA, lalu redirect ke halaman Login (`BRIEF.md` 7.-1)
- **Section "Zona Sensitif"** (divider terpisah dari 2 tombol di atas):
  - **Tombol "Hapus Akun"** (opsional/bonus, lihat Prioritas di bawah) —
    menghapus SEMUA data user (topics, sessions, understanding_map,
    score_history, learning_profile) DAN akun Supabase Auth-nya. WAJIB
    pakai dialog konfirmasi destruktif (misal user harus ketik ulang
    emailnya) sebelum eksekusi, karena aksi ini tidak bisa dibatalkan.
    Warna tombol danger, BUKAN warna aksen biasa.

## Kategori yang DILEWATI (ada di Claude, TIDAK relevan untuk ReverseTutor MVP)

| Kategori Claude | Kenapa dilewati |
|---|---|
| Penagihan | Tidak ada monetisasi di MVP lomba |
| Kemampuan | Spesifik fitur Claude (web search, dll), tidak relevan |
| Memori | Konsep "AI mengingat" ReverseTutor sudah ditangani lewat understanding_map & learning_profile — bukan lewat toggle memori terpisah |
| Refleksi | Fitur spesifik Claude, tidak ada padanan di ReverseTutor |
| Notifikasi | Belum ada infrastruktur notifikasi (push/email reminder) apa pun di `BRIEF.md`/`PLAN.md`/`API_CONTRACT.md`. Tab kosong yang tidak berfungsi lebih buruk daripada tidak ada tab sama sekali |
| Waktu dan fokus | Temanya cocok untuk study app (tracking waktu belajar), TAPI scope creep besar untuk timeline 3-4 minggu — simpan sebagai ide v2, bukan MVP |
| Claude Code, Skills, Konektor, Plugin | Semua developer tooling Claude, tidak ada padanan sama sekali |

## Struktur Final

**Sidebar Settings: Umum | Belajar | Akun** — 3 kategori, final.

## Tipe Data Tambahan (`types/index.ts`)

```ts
interface UserPreferences {
  displayName: string;
  showDiagnosticPrompt: boolean; // default true
  defaultQuizQuestionCount: number; // default 5, opsional — boleh skip
}
```

Catatan: state buka/tutup panel Peta Pemahaman (`BRIEF.md` 7.3) SENGAJA
TIDAK dimasukkan ke `UserPreferences`/`user_metadata` — itu state UI lokal
per sesi browser, bukan preferensi akun lintas-perangkat, jadi cukup
`useState`/`localStorage` di frontend saja.

**KEPUTUSAN PENYIMPANAN (final):** preferensi ini disimpan lewat
`user_metadata` bawaan Supabase Auth (`auth.updateUser({ data: {...} })`),
**BUKAN tabel baru**. Beda dengan `score_history`/`learning_profile` yang
memang butuh tabel sendiri, 3 field ini cukup kecil dan tidak perlu query
relasional — jadi TIDAK PERLU migrasi skema/Step 3B-style lagi. Ini bisa
langsung diimplementasikan di Step 5.5 (frontend)/Step 6 (backend) tanpa
sesi tambahan untuk database.

## Endpoint API Tambahan (perlu ditambahkan ke `API_CONTRACT.md` jika dipakai)

- `GET /api/user/preferences` — ambil preferensi user dari `user_metadata`
  (displayName, showDiagnosticPrompt, defaultQuizQuestionCount)
- `PATCH /api/user/preferences` — update salah satu/semua field di atas ke
  `user_metadata`
- `POST /api/user/delete-account` — (opsional/bonus) hapus semua data user
  di tabel `topics`/`sessions`/`understanding_map`/`score_history`/
  `learning_profile` (via cascade atau query manual), DIIKUTI pemanggilan
  Supabase Admin API untuk hapus akun Auth-nya

Catatan soal Login/Daftar/Keluar: KETIGANYA TIDAK lewat endpoint custom di
atas — dipanggil LANGSUNG dari frontend lewat Supabase JS SDK
(`supabase.auth.signInWithPassword`, `supabase.auth.signUp`,
`supabase.auth.signOut`, `supabase.auth.resetPasswordForEmail`). Tidak
perlu Route Handler tambahan untuk ini, Supabase Auth sudah menyediakan
endpoint-nya sendiri.

Catatan lain: `should_suggest_diagnostic` logic yang sudah ada di prompt
intent detection (`PROMPTS.md` bagian 1) perlu diupdate untuk MENGHORMATI
`showDiagnosticPrompt` — kalau user sudah matikan toggle ini, jangan
sisipkan ajakan apa pun meski topik masih baru.

## Prioritas Jika Waktu Mepet (mengikuti pola `PLAN.md`)

Urutan boleh dipangkas, dari paling aman ke paling penting dipertahankan:
1. Tombol "Hapus Akun" — paling aman dipangkas duluan (fitur bonus)
2. Ringkasan singkat statistik di kategori Belajar — nice-to-have, bukan inti
3. Jumlah soal kuis default (UI-nya) — hardcode 5 di backend, skip settingnya
4. Toggle "Tampilkan ajakan diagnostic" — hardcode selalu ON, skip togglenya
5. Kategori "Belajar" secara keseluruhan — kalau dipangkas semua, cukup
   sisakan Umum + Akun saja

**JANGAN pangkas:** halaman Login/Daftar dan tombol "Keluar" (logout) —
aplikasi tidak bisa dipakai dengan wajar tanpa keduanya. Nama tampilan di
kategori Umum juga murah untuk diimplementasikan, tidak perlu dipangkas.
