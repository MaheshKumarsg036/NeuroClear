export interface TransformResult {
  rewrite: string;
  highlights: string[];
  reading_time_minutes: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option_index?: number;
  explanation?: string;
}

export interface QuizEvaluationBreakdown {
  question_id: string;
  question: string;
  user_option_index: number | null | undefined;
  correct_option_index: number;
  is_correct: boolean;
}

export interface QuizEvaluation {
  answered_questions: number;
  correct_answers: number;
  total_questions: number;
  breakdown: QuizEvaluationBreakdown[];
  celebration: boolean;
}

export interface TransformResponse {
  status: string;
  mode: string;
  agent?: string;
  pages: number;
  characters: number;
  prompt_tokens?: number;
  result: TransformResult;
  quiz_session_id?: string;
  quiz?: {
    questions: QuizQuestion[];
  };
  quiz_evaluation?: QuizEvaluation;
  celebration_effect?: string;
}

export interface TransformPdfOptions {
  mode: string;
  file?: File | null;
  quizSessionId?: string | null;
  answers?: Record<string, number | null | undefined>;
}

const defaultBaseUrl = "http://127.0.0.1:8000";
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? defaultBaseUrl;

export async function transformPdf(options: TransformPdfOptions): Promise<TransformResponse> {
  const { mode, file, quizSessionId, answers } = options;
  const formData = new FormData();
  formData.append("mode", mode);

  if (file) {
    formData.append("pdf", file, file.name || "document.pdf");
  }

  if (quizSessionId) {
    formData.append("quiz_session_id", quizSessionId);
  }

  if (answers && Object.keys(answers).length > 0) {
    formData.append("quiz_answers", JSON.stringify(answers));
  }

  const response = await fetch(`${apiBaseUrl}/api/v1/pdf-transform`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = "Unable to transform document.";
    try {
      const payload = await response.json();
      detail = payload.detail ?? JSON.stringify(payload);
    } catch {
      detail = await response.text();
    }
    throw new Error(detail || "Backend returned an error.");
  }

  return response.json();
}
