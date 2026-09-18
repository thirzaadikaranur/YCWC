import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DEMO_PASSWORD, DEMO_USERS } from "./demo-data.mjs";

const APP_BASE = process.env.DEMO_APP_BASE ?? "http://localhost:3000";
const ENV_PATH = fileURLToPath(new URL("../.env.local", import.meta.url));

function readEnv() {
  const env = {};
  for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    if (!/^[A-Z_][A-Z0-9_]*=/.test(line)) continue;
    const index = line.indexOf("=");
    env[line.slice(0, index)] = line.slice(index + 1).trim();
  }
  return env;
}

const env = readEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error("Env Supabase tidak lengkap di .env.local");
  process.exit(1);
}

const serviceHeaders = {
  "Content-Type": "application/json",
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
};

function isoAgo({ days = 0, hours = 0 }) {
  return new Date(Date.now() - (days * 24 + hours) * 3_600_000).toISOString();
}

function deriveLabel(score) {
  if (score >= 70) return "hijau";
  if (score >= 50) return "kuning";
  return "merah";
}

function buildTranscript(topicTitle, mode, baseIso) {
  const at = (minutes) =>
    new Date(Date.parse(baseIso) + minutes * 60_000).toISOString();

  if (mode === "reverse_bot") {
    return [
      { role: "user", content: `Aku mau coba menjelaskan ${topicTitle} dengan kata-kataku sendiri.`, timestamp: at(0) },
      { role: "assistant", content: "Baik, aku jadi muridmu. Mulai dari bagian yang paling kamu kuasai, ya.", timestamp: at(1) },
      { role: "user", content: "Intinya ada beberapa konsep utama yang saling berhubungan dan bisa diterapkan di contoh sehari-hari.", timestamp: at(2) },
      { role: "assistant", content: "Menarik. Bisa kamu jelaskan satu bagian yang menurutmu paling sulit dengan contoh konkret?", timestamp: at(3) },
    ];
  }

  if (mode === "kuis") {
    return [
      { role: "user", content: `Buat kuis dari materi ${topicTitle}.`, timestamp: at(0) },
      { role: "assistant", content: "Aku siapkan beberapa soal pilihan ganda beserta pembahasannya.", timestamp: at(1) },
    ];
  }

  if (mode === "ringkasan") {
    return [
      { role: "user", content: `Ringkas materi ${topicTitle}.`, timestamp: at(0) },
      { role: "assistant", content: `Ini rangkuman ${topicTitle} per bagian penting.`, timestamp: at(1) },
    ];
  }

  return [
    { role: "user", content: `Apa poin terpenting dari ${topicTitle}?`, timestamp: at(0) },
    { role: "assistant", content: "Poin terpentingnya adalah konsep inti yang saling berhubungan. Coba hubungkan dengan contoh yang ada di materi.", timestamp: at(1) },
  ];
}

