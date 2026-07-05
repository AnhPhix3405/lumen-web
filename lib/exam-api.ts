import { apiClient } from "./api-client";
import { getToken } from "./token-store";

// ─── Authenticated helper ─────────────────────────────────────────────────────

const authed = <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  return apiClient<T>(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });
};

const authedFormData = <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  return apiClient<T>(path, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExamType {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface ExamSummary {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  totalScore: number;
  visibility: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  examType: ExamType;
}

export interface Question {
  id: string;
  type: string;
  content: string;
  explanation?: string;
  options?: Record<string, string>;
  correctOption?: { key: string };
  score: number;
  questionOrder: number;
  questionGroupId?: string;
  partId?: string;
  audioUrl?: string | null;
  imageUrl?: string | null;
  questionTopics?: { topicId: string; topic: Topic }[];
}

export interface QuestionGroup {
  id: string;
  partId?: string;
  groupOrder: number;
  content: string;
  transcript?: string;
  type: string;
  audioUrl?: string | null;
  questions: Question[];
}

export interface Part {
  id: string;
  examId?: string;
  name: string;
  type: string;
  partOrder: number;
  instruction?: string;
  score: number;
  questionGroups: QuestionGroup[];
  questions?: Question[];
}

export interface FullExam extends ExamSummary {
  parts: Part[];
}

export interface Session {
  sessionId?: string;
  id?: string;
  userId?: string;
  status?: string;
  startedAt: string;
  timeLimitSeconds: number;
  totalScore?: number;
  totalCorrect?: number;
  totalQuestions?: number;
  correctRatio?: number;
  durationSeconds?: number;
  exam?: Pick<ExamSummary, "id" | "name"> & { examType?: ExamType };
  userAnswers?: UserAnswer[];
}

export interface UserAnswer {
  id: string;
  question: Pick<Question, "id" | "content" | "correctOption">;
  selectedOption?: { key: string };
  answerContent?: string;
  isCorrect: boolean;
  score: number;
}

export interface MySessions {
  id: string;
  status: string;
  startedAt: string;
  totalScore: number;
  totalCorrect: number;
  totalQuestions: number;
  correctRatio: number;
  exam: { id: string; name: string };
}

export interface Topic {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
}

export interface PaginatedTopics {
  data: Topic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TopicAnalysisItem {
  topicId: string | null;
  topicName: string;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
  questionIds: string[];
}

// ─── Exam Endpoints ───────────────────────────────────────────────────────────

export const listPublishedExams = () =>
  authed<{ data: ExamSummary[]; message: string; status: number }>("/exam");

export const getFullExam = (examId: string) =>
  authed<{ data: FullExam; message: string; status: number }>(`/exam/${examId}`);

export const getMyExams = () =>
  authed<{ data: ExamSummary[]; message: string; status: number }>("/exam/my");

/** Lightweight exam metadata — avoids the full exam tree endpoint. */
export const getExamSummary = async (examId: string): Promise<ExamSummary | null> => {
  try {
    const published = await listPublishedExams();
    const found = published.data.find((e) => e.id === examId);
    if (found) return found;
  } catch { /* fall through */ }
  try {
    const mine = await getMyExams();
    const found = mine.data.find((e) => e.id === examId);
    if (found) return found;
  } catch { /* fall through */ }
  return null;
};

export const createExam = (body: {
  name: string;
  description?: string;
  durationMinutes: number;
  totalScore: number;
  visibility: string;
  thumbnailUrl?: string;
  examTypeId: string;
  isPublished?: boolean;
}) =>
  authed<{ data: ExamSummary; message: string; status: number }>("/exam", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateExam = (
  examId: string,
  body: {
    name?: string;
    description?: string;
    durationMinutes?: number;
    totalScore?: number;
    visibility?: string;
    thumbnailUrl?: string;
    examTypeId?: string;
    isPublished?: boolean;
  }
) =>
  authed<{ data: ExamSummary; message: string; status: number }>(`/exam/update/${examId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });


// ─── Exam Types ───────────────────────────────────────────────────────────────

export const listExamTypes = () =>
  authed<{ data: ExamType[]; message: string; status: number }>("/exam/exam-types");

export const getExamType = (id: string) =>
  authed<{ data: ExamType; message: string; status: number }>(`/exam/exam-types/${id}`);

// ─── Parts ───────────────────────────────────────────────────────────────────

export const createPart = (
  examId: string,
  body: { name: string; type: string; partOrder: number; instruction?: string; score: number }
) =>
  authed<{ data: Part; message: string; status: number }>(`/exam/${examId}/part`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const getPartsByExam = (examId: string) =>
  authed<{ data: Part[]; message: string; status: number }>(`/exam/parts/exam/${examId}`);

export const getPartDetails = (partId: string) =>
  authed<{ data: Part; message: string; status: number }>(`/exam/part/${partId}`);

// ─── Question Groups ─────────────────────────────────────────────────────────

export const createQuestionGroup = (
  partId: string,
  body: { groupOrder: number; content: string; transcript?: string; type: string }
) =>
  authed<{ data: QuestionGroup; message: string; status: number }>(
    `/exam/part/${partId}/question-group`,
    { method: "POST", body: JSON.stringify(body) }
  );

export const getQuestionGroupsByPart = (partId: string) =>
  authed<{ data: QuestionGroup[]; message: string; status: number }>(
    `/exam/question-group/part/${partId}`
  );

export const getQuestionGroup = (id: string) =>
  authed<{ data: QuestionGroup; message: string; status: number }>(`/exam/question-group/${id}`);

export const uploadGroupAudio = (questionGroupId: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return authedFormData<{ data: { id: string; audioUrl: string }; message: string; status: number }>(
    `/exam/question-group/${questionGroupId}/upload-audio`,
    {
      method: "PATCH",
      body: form,
    }
  );
};

// ─── Questions ────────────────────────────────────────────────────────────────

export const createQuestionInGroup = (
  questionGroupId: string,
  body: {
    content: string;
    explanation?: string;
    options: Record<string, string>;
    correctOption: { key: string };
    score: number;
    questionOrder: number;
    topicIds?: string[];
  }
) =>
  authed<{ data: Question; message: string; status: number }>(
    `/exam/question-group/${questionGroupId}/question`,
    { method: "POST", body: JSON.stringify(body) }
  );

export const createStandaloneQuestion = (
  partId: string,
  body: {
    content: string;
    explanation?: string;
    options: Record<string, string>;
    correctOption: { key: string };
    score: number;
    questionOrder: number;
    topicIds?: string[];
  }
) =>
  authed<{ data: Question; message: string; status: number }>(
    `/exam/part/${partId}/question`,
    { method: "POST", body: JSON.stringify(body) }
  );

export const getQuestionsByGroup = (questionGroupId: string) =>
  authed<{ data: Question[]; message: string; status: number }>(
    `/exam/question/by-group/${questionGroupId}`
  );

export const getQuestionsByPart = (partId: string) =>
  authed<{ data: Question[]; message: string; status: number }>(
    `/exam/question/by-part/${partId}`
  );

export const getQuestionById = (id: string) =>
  authed<{ data: Question; message: string; status: number }>(`/exam/question/${id}`);

export const updateQuestion = (
  id: string,
  body: {
    content?: string;
    explanation?: string;
    options?: Record<string, string>;
    correctOption?: { key: string };
    score?: number;
    questionOrder?: number;
  }
) =>
  authed<{ data: Question; message: string; status: number }>(
    `/exam/question/${id}`,
    { method: "PATCH", body: JSON.stringify(body) }
  );

export const uploadQuestionAudio = (questionId: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return authedFormData<{ data: string; message: string; status: number }>(
    `/exam/question/${questionId}/upload-audio`,
    {
      method: "PATCH",
      body: form,
    }
  );
};

export const uploadQuestionImage = (questionId: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return authedFormData<{ data: string; message: string; status: number }>(
    `/exam/question/${questionId}/upload-image`,
    {
      method: "PATCH",
      body: form,
    }
  );
};

// ─── Sessions ────────────────────────────────────────────────────────────────

export const createSession = (examId: string, timeLimit?: number) =>
  authed<{ data: Session; message: string; status: number }>(
    `/exam/create-session/${examId}`,
    { method: "POST", body: JSON.stringify(timeLimit ? { timeLimit } : {}) }
  );

export const getSession = (sessionId: string) =>
  authed<{ data: Session; message: string; status: number }>(`/exam/session/${sessionId}`);

export const getMySessions = () =>
  authed<{ data: MySessions[]; message: string; status: number }>("/exam/sessions/my");

export const submitAnswers = (
  sessionId: string,
  answers: Array<{
    questionId: string;
    selectedOption?: { key: string };
    answerContent?: string;
    audioUrl?: string;
  }>
) =>
  authed<{ data: { sessionId: string; answered: number }; message: string; status: number }>(
    `/exam/submit-answers/${sessionId}`,
    { method: "POST", body: JSON.stringify({ answers }) }
  );

export const finishSession = (sessionId: string) =>
  authed<{
    data: {
      sessionId: string;
      status: string;
      totalScore: number;
      totalCorrect: number;
      totalQuestions: number;
      correctRatio: number;
      durationSeconds: number;
    };
    message: string;
    status: number;
  }>(`/exam/finish-session/${sessionId}`, {
    method: "POST",
    body: JSON.stringify({}),
  });

export const getTopicAnalysis = (sessionId: string, partId?: string) =>
  authed<{ data: TopicAnalysisItem[]; message: string; status: number }>(
    `/exam/session/${sessionId}/topic-analysis${partId ? `?partId=${partId}` : ""}`
  );

// ─── Topics ──────────────────────────────────────────────────────────────────

export const getAllTopics = (page = 1, limit = 100) =>
  authed<{ data: PaginatedTopics; message: string; status: number }>(`/exam/topics?page=${page}&limit=${limit}`);

export const getQuestionTopics = (questionId: string) =>
  authed<{ data: { topicId: string; topic: Topic }[]; message: string; status: number }>(`/exam/topics/question/${questionId}`);

export const replaceQuestionTopics = (questionId: string, topicIds: string[]) =>
  authed<{ data: Question; message: string; status: number }>(`/exam/question/${questionId}/topics`, {
    method: "PATCH",
    body: JSON.stringify({ topicIds }),
  });
