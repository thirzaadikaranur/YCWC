import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  LearningProfile,
  LearningProfileInsight,
  ScoreHistoryPoint,
  Topic,
  UnderstandingLabel,
  UnderstandingMapEntryDetail,
} from '@/types';

export interface TopicRow {
  id: string;
  user_id: string;
  title: string;
  raw_material: string;
  created_at: string;
  last_accessed_at: string;
}

export interface TopicSummaryRow {
  id: string;
  title: string;
  last_accessed_at: string;
}

export interface SessionCreatedRow {
  id: string;
  created_at: string;
}

export interface UnderstandingMapRow {
  topic_id: string;
  sub_topic: string;
  score: number;
  label: string | null;
  note: string | null;
  updated_at: string;
}

export interface ScoreHistoryRow {
  topic_id: string;
  sub_topic: string;
  score: number;
  recorded_at: string;
}

export interface LearningProfileRow {
  insights: unknown;
  generated_at: string;
}

export function deriveLabel(score: number): UnderstandingLabel {
  if (score >= 70) {
    return 'hijau';
  }
  if (score >= 50) {
    return 'kuning';
  }
  return 'merah';
}

export function toUnderstandingLabel(value: unknown, score: number): UnderstandingLabel {
  if (value === 'merah' || value === 'kuning' || value === 'hijau') {
    return value;
  }
  return deriveLabel(score);
}

export function averageScore(scores: number[]): number | null {
  if (scores.length === 0) {
    return null;
  }
  const total = scores.reduce((sum, score) => sum + score, 0);
  return Math.round(total / scores.length);
}

export function toTopic(row: TopicRow): Topic {
  return {
    id: row.id,
    title: row.title,
    rawMaterial: row.raw_material,
    createdAt: row.created_at,
    lastAccessedAt: row.last_accessed_at,
  };
}

export function toUnderstandingMapEntry(row: UnderstandingMapRow): UnderstandingMapEntryDetail {
  return {
    subTopic: row.sub_topic,
    score: row.score,
    label: toUnderstandingLabel(row.label, row.score),
    note: row.note,
    updatedAt: row.updated_at,
  };
}

export function toScoreHistoryPoint(row: ScoreHistoryRow): ScoreHistoryPoint {
  return { score: row.score, recordedAt: row.recorded_at };
}

export function toLearningProfile(row: LearningProfileRow): LearningProfile {
  return {
    insights: Array.isArray(row.insights)
      ? (row.insights as LearningProfileInsight[])
      : [],
    generatedAt: row.generated_at,
  };
}

export async function fetchTopic(
  supabase: SupabaseClient,
  topicId: string,
): Promise<TopicRow | null> {
  const { data, error } = await supabase
    .from('topics')
    .select('id,user_id,title,raw_material,created_at,last_accessed_at')
    .eq('id', topicId)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal mengambil topik: ${error.message}`);
  }

  return (data as TopicRow | null) ?? null;
}

export async function fetchUnderstandingMap(
  supabase: SupabaseClient,
  topicId: string,
): Promise<UnderstandingMapRow[]> {
  const { data, error } = await supabase
    .from('understanding_map')
    .select('topic_id,sub_topic,score,label,note,updated_at')
    .eq('topic_id', topicId)
    .order('updated_at', { ascending: true });

  if (error) {
    throw new Error(`Gagal mengambil understanding map: ${error.message}`);
  }

  return (data ?? []) as UnderstandingMapRow[];
}

export async function touchTopic(
  supabase: SupabaseClient,
  topicId: string,
): Promise<void> {
  const { error } = await supabase
    .from('topics')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('id', topicId);

  if (error) {
    console.error('[api] gagal update last_accessed_at:', error.message);
  }
}

export async function hasEnoughProfileData(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase
    .from('understanding_map')
    .select('topic_id');

  if (error) {
    throw new Error(`Gagal menghitung data profil belajar: ${error.message}`);
  }

  const topicIds = new Set(
    ((data ?? []) as { topic_id: string }[]).map((row) => row.topic_id),
  );

  return topicIds.size >= 2;
}
