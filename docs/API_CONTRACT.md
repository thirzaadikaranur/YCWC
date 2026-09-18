# ReverseTutor — API Contract

Dokumen ini adalah SUMBER KEBENARAN TUNGGAL untuk bentuk request/response
API. Berikan file ini ke frontend (GPT-5.6 Luna) DAN backend (DeepSeek V4.1
Flash) di awal sesi masing-masing, sebelum keduanya mulai kerja.

Frontend membangun mock data sesuai bentuk di sini. Backend membangun
endpoint yang mengembalikan bentuk persis seperti di sini. Jangan menyimpang
dari kontrak ini tanpa mengupdate dokumen ini dulu dan menyebarkannya ulang
ke kedua sesi.

Konvensi penamaan: semua field pakai **camelCase** (baik di request maupun
response), meski kolom database di Supabase pakai snake_case. Konversi
snake_case ↔ camelCase adalah tanggung jawab backend (lakukan di layer API
Route, jangan bocorkan snake_case ke frontend).

---

## 1. `POST /api/topics`

Membuat topik baru dari materi yang diupload/paste. Backend akan memanggil
LLM untuk generate judul topik.

**Request:**
```ts
{
  rawMaterial: string; // teks materi (hasil paste atau ekstraksi PDF)
}
```

**Response (200):**
```ts
{
  topic: {
    id: string;
    title: string;
    rawMaterial: string;
    createdAt: string;   // ISO 8601
    lastAccessedAt: string;
  }
}
```

**Response (error, 400/500):**
```ts
{
  error: string; // pesan human-readable, akan ditampilkan ke user
}
```

---

## 2. `GET /api/topics`

Ambil daftar semua topik milik user yang sedang login (untuk sidebar).

**Response (200):**
```ts
{
  topics: Array<{
    id: string;
    title: string;
    lastAccessedAt: string;
    sessionCount: number;       // dihitung backend, jumlah baris di sessions
    overallScore: number | null; // rata-rata understanding_map, null jika belum ada data
    overallLabel: 'merah' | 'kuning' | 'hijau' | null;
  }>
}
```

---

## 3. `POST /api/chat`

Endpoint utama chat. Menerima pesan user, melakukan intent detection,
memanggil LLM sesuai mode, dan mengembalikan respons + metadata mode.

