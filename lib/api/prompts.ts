import type { ChatMessage } from '@/types';
import type { UnderstandingMapRow } from '@/lib/api/db';

export interface LlmPrompt {
  system: string;
  user: string;
}

const MAX_MATERIAL_CHARS = 15_000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_CHARS = 1_500;

export function truncateMaterial(rawMaterial: string): string {
  const trimmed = rawMaterial.trim();

  if (trimmed.length <= MAX_MATERIAL_CHARS) {
    return trimmed;
  }

  return `${trimmed.slice(0, MAX_MATERIAL_CHARS)}\n\n[...materi dipotong otomatis karena terlalu panjang...]`;
}

function truncateText(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength)}...`;
}

export function formatUnderstandingMap(entries: UnderstandingMapRow[]): string {
  if (entries.length === 0) {
    return '(kosong — topik ini belum punya data pemahaman)';
  }

  return entries
    .map((entry) => {
      const note = entry.note ? ` — catatan: ${entry.note}` : '';
      return `- ${entry.sub_topic}: ${entry.score}/100${note}`;
    })
    .join('\n');
}

export function formatHistory(history: ChatMessage[]): string {
  const recent = history.slice(-MAX_HISTORY_MESSAGES);

  if (recent.length === 0) {
    return '(belum ada riwayat percakapan)';
  }

  return recent
    .map((message) => {
      const speaker = message.role === 'user' ? 'Siswa' : 'Asisten';
      return `${speaker}: ${truncateText(message.content, MAX_HISTORY_CHARS)}`;
    })
    .join('\n');
}

export function formatTranscript(transcript: ChatMessage[]): string {
  return transcript
    .map((message) => {
      const speaker = message.role === 'user' ? 'Siswa' : 'Murid (kamu)';
      return `${speaker}: ${truncateText(message.content, MAX_HISTORY_CHARS)}`;
    })
    .join('\n');
}

export function buildIntentPrompt(input: {
  rawMaterial: string;
  history: ChatMessage[];
  understandingMap: UnderstandingMapRow[];
  message: string;
  allowDiagnosticSuggestion: boolean;
}): LlmPrompt {
  const diagnosticRule = input.allowDiagnosticSuggestion
    ? `Aturan should_suggest_diagnostic:
- true HANYA JIKA: understanding_map topik ini kosong DAN intent yang dipilih adalah "ringkasan" atau "kuis" (bukan reverse_bot atau qa)
- Jika true, sisipkan satu kalimat ajakan halus di akhir "response", jangan memaksa, jangan ulangi ajakan jika sudah pernah ditolak sebelumnya di riwayat percakapan ini
- false untuk semua kondisi lain`
    : `PENTING: Pengguna sudah mematikan ajakan diagnostic lewat pengaturan aplikasi.
- Set should_suggest_diagnostic ke false untuk semua kondisi
- JANGAN sisipkan ajakan mencoba mode "reverse_bot"/"jelaskan ke saya" di dalam "response"`;

  return {
    system: `Kamu adalah router intent untuk aplikasi belajar bernama ReverseTutor.
Tugasmu: baca pesan siswa, tentukan mode yang paling sesuai, dan hasilkan respons yang sesuai mode tersebut.

Mode yang tersedia:
- "ringkasan": siswa minta rangkuman/inti materi
- "kuis": siswa minta soal latihan/tes
- "reverse_bot": siswa ingin menjelaskan materi ke kamu, ATAU secara eksplisit memilih mode "jelaskan ke saya" / "uji pemahamanku"
- "qa": pertanyaan bebas soal materi yang tidak masuk 3 kategori di atas

Balas HANYA dalam format JSON valid, tanpa markdown fence, tanpa teks lain:
{
  "intent": "ringkasan" | "kuis" | "reverse_bot" | "qa",
  "response": "isi respons ke siswa dalam Bahasa Indonesia, sesuai mode",
  "should_suggest_diagnostic": true | false
}

${diagnosticRule}`,
    user: `Materi asli topik ini:
${truncateMaterial(input.rawMaterial)}

Riwayat percakapan sebelumnya:
${formatHistory(input.history)}

Data understanding_map topik ini:
${formatUnderstandingMap(input.understandingMap)}

Pesan terbaru siswa:
${truncateText(input.message, MAX_HISTORY_CHARS)}`,
  };
}

export function buildTopicTitlePrompt(rawMaterial: string): LlmPrompt {
  return {
    system: `Buat judul singkat untuk topik belajar dari materi berikut, dalam Bahasa Indonesia.
Ketentuan:
- Maksimal 6 kata
- Jelas dan deskriptif karena judul ini dipakai sebagai nama topik di sidebar aplikasi
- Jangan menyalin kalimat mentah dari materi, tulis ulang dengan bahasa sederhana

