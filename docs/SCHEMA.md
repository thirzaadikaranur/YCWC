# ReverseTutor — Database Schema (Supabase / Postgres)

## Prinsip Umum

- Semua tabel (kecuali auth bawaan Supabase) WAJIB punya Row Level Security
  (RLS) aktif — user hanya bisa akses baris miliknya sendiri (`user_id = auth.uid()`).
- Ini KRITIS. Jangan skip RLS meski untuk MVP/demo — banyak proyek vibe-coded
  bocor data user karena lupa langkah ini.

## Tabel

### `topics`
Menyimpan satu topik belajar (satu materi yang diupload).

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid, PK, default gen_random_uuid() | |
| `user_id` | uuid, FK ke auth.users | |
| `title` | text | Nama topik, auto-generated AI dari materi |
| `raw_material` | text | Teks materi asli (hasil paste atau ekstraksi PDF) |
| `created_at` | timestamptz, default now() | |
| `last_accessed_at` | timestamptz, default now() | Update setiap kali topik dibuka/dipakai |

### `sessions`
Menyimpan satu interaksi/sesi per mode.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid, PK | |
| `topic_id` | uuid, FK ke topics | |
| `user_id` | uuid, FK ke auth.users | (redundant tapi memudahkan RLS langsung di tabel ini) |
| `mode` | text | salah satu: `ringkasan`, `kuis`, `reverse_bot`, `qa` |
| `transcript` | jsonb | Array pesan {role, content, timestamp} sepanjang sesi |
| `result_summary` | jsonb, nullable | Untuk kuis: skor & soal salah. Untuk reverse_bot: hasil diagnosis mentah sebelum ditulis ke understanding_map |
| `created_at` | timestamptz, default now() | |

### `understanding_map`
Satu baris = satu sub-bagian materi dalam satu topik, dengan skor pemahaman.
HANYA di-insert/update dari sesi bermode `reverse_bot`.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid, PK | |
| `topic_id` | uuid, FK ke topics | |
| `user_id` | uuid, FK ke auth.users | |
| `sub_topic` | text | Nama sub-bagian, misal "Hukum Termodinamika 1" |
| `score` | integer | 0-100 |
| `label` | text | `merah` \| `kuning` \| `hijau` (turunan dari score, boleh dihitung di frontend saja dan kolom ini opsional) |
| `note` | text, nullable | Catatan singkat kenapa skor segini, misal "Sering keliru arah energi" |
| `updated_at` | timestamptz, default now() | |

Constraint: `UNIQUE (topic_id, sub_topic)` — supaya update sub-bagian yang sama
menimpa baris lama (upsert), bukan menumpuk baris baru terus-menerus.

### `score_history`
Log APPEND-ONLY setiap kali skor sub-bagian berubah — beda dari
`understanding_map` yang selalu menimpa (upsert). Tabel ini yang jadi
sumber data untuk sparkline/grafik tren skor (fitur tambahan #8 di
`BRIEF.md`). Setiap upsert ke `understanding_map` HARUS diikuti satu
insert baru ke tabel ini, dalam operasi yang sama.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid, PK | |
| `topic_id` | uuid, FK ke topics | |
| `user_id` | uuid, FK ke auth.users | |
| `sub_topic` | text | Sama seperti di understanding_map |
| `score` | integer | 0-100, snapshot skor pada waktu itu |
| `session_id` | uuid, FK ke sessions, nullable | Sesi reverse_bot yang menghasilkan skor ini |
| `recorded_at` | timestamptz, default now() | |

TIDAK ada constraint unique di sini — baris baru selalu ditambahkan,
tidak pernah menimpa baris lama.

### `learning_profile`
Satu baris per user, menyimpan hasil analisis pola belajar lintas topik
(fitur tambahan #9 di `BRIEF.md`). Diregenerasi ON-DEMAND (tombol "Perbarui
Analisis"), bukan otomatis, untuk menghemat kuota Gemini.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid, PK | |
| `user_id` | uuid, FK ke auth.users, UNIQUE | Satu profil per user |
| `insights` | jsonb | Array of {title, description, type: 'kekuatan'\|'kelemahan'} |
| `generated_at` | timestamptz, default now() | |

## Contoh SQL Setup (starting point, sesuaikan saat implementasi)

```sql
create table topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  raw_material text not null,
  created_at timestamptz default now(),
  last_accessed_at timestamptz default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics not null,
  user_id uuid references auth.users not null,
  mode text not null check (mode in ('ringkasan','kuis','reverse_bot','qa')),
  transcript jsonb not null default '[]',
  result_summary jsonb,
  created_at timestamptz default now()
);

create table understanding_map (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics not null,
  user_id uuid references auth.users not null,
  sub_topic text not null,
  score integer not null check (score >= 0 and score <= 100),
  label text,
  note text,
  updated_at timestamptz default now(),
  unique (topic_id, sub_topic)
);

create table score_history (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics not null,
  user_id uuid references auth.users not null,
  sub_topic text not null,
  score integer not null check (score >= 0 and score <= 100),
  session_id uuid references sessions,
  recorded_at timestamptz default now()
);

create table learning_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  insights jsonb not null default '[]',
  generated_at timestamptz default now()
);

-- RLS
alter table topics enable row level security;
alter table sessions enable row level security;
alter table understanding_map enable row level security;
alter table score_history enable row level security;
alter table learning_profile enable row level security;

create policy "Users manage own topics" on topics
  for all using (auth.uid() = user_id);

create policy "Users manage own sessions" on sessions
  for all using (auth.uid() = user_id);

create policy "Users manage own understanding_map" on understanding_map
  for all using (auth.uid() = user_id);

create policy "Users manage own score_history" on score_history
  for all using (auth.uid() = user_id);

create policy "Users manage own learning_profile" on learning_profile
  for all using (auth.uid() = user_id);
```

## Query Pola Umum yang Akan Dipakai Aplikasi

1. **Ambil daftar topik untuk sidebar** (urut last_accessed_at desc)
2. **Ambil understanding_map untuk satu topic_id** (untuk render panel kanan
   & untuk dimasukkan ke prompt saat generate kuis)
3. **Cek apakah topic_id punya understanding_map sama sekali** (untuk logika
   ajakan diagnostic — kalau kosong, tampilkan ajakan)
4. **Upsert ke understanding_map** setelah sesi reverse_bot selesai dianalisis
   — DIIKUTI insert baris baru ke `score_history` dalam operasi yang sama
5. **Ambil score_history per topic_id**, dikelompokkan per sub_topic dan
   diurutkan by recorded_at (untuk render sparkline)
6. **Ambil learning_profile untuk user** (untuk halaman Profil Belajar) —
   null jika belum pernah digenerate
7. **Generate ulang learning_profile**: ambil SEMUA understanding_map/
   score_history milik user (lintas semua topic_id), kirim ke LLM untuk
   analisis pola, upsert hasilnya ke `learning_profile`
