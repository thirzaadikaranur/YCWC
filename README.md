# ReverseTutor

AI study assistant yang membalik cara belajar konvensional: alih-alih hanya
menyuapi jawaban, ReverseTutor punya mode di mana **siswa yang mengajar AI**
(metode Feynman). Dari sesi ini, aplikasi mendeteksi bagian materi yang masih
lemah dipahami siswa, dan memakainya untuk mempersonalisasi kuis berikutnya.

> "Bukan kamu yang mengikuti materi, tapi materi yang mengikuti kamu."

## Fitur

- **Chat dengan deteksi maksud otomatis** — cukup ketik dalam bahasa natural,
  AI mengenali apakah kamu ingin ringkasan, kuis, mode "jelaskan ke saya"
  (reverse teaching), atau tanya jawab bebas
- **Upload materi** — teks (paste langsung) atau PDF
- **Peta pemahaman personal** — hasil dari sesi reverse teaching disimpan
  per sub-topik, dan dipakai untuk memfokuskan kuis ke bagian yang masih lemah
- **Dashboard progres** — lihat status pemahaman tiap topik yang pernah
  dipelajari

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — Auth & Postgres database
- LLM: Google Gemini 3.5 Flash (free tier, model string `gemini-3.5-flash`) / Groq sebagai alternatif

## Menjalankan Secara Lokal

### Prasyarat

- Node.js 18+ dan npm/pnpm/yarn
- Akun [Supabase](https://supabase.com/) (gratis) untuk project database
- API key [Gemini](https://aistudio.google.com/apikey) atau
  [Groq](https://console.groq.com/keys)

### Langkah Setup

1. Clone repo ini dan install dependency:
   ```bash
   git clone <url-repo-ini>
   cd reversetutor
   npm install
   ```

2. Buat project baru di [Supabase Dashboard](https://supabase.com/dashboard),
   lalu jalankan SQL setup dari `docs/SCHEMA.md` di SQL Editor Supabase untuk
   membuat tabel dan mengaktifkan Row Level Security.

3. Salin `.env.example` menjadi `.env.local`, lalu isi dengan kredensial asli:
   ```bash
   cp .env.example .env.local
   ```
   Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari
   Supabase Dashboard > Project Settings > API, serta API key LLM pilihanmu.

   **PENTING:** pastikan `.env.local` ada di `.gitignore` (bawaan
   `create-next-app` biasanya sudah otomatis, tapi cek ulang) SEBELUM commit
   pertama. Kalau key asli sudah terlanjur ter-commit ke git, mengubah/hapus
   filenya di commit berikutnya TIDAK cukup — key itu tetap ada di riwayat
   git. Kalau ini terjadi, langsung generate ulang key baru (di Supabase &
   Google AI Studio) dan anggap key lama bocor, jangan hanya menghapusnya
   dari kode.

4. Jalankan development server:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000).

## Struktur Project

```
app/                    → Halaman & API Route (Next.js App Router)
  api/                  → Route Handler (backend: chat, topics, sessions)
components/             → Komponen UI, dipisah per unit (sidebar, chat, panel)
lib/                    → Helper (koneksi Supabase, pemanggilan API, prompt LLM)
types/                  → Definisi tipe TypeScript terpusat
docs/                   → Dokumen perencanaan (brief produk, skema database,
                          kontrak API, prompt AI, rencana build)
```

Detail lengkap tiap dokumen ada di folder `docs/`:
- `BRIEF.md` — konsep produk & desain
- `SCHEMA.md` — struktur database
- `API_CONTRACT.md` — kontrak endpoint API
- `PROMPTS.md` — system prompt LLM per mode

## Catatan Pengembangan

Project ini dikerjakan untuk kompetisi [nama lomba], dengan bantuan AI
coding assistant untuk frontend dan backend secara terpisah. Lihat
`docs/PLAN.md` untuk detail alur kerja.

### Batasan Free Tier Gemini

Aplikasi ini memakai Gemini 3.5 Flash lewat free tier Google AI Studio.
Beberapa hal yang perlu diperhatikan:
- Tier gratis berbagi kuota antara API dan AI Studio, sekitar **5-15
  request/menit** dan ~250.000 token/menit (angka pasti tergantung
  kebijakan Google saat ini — cek dashboard AI Studio kamu langsung,
  karena Google diketahui memangkas limit tier gratis signifikan pada
  Desember 2025 dan bisa berubah lagi kapan saja)
- Limit per-menit ini CUKUP KETAT untuk aplikasi chat interaktif — kalau
  testing berturut-turut dalam waktu singkat (misal demo ke beberapa juri
  bergantian), ada risiko kena rate limit di tengah demo
- Setiap kali user chat, itu 1 API call — sesi testing/development yang
  intensif bisa kena limit lebih cepat dari perkiraan
- Kalau limit tercapai, API akan mengembalikan error 429
  (`RESOURCE_EXHAUSTED`) — pastikan ada penanganan error yang jujur ke user
  ("Batas pemakaian AI hari ini tercapai, coba lagi nanti") bukan silent fail
- Untuk hari-H demo ke juri: SANGAT disarankan uji dulu seberapa cepat kuota
  habis dalam skenario mirip demo asli (beberapa kali chat berturut-turut),
  supaya tidak kaget saat demo sungguhan. Siapkan Groq sebagai fallback jika
  kode sudah mendukung keduanya, atau pertimbangkan generate API key baru
  H-1 untuk kuota yang lebih fresh

## Lisensi

[Sesuaikan — misal MIT, atau kosongkan jika tidak relevan untuk keperluan lomba]