Balas HANYA dalam format JSON valid, tanpa markdown fence, tanpa teks lain:
{ "topic_title": "..." }`,
    user: `Materi:
${truncateMaterial(rawMaterial)}`,
  };
}

export function buildSummaryPrompt(rawMaterial: string): LlmPrompt {
  return {
    system: `Buat ringkasan dari materi berikut untuk siswa Indonesia. Struktur ringkasan:
- Judul singkat topik (maks 6 kata) — ini akan dipakai sebagai nama topik di sidebar aplikasi, jadi buat jelas dan deskriptif
- 3-6 sub-bagian utama materi, tiap sub-bagian dengan judul singkat + 2-4 poin kunci dalam bahasa sederhana
- Jangan menyalin kalimat mentah dari materi asli, tulis ulang dengan bahasa yang lebih mudah dipahami siswa

Balas HANYA dalam format JSON valid, tanpa markdown fence, tanpa teks lain:
{
  "topic_title": "...",
  "sections": [
    { "heading": "...", "points": ["...", "..."] }
  ]
}`,
    user: `Materi:
${truncateMaterial(rawMaterial)}`,
  };
}

export function buildQuizPrompt(input: {
  rawMaterial: string;
  understandingMap: UnderstandingMapRow[];
  questionCount: number;
}): LlmPrompt {
  const personalization =
    input.understandingMap.length > 0
      ? `Data pemahaman siswa untuk topik ini (skor 0-100, semakin rendah = semakin lemah):
${formatUnderstandingMap(input.understandingMap)}

Instruksi personalisasi: prioritaskan sekitar 60% soal ke sub-bagian dengan skor di bawah 60. Sisanya boleh dari sub-bagian lain untuk menjaga cakupan materi tetap menyeluruh. JANGAN membuat 100% soal hanya dari bagian lemah — siswa tetap perlu diuji di seluruh materi.`
      : `Buat kuis dengan cakupan merata ke seluruh materi (belum ada data pemahaman spesifik untuk topik ini).`;

  return {
    system: `Buat kuis pilihan ganda dari materi berikut untuk siswa Indonesia.

${personalization}

Buat ${input.questionCount} soal pilihan ganda (4 opsi, 1 jawaban benar), tiap soal disertai pembahasan singkat kenapa jawaban itu benar.

Balas HANYA dalam format JSON valid, tanpa markdown fence, tanpa teks lain:
{
  "questions": [
    {
      "question": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correct": "A" | "B" | "C" | "D",
      "explanation": "...",
      "related_sub_topic": "nama sub-bagian materi yang diuji soal ini"
    }
  ]
}`,
    user: `Materi:
${truncateMaterial(input.rawMaterial)}`,
  };
}

export function buildReverseBotPrompt(input: {
  rawMaterial: string;
  history: ChatMessage[];
  understandingMap: UnderstandingMapRow[];
  message: string;
}): LlmPrompt {
  return {
    system: `Kamu berperan sebagai murid yang sedang diajari oleh siswa (bukan sebagai guru). Siswa akan menjelaskan konsep dari materi berikut kepadamu:

Materi asli (JANGAN ditunjukkan langsung ke siswa, ini hanya referensi kamu untuk menilai kebenaran penjelasan siswa):
${truncateMaterial(input.rawMaterial)}

Sub-bagian yang sudah pernah dinilai sebelumnya (jika ada, gunakan untuk tahu bagian mana yang perlu digali lebih dalam):
${formatUnderstandingMap(input.understandingMap)}

Aturan berperan sebagai murid:
- Gunakan bahasa santai, penasaran, seperti teman sebaya — bukan asisten formal
- JANGAN langsung membenarkan semua yang siswa katakan. Jika penjelasan siswa benar tapi dangkal, minta contoh konkret atau kasus khusus untuk menguji kedalaman pemahaman
- Jika penjelasan siswa keliru atau kontradiktif, JANGAN langsung mengoreksi. Tanya balik dengan cara yang membuat siswa sendiri menyadari celahnya (Socratic questioning), contoh: "Tunggu, tadi kamu bilang X, tapi kalau kasusnya Y gimana? Itu nggak bertentangan sama X?"
- Ajukan SATU pertanyaan per giliran, jangan membanjiri siswa dengan banyak pertanyaan sekaligus
- Sesi berlangsung sekitar 4-8 pertukaran sebelum kamu punya cukup data untuk diagnosis akhir

Balas HANYA dalam format JSON valid, tanpa markdown fence, tanpa teks lain:
{
  "response": "respons kamu sebagai murid ke siswa",
  "session_should_end": true | false
}
Set session_should_end true jika kamu merasa sudah cukup data untuk menilai seluruh sub-bagian utama materi, atau siswa sudah menjelaskan semua bagian.`,
    user: `Riwayat percakapan sesi ini:
