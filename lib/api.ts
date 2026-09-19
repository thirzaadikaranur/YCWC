import { createClient } from "@/lib/supabase/client";
import type {
  ChatRequest,
  ChatResponse,
  CreateTopicRequest,
  CreateTopicResponse,
  GetLearningProfileResponse,
  GetScoreHistoryResponse,
  GetTopicsResponse,
  GetUnderstandingMapResponse,
  RefreshLearningProfileResponse,
  SaveSessionRequest,
  SaveSessionResponse,
  UserAccount,
  UserPreferences,
} from "@/types";

export const TOPICS_CHANGED_EVENT = "reversetutor:topics-changed";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new ApiError(
      "Sesi login tidak valid atau kedaluwarsa. Silakan login ulang.",
      401,
    );
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, { ...init, headers: await authHeaders() });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Tidak bisa menghubungi server. Periksa koneksimu dan coba lagi.", 0);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      isRecord(payload) && typeof payload.error === "string"
        ? payload.error
        : "Terjadi kesalahan di server. Coba lagi sebentar lagi.";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

function notifyTopicsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TOPICS_CHANGED_EVENT));
  }
}

export function createTopic(request: CreateTopicRequest): Promise<CreateTopicResponse> {
  return requestJson<CreateTopicResponse>("/api/topics", {
    method: "POST",
    body: JSON.stringify(request),
  }).then((response) => {
    notifyTopicsChanged();
    return response;
  });
}

export function getTopics(): Promise<GetTopicsResponse> {
  return requestJson<GetTopicsResponse>("/api/topics");
}

export function chat(request: ChatRequest): Promise<ChatResponse> {
  return requestJson<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function saveSession(request: SaveSessionRequest): Promise<SaveSessionResponse> {
  return requestJson<SaveSessionResponse>("/api/sessions", {
    method: "POST",
    body: JSON.stringify(request),
  }).then((response) => {
    notifyTopicsChanged();
    return response;
  });
}

export function getUnderstandingMap(topicId: string): Promise<GetUnderstandingMapResponse> {
  return requestJson<GetUnderstandingMapResponse>(
    `/api/topics/${encodeURIComponent(topicId)}/understanding-map`,
  );
}

export function getScoreHistory(topicId: string): Promise<GetScoreHistoryResponse> {
  return requestJson<GetScoreHistoryResponse>(
    `/api/topics/${encodeURIComponent(topicId)}/score-history`,
  );
}

export function getLearningProfile(): Promise<GetLearningProfileResponse> {
  return requestJson<GetLearningProfileResponse>("/api/learning-profile");
}

export function refreshLearningProfile(): Promise<RefreshLearningProfileResponse> {
  return requestJson<RefreshLearningProfileResponse>("/api/learning-profile/refresh", {
    method: "POST",
  });
}

export function getPreferences(): Promise<UserPreferences> {
  return requestJson<UserPreferences>("/api/user/preferences");
}

export function updatePreferences(
  patch: Partial<UserPreferences>,
): Promise<UserPreferences> {
  return requestJson<UserPreferences>("/api/user/preferences", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function deleteAccount(): Promise<{ success: boolean }> {
  return requestJson<{ success: boolean }>("/api/user/delete-account", {
    method: "POST",
  });
}

function formatJoinedAt(isoDate: string | undefined): string {
  if (!isoDate) return "—";

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function getCurrentUser(): Promise<UserAccount> {
  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  let user = sessionData.session?.user ?? null;

  if (!user) {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      throw new ApiError(
        "Sesi login tidak valid atau kedaluwarsa. Silakan login ulang.",
        401,
      );
    }

    user = data.user;
  }

  const metadataName =
    typeof user.user_metadata?.displayName === "string"
      ? user.user_metadata.displayName
      : typeof user.user_metadata?.display_name === "string"
        ? user.user_metadata.display_name
        : null;

  let displayName = metadataName ?? user.email?.split("@")[0] ?? "Pelajar";

  try {
    const preferences = await getPreferences();
    displayName = preferences.displayName;
  } catch {
    // Preferensi gagal dimuat: tetap tampilkan nama dari metadata/email.
  }

  return {
    displayName,
    email: user.email ?? "",
    joinedAt: formatJoinedAt(user.created_at),
  };
}