async function adminFetch(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin${path}`, {
    ...options,
    headers: { ...serviceHeaders, ...(options.headers ?? {}) },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Admin API ${path} gagal: ${response.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function findUserByEmail(email) {
  const body = await adminFetch(`/users?page=1&per_page=200`);
  return (body.users ?? []).find((user) => user.email === email) ?? null;
}

async function deleteUser(userId) {
  await adminFetch(`/users/${userId}`, { method: "DELETE" });
}

async function createUser({ email, displayName }) {
  const body = await adminFetch("/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { displayName },
    }),
  });
  return body.id;
}

async function insertRows(table, rows) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...serviceHeaders, Prefer: "return=representation" },
    body: JSON.stringify(rows),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Insert ${table} gagal: ${response.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function seedTopic(userId, topic) {
  const [topicRow] = await insertRows("topics", [
    {
      user_id: userId,
      title: topic.title,
      raw_material: topic.material,
      created_at: isoAgo({ days: topic.createdDaysAgo, hours: 6 }),
      last_accessed_at: isoAgo({
        hours: topic.lastAccessedDaysAgo === 0 ? 2 : topic.lastAccessedDaysAgo * 24,
      }),
    },
  ]);

  const sessionRows = topic.sessions.map((session, index) => {
    const createdAt = isoAgo({ days: session.daysAgo, hours: 6 + index });
    return {
      topic_id: topicRow.id,
      user_id: userId,
      mode: session.mode,
      transcript: buildTranscript(topic.title, session.mode, createdAt),
      result_summary: session.resultSummary ?? null,
      created_at: createdAt,
    };
  });

  const insertedSessions = await insertRows("sessions", sessionRows);
  const reverseBotSessionIds = insertedSessions
    .filter((session) => session.mode === "reverse_bot")
    .sort((left, right) => left.created_at.localeCompare(right.created_at))
    .map((session) => session.id);

  if (topic.map.length > 0) {
    await insertRows(
      "understanding_map",
      topic.map.map((entry) => ({
        topic_id: topicRow.id,
        user_id: userId,
        sub_topic: entry.subTopic,
        score: entry.score,
        label: deriveLabel(entry.score),
        note: entry.note,
        updated_at: isoAgo({ days: entry.updatedDaysAgo, hours: 2 }),
      })),
    );
  }

  const historyRows = Object.entries(topic.history).flatMap(([subTopic, points]) =>
    points.map((point, index) => ({
      topic_id: topicRow.id,
      user_id: userId,
      sub_topic: subTopic,
      score: point.score,
      session_id:
        reverseBotSessionIds.length > 0
          ? reverseBotSessionIds[Math.min(index, reverseBotSessionIds.length - 1)]
          : null,
      recorded_at: isoAgo({ days: point.daysAgo, hours: 4 + index }),
    })),
  );

  if (historyRows.length > 0) {
    await insertRows("score_history", historyRows);
  }

  return {
    title: topic.title,
    sessions: sessionRows.length,
    mapEntries: topic.map.length,
    historyPoints: historyRows.length,
  };
}

async function seedUser(demoUser) {
  const existing = await findUserByEmail(demoUser.email);
  if (existing) {
    await deleteUser(existing.id);
    console.log(`  (akun lama ${demoUser.email} dihapus, lalu dibuat ulang)`);
  }

  const userId = await createUser(demoUser);
  const topics = [];

  for (const topic of demoUser.topics) {
    topics.push(await seedTopic(userId, topic));
  }

  if (demoUser.profileInsights) {
    await insertRows("learning_profile", [
      {
        user_id: userId,
        insights: demoUser.profileInsights,
        generated_at: isoAgo({ hours: 1 }),
      },
    ]);
  }

  return { userId, topics };
}

async function appToken(email) {
  const link = await adminFetch("/generate_link", {
    method: "POST",
    body: JSON.stringify({ type: "magiclink", email }),
  });

  const response = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ type: "magiclink", token_hash: link.hashed_token }),
  });

  const session = await response.json();
  if (!response.ok || !session.access_token) {
    throw new Error(`verify gagal: ${response.status} ${JSON.stringify(session)}`);
  }
  return session.access_token;
}

async function verifyInApp(email) {
  const token = await appToken(email);
  const headers = { Authorization: `Bearer ${token}` };

  const topicsResponse = await fetch(`${APP_BASE}/api/topics`, { headers });
  if (!topicsResponse.ok) {
    return `app tidak bisa diverifikasi (status ${topicsResponse.status})`;
  }

  const { topics } = await topicsResponse.json();
  const firstWithMap = topics.find((topic) => topic.overallScore !== null);
  let mapCount = 0;

  if (firstWithMap) {
    const mapResponse = await fetch(
      `${APP_BASE}/api/topics/${firstWithMap.id}/understanding-map`,
      { headers },
    );
    const map = await mapResponse.json();
    mapCount = map.entries?.length ?? 0;
  }

  const profileResponse = await fetch(`${APP_BASE}/api/learning-profile`, { headers });
  const profile = await profileResponse.json();

  return `${topics.length} topik terlihat, ${mapCount} entry peta di topik pertama, enoughData=${profile.enoughData}, profile=${profile.profile ? "terisi" : "kosong"}`;
}

async function checkPasswordLogin() {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ email: DEMO_USERS[0].email, password: DEMO_PASSWORD }),
  });

  const body = await response.json().catch(() => null);
  if (response.ok) return { ok: true };
  return { ok: false, code: body?.error_code ?? String(response.status) };
}

async function main() {
  console.log(`Seed akun demo ke ${SUPABASE_URL}\n`);

  const seeded = [];
  for (const demoUser of DEMO_USERS) {
    console.log(`- ${demoUser.email} (${demoUser.displayName})`);
    seeded.push({ demoUser, ...(await seedUser(demoUser)) });
  }

  console.log("\nVerifikasi lewat API aplikasi:");
  for (const item of seeded) {
    try {
      const result = await verifyInApp(item.demoUser.email);
      console.log(`  ${item.demoUser.email}: ${result}`);
    } catch (error) {
      console.log(`  ${item.demoUser.email}: gagal verifikasi (${error.message})`);
    }
  }

  const login = await checkPasswordLogin();

  console.log("\n=== Akun demo siap dipakai juri ===");
  for (const item of seeded) {
    const summary = item.topics
      .map((topic) => `${topic.title} (${topic.sessions} sesi, ${topic.mapEntries} sub-topik)`)
      .join("; ");
    console.log(`- ${item.demoUser.email} / ${DEMO_PASSWORD} — ${item.demoUser.displayName}`);
    console.log(`  ${summary}`);
  }

  if (!login.ok) {
    console.log(
      `\nPERINGATAN: login password masih ditolak Supabase (${login.code}). ` +
        "Aktifkan Authentication > Sign In / Providers > Email di dashboard Supabase agar juri bisa masuk.",
    );
  } else {
    console.log("\nLogin password sudah aktif — juri bisa langsung masuk.");
  }
}

main().catch((error) => {
  console.error("\nSeed gagal:", error);
  process.exitCode = 1;
});