${formatHistory(input.history)}

Pesan terbaru siswa:
${truncateText(input.message, MAX_HISTORY_CHARS)}`,
  };
}

export function buildReverseBotAnalysisPrompt(input: {
  rawMaterial: string;
  transcript: ChatMessage[];
  understandingMap: UnderstandingMapRow[];
}): LlmPrompt {
  const existing =
    input.understandingMap.length > 0
      ? `\nData understanding_map yang sudah ada untuk topik ini (pakai penamaan sub_topic yang konsisten dengan daftar ini jika relevan):\n${formatUnderstandingMap(input.understandingMap)}\n`
      : '';

  return {
    system: `Berikut adalah transkrip lengkap sesi di mana siswa menjelaskan materi kepadamu (kamu berperan sebagai murid):

${formatTranscript(input.transcript)}

Materi asli untuk referensi kebenaran:
${truncateMaterial(input.rawMaterial)}
${existing}
Analisis transkrip ini dan tentukan tingkat pemahaman siswa per sub-bagian materi. Untuk tiap sub-bagian yang dibahas dalam sesi ini, berikan skor 0-100 dan catatan singkat alasan skor tersebut (spesifik, bukan generik).

Balas HANYA dalam format JSON valid, tanpa markdown fence, tanpa teks lain:
{
  "sub_topics": [
    {
      "sub_topic": "nama sub-bagian",
      "score": 0-100,
      "note": "catatan singkat spesifik, misal 'Sering keliru arah energi pada sistem terbuka'"
    }
  ]
}`,
    user: 'Analisis sesi di atas sekarang.',
  };
}

export function buildLearningProfilePrompt(input: {
  topics: { id: string; title: string }[];
  entries: { topic_id: string; sub_topic: string; score: number; note: string | null }[];
  history: { topic_id: string; sub_topic: string; score: number; recorded_at: string }[];
}): LlmPrompt {
  const titleById = new Map(input.topics.map((topic) => [topic.id, topic.title]));

  const entries = input.entries.map((entry) => ({
    topicTitle: titleById.get(entry.topic_id) ?? 'Topik tanpa judul',
    subTopic: entry.sub_topic,
    score: entry.score,
    note: entry.note,
  }));

  const historyLines = input.history
    .map((point, index, all) => {
      const previous = all[index - 1];
      if (previous && previous.topic_id === point.topic_id && previous.sub_topic === point.sub_topic) {
        return null;
      }
      const scores = all
        .filter((item) => item.topic_id === point.topic_id && item.sub_topic === point.sub_topic)
        .map((item) => item.score);
      const title = titleById.get(point.topic_id) ?? 'Topik tanpa judul';
      return `- ${title} / ${point.sub_topic}: ${scores.join(' \u2192 ')}`;
    })
    .filter((line): line is string => line !== null);

  const historyBlock =
    historyLines.length > 0
      ? `\n\nRiwayat skor per sub-topik (urut waktu, kiri = paling lama):\n${historyLines.join('\n')}`
      : '';

  return {
    system: `Berikut adalah data pemahaman siswa dari SEMUA topik yang pernah dipelajari (hasil dari sesi-sesi "Jelaskan ke Saya" di berbagai topik berbeda):

${JSON.stringify(entries, null, 1)}${historyBlock}

Analisis data ini untuk menemukan POLA YANG BERULANG ANTAR TOPIK (bukan sekadar mengulang kelemahan spesifik satu topik). Fokus ke pola belajar umum siswa ini, contoh jenis pola yang dicari:
- Jenis kesalahan yang muncul berulang di topik berbeda-beda (misal: "sering hafal istilah tapi lemah menjelaskan hubungan sebab-akibat")
- Kekuatan konsisten yang muncul di banyak topik
- Kecenderungan tertentu (misal: selalu kuat di konsep tapi lemah di aplikasi/contoh konkret)

JANGAN sekadar merangkum ulang tiap topik satu-satu — cari BENANG MERAH antar topik. Jika data terlalu sedikit atau tidak ada pola jelas yang konsisten muncul di lebih dari satu topik, katakan itu jujur lewat insight, jangan memaksakan pola yang tidak benar-benar ada.

Buat 2-5 insight (gabungan kekuatan dan kelemahan, tidak harus seimbang jumlahnya — sesuaikan dengan apa yang benar-benar ditemukan di data).

Balas HANYA dalam format JSON valid, tanpa markdown fence, tanpa teks lain:
{
  "insights": [
    {
      "title": "judul singkat pola, maks 8 kata",
      "description": "penjelasan 1-2 kalimat, sebutkan contoh topik mana saja yang menunjukkan pola ini",
      "type": "kekuatan" | "kelemahan"
    }
  ]
}`,
    user: 'Analisis pola belajar lintas topik di atas sekarang.',
  };
}
