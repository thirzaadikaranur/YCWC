export type ChatMode = 'ringkasan' | 'kuis' | 'reverse_bot' | 'qa';

export type UnderstandingLabel = 'merah' | 'kuning' | 'hijau';

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface TranscriptMessage extends ChatMessage {
  timestamp: string;
}

export interface Topic {
  id: string;
  title: string;
  rawMaterial: string;
  createdAt: string;
  lastAccessedAt: string;
}

export interface Session {
  id: string;
  topicId: string;
  userId: string;
  mode: ChatMode;
  transcript: TranscriptMessage[];
  resultSummary: Record<string, unknown> | null;
  createdAt: string;
}

export interface UnderstandingMapEntry {
  subTopic: string;
  score: number;
  label: UnderstandingLabel;
  note: string | null;
}

export interface UnderstandingMapEntryDetail extends UnderstandingMapEntry {
  updatedAt: string;
}

export interface ScoreHistoryPoint {
  score: number;
  recordedAt: string;
}

export interface LearningProfileInsight {
  title: string;
  description: string;
  type: 'kekuatan' | 'kelemahan';
}

export interface LearningProfile {
  insights: LearningProfileInsight[];
  generatedAt: string;
}

export interface UserPreferences {
  displayName: string;
  showDiagnosticPrompt: boolean;
  defaultQuizQuestionCount: number;
}

export interface TopicListItem {
  id: string;
  title: string;
  lastAccessedAt: string;
  sessionCount: number;
  overallScore: number | null;
  overallLabel: UnderstandingLabel | null;
}

export interface SummarySection {
  heading: string;
  points: string[];
}

export interface SummaryData {
  sections: SummarySection[];
}

export type QuizAnswer = 'A' | 'B' | 'C' | 'D';

export interface QuizQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: QuizAnswer;
  explanation: string;
  relatedSubTopic: string;
}

export interface QuizData {
  questions: QuizQuestion[];
}

export interface ReverseBotDiagnosis {
  subTopic: string;
  score: number;
  note: string;
}

export interface ReverseBotData {
  sessionShouldEnd: boolean;
  diagnosis: ReverseBotDiagnosis[] | null;
}

export type ChatData = SummaryData | QuizData | ReverseBotData | null;

export interface CreateTopicRequest {
  rawMaterial: string;
}

export interface CreateTopicResponse {
  topic: Topic;
}

export interface GetTopicsResponse {
  topics: TopicListItem[];
}

export interface ChatRequest {
  topicId: string;
  message: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  intent: ChatMode;
  response: string;
  shouldSuggestDiagnostic: boolean;
  data?: ChatData;
}

export interface SaveSessionRequest {
  topicId: string;
  mode: ChatMode;
  transcript: TranscriptMessage[];
  resultSummary?: Record<string, unknown> | null;
}

export interface SaveSessionResponse {
  session: {
    id: string;
    createdAt: string;
  };
}

export interface GetUnderstandingMapResponse {
  topicTitle: string;
  overallScore: number | null;
  entries: UnderstandingMapEntryDetail[];
}

export interface GetScoreHistoryResponse {
  history: Record<string, ScoreHistoryPoint[]>;
}

export interface GetLearningProfileResponse {
  profile: LearningProfile | null;
  enoughData: boolean;
}

export interface RefreshLearningProfileResponse {
  profile: LearningProfile;
}

export interface ApiErrorResponse {
  error: string;
}