**Request:**
```ts
{
  topicId: string;
  message: string;
  // riwayat percakapan sesi ini (dikirim dari frontend, backend tidak
  // menyimpan state percakapan di antara request kecuali saat disimpan
  // eksplisit lewat endpoint sessions)
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

**Response (200) — bentuk dasar (semua mode):**
```ts
{
  intent: 'ringkasan' | 'kuis' | 'reverse_bot' | 'qa';
  response: string; // teks respons untuk ditampilkan (bisa berisi markdown ringan)
  shouldSuggestDiagnostic: boolean;
  // field tambahan di bawah TERGANTUNG intent, lihat bagian per-mode
  data?: SummaryData | QuizData | ReverseBotData | null;
}
```

**Jika `intent === 'ringkasan'`, `data` berbentuk `SummaryData`:**
```ts
{
  sections: Array<{
    heading: string;
    points: string[];
  }>;
}
```

**Jika `intent === 'kuis'`, `data` berbentuk `QuizData`:**
```ts
{
  questions: Array<{
    question: string;
    options: { A: string; B: string; C: string; D: string };
    correct: 'A' | 'B' | 'C' | 'D';
    explanation: string;
    relatedSubTopic: string;
  }>;
}
```

**Jika `intent === 'reverse_bot'`, `data` berbentuk `ReverseBotData`:**
```ts
{
  sessionShouldEnd: boolean;
  // hanya terisi jika sessionShouldEnd true (hasil analisis akhir sesi)
  diagnosis: Array<{
    subTopic: string;
    score: number;      // 0-100
    note: string;
  }> | null;
}
```

**Jika `intent === 'qa'`:** `data` adalah `null`, cukup pakai field `response`.

---

## 4. `POST /api/sessions`

Menyimpan satu sesi setelah selesai (dipanggil frontend saat user menutup/
menyelesaikan satu alur mode, ATAU otomatis oleh frontend saat
`sessionShouldEnd` true untuk reverse_bot).

**Request:**
```ts
{
  topicId: string;
  mode: 'ringkasan' | 'kuis' | 'reverse_bot' | 'qa';
  transcript: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
  resultSummary?: Record<string, unknown> | null; // skor kuis, atau diagnosis reverse_bot
}
```

**Response (200):**
```ts
{
  session: {
    id: string;
    createdAt: string;
  }
}
```

Catatan: jika `mode === 'reverse_bot'` dan `resultSummary` berisi diagnosis,
backend WAJIB melakukan upsert ke tabel `understanding_map` DAN insert baris
baru ke `score_history` (satu baris per sub_topic yang dianalisis) sebagai
bagian dari pemrosesan endpoint ini (bukan endpoint terpisah), supaya
frontend tidak perlu banyak call untuk satu aksi "selesai sesi reverse-bot".

---

## 5. `GET /api/topics/[topicId]/understanding-map`

Ambil peta pemahaman untuk satu topik (untuk render panel kanan).

**Response (200):**
```ts
{
  topicTitle: string;
  overallScore: number | null; // null jika belum ada entry sama sekali
  entries: Array<{
    subTopic: string;
    score: number;
    label: 'merah' | 'kuning' | 'hijau';
    note: string | null;
    updatedAt: string;
  }>;
}
```

Jika belum ada entry sama sekali, `entries` adalah array kosong `[]` dan
`overallScore` adalah `null` — frontend menampilkan empty state berdasarkan
kondisi ini.

---

## 6. `GET /api/topics/[topicId]/score-history`

Ambil histori skor per sub-topik untuk satu topik (untuk render sparkline
di panel kanan — fitur tambahan #8 di `BRIEF.md`).

**Response (200):**
```ts
{
  history: Record<string, Array<{ score: number; recordedAt: string }>>;
  // key = nama sub_topic, value = array titik skor terurut by recordedAt ASC
}
```

Jika sub-topik tertentu cuma punya 1 data point, tetap sertakan (frontend
yang memutuskan untuk tidak render sparkline kalau kurang dari 2 titik).

---

## 7. `GET /api/learning-profile`

Ambil profil belajar lintas topik milik user (untuk halaman Profil Belajar
— fitur tambahan #9 di `BRIEF.md`).

**Response (200):**
```ts
{
  profile: {
    insights: Array<{
      title: string;
      description: string;
      type: 'kekuatan' | 'kelemahan';
    }>;
    generatedAt: string;
  } | null; // null jika belum pernah digenerate
  enoughData: boolean; // true jika user punya cukup sesi reverse_bot lintas
                        // topik untuk analisis bermakna (minimal, misal, 2
                        // topik berbeda dengan understanding_map terisi)
}
```

---

## 8. `POST /api/learning-profile/refresh`

Memicu regenerasi profil belajar. Backend mengambil SEMUA understanding_map/
score_history milik user lintas semua topic_id, kirim ke LLM untuk analisis
pola (lihat `PROMPTS.md`), lalu upsert hasilnya ke `learning_profile`.

**Request:** tidak perlu body (user diambil dari token auth).

**Response (200):**
```ts
{
  profile: {
    insights: Array<{
      title: string;
      description: string;
      type: 'kekuatan' | 'kelemahan';
    }>;
    generatedAt: string;
  }
}
```

**Response (error, 400):** jika `enoughData` dari endpoint 7 adalah false,
endpoint ini menolak dengan pesan jujur:
```ts
{
  error: "Belum cukup data untuk menganalisis pola belajar. Selesaikan beberapa sesi 'Jelaskan ke Saya' di topik berbeda dulu."
}
```

---

## 9. Auth

**Login, Daftar, dan Keluar TIDAK lewat endpoint custom di dokumen ini.**
Ketiganya dipanggil langsung dari halaman Login (`BRIEF.md` 7.-1) lewat
Supabase JS SDK di client (`supabase.auth.signInWithPassword`,
`supabase.auth.signUp`, `supabase.auth.signOut`,
`supabase.auth.resetPasswordForEmail`) — Supabase Auth sudah menyediakan
endpoint-nya sendiri, tidak perlu Route Handler tambahan. Detail field
form ada di `SETTINGS.md` bagian Akun dan `BRIEF.md` bagian 7.-1.

Semua endpoint DI BAWAH INI mengasumsikan user sudah login lewat Supabase
Auth di frontend, dan token session Supabase dikirim di header:
```
Authorization: Bearer <supabase_access_token>
```
Backend memvalidasi token ini di setiap Route Handler sebelum memproses
request, dan menggunakan `user_id` dari token untuk semua query (memastikan
RLS di Supabase juga konsisten dengan ini, lihat `SCHEMA.md`).

Response error auth (401):
```ts
{
  error: "Sesi login tidak valid atau kedaluwarsa. Silakan login ulang."
}
```

---

## 10. `GET /api/user/preferences` & `PATCH /api/user/preferences`

Preferensi akun disimpan di `user_metadata` Supabase Auth (lihat
`SETTINGS.md`). Ditambahkan ke kontrak ini karena frontend memakainya.

**Response `GET` (200):**
```ts
{
  displayName: string;
  showDiagnosticPrompt: boolean;    // default true
  defaultQuizQuestionCount: number; // default 5
}
```

**Request `PATCH`:** boleh sebagian field:
```ts
{
  displayName?: string;
  showDiagnosticPrompt?: boolean;
  defaultQuizQuestionCount?: number; // 1-20
}
```

**Response `PATCH` (200):** objek preferensi lengkap (bentuk sama dengan GET).

---

## 11. `POST /api/user/delete-account`

Menghapus seluruh data user (topics, sessions, understanding_map,
score_history, learning_profile) lalu akun Supabase Auth-nya. Dipicu dari
Zona Sensitif di halaman Pengaturan setelah user mengetik ulang emailnya.

**Request:** tidak perlu body.

**Response (200):**
```ts
{
  success: true;
}
```

---

## Catatan untuk Frontend (Mock Data)

Saat backend belum siap, buat file `lib/mockApi.ts` yang meniru bentuk
persis semua response di atas, dengan delay artifisial (misal
`setTimeout` 500-800ms) supaya loading state juga bisa didesain dan
ditest dengan realistis. Titik pemanggilan API sebaiknya lewat satu file
`lib/api.ts` yang bisa gampang diswitch dari mock ke real endpoint.

## Catatan untuk Backend

Semua Route Handler WAJIB:
- Validasi input (tolak dengan 400 jika field wajib kosong/salah tipe)
- Try-catch di sekitar pemanggilan LLM, karena output LLM (walau diminta
  JSON) kadang gagal di-parse — jika gagal, kembalikan error 500 dengan
  pesan jujur, jangan menampilkan raw/broken JSON ke frontend
- Konsisten memakai bentuk response di atas persis, termasuk penamaan
  camelCase, supaya frontend tidak perlu mapping tambahan
