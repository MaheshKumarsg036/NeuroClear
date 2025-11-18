import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";
import {
  transformPdf,
  type QuizEvaluation,
  type QuizQuestion,
  type TransformResponse,
} from "./api";

const accessibilityModes = [
  { value: "adhd", label: "Focus Support (ADHD)" },
  { value: "autism", label: "Clarity First (Autism)" },
  { value: "dyslexia", label: "Reading Ease (Dyslexia)" },
  { value: "anxiety", label: "Calm Flow (Anxiety)" },
  { value: "elderly", label: "Gentle Guidance (Elderly)" }
];

function App() {
  const [selectedMode, setSelectedMode] = useState(accessibilityModes[0].value);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [previewText, setPreviewText] = useState("Upload a PDF to preview the accessibility rewrite.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [resultPayload, setResultPayload] = useState<TransformResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number | null>>({});
  const [quizEvaluation, setQuizEvaluation] = useState<QuizEvaluation | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const modeLabel = useMemo(
    () => accessibilityModes.find((mode) => mode.value === selectedMode)?.label ?? "",
    [selectedMode]
  );

  useEffect(() => {
    if (!celebrate) {
      return;
    }
    const timer = window.setTimeout(() => setCelebrate(false), 4500);
    return () => window.clearTimeout(timer);
  }, [celebrate]);

  const resetQuizState = () => {
    setQuizSessionId(null);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizEvaluation(null);
    setCelebrate(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file && file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please upload a PDF document (.pdf).");
      setDocumentFile(null);
      setUploadedFileName(null);
      event.target.value = "";
      return;
    }

    setErrorMessage(null);
    setDocumentFile(file);
    setUploadedFileName(file ? file.name : null);
    setResultPayload(null);
    setPreviewText("Upload a PDF to preview the accessibility rewrite.");
    resetQuizState();
  };

  const handleGeneratePreview = async () => {
    if (!documentFile) {
      setErrorMessage("Please select a PDF document first.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    resetQuizState();

    try {
      const response = await transformPdf({ mode: selectedMode, file: documentFile });
      setResultPayload(response);
      setPreviewText(response.result?.rewrite ?? "");
      setQuizSessionId(response.quiz_session_id ?? null);
      const questions = response.quiz?.questions ?? [];
      setQuizQuestions(questions);
      const initialAnswers = questions.reduce<Record<string, number | null>>((acc, question) => {
        acc[question.id] = null;
        return acc;
      }, {});
      setQuizAnswers(initialAnswers);
      setQuizEvaluation(response.quiz_evaluation ?? null);
      setCelebrate(response.celebration_effect === "party_popper_and_balloons");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error. Please try again.";
      setErrorMessage(message);
      setResultPayload(null);
      resetQuizState();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizSessionId) {
      setErrorMessage("Quiz session not found. Regenerate the rewrite to try again.");
      return;
    }

    const answered = Object.entries(quizAnswers).reduce<Record<string, number>>((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (Object.keys(answered).length === 0) {
      setErrorMessage("Please answer at least one question before submitting.");
      return;
    }

    setErrorMessage(null);
    setIsSubmittingQuiz(true);

    try {
      const response = await transformPdf({
        mode: selectedMode,
        quizSessionId,
        answers: answered,
      });

      setResultPayload(response);
      setQuizEvaluation(response.quiz_evaluation ?? null);
      setCelebrate(response.celebration_effect === "party_popper_and_balloons");

      const questions = response.quiz?.questions ?? quizQuestions;
      setQuizQuestions(questions);
      setQuizSessionId(response.quiz_session_id ?? quizSessionId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit quiz answers.";
      setErrorMessage(message);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const rewritePreview = resultPayload?.result?.rewrite?.trim().length
    ? resultPayload.result.rewrite
    : previewText;

  return (
    <div className="page">
      <header className="top-bar">
        <div className="brand-mark" aria-hidden>
          <span className="dot dot-blue" />
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <div>
          <p className="top-label">NeuroClear</p>
          <h1>Accessibility Studio</h1>
        </div>
      </header>

      <main className="workspace">
        <section className="panel">
          <header>
            <h2>Content Intake</h2>
            <p className="lead">
              Upload content, choose a support mode, and preview how the assistant will reshape it.
            </p>
          </header>

          <div className="form-group">
            <label htmlFor="file-upload" className="field-label">
              PDF Upload
            </label>
            <input id="file-upload" type="file" accept="application/pdf" onChange={handleFileChange} />
            {uploadedFileName && <p className="helper-text">Selected file: {uploadedFileName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="mode-select" className="field-label">
              Support Mode
            </label>
            <select id="mode-select" value={selectedMode} onChange={(event) => setSelectedMode(event.target.value)}>
              {accessibilityModes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          <button className="primary" onClick={handleGeneratePreview} disabled={isGenerating}>
            {isGenerating ? "Preparing Preview…" : "Preview Accessibility Rewrite"}
          </button>
          {errorMessage && <p className="error-text" role="alert">{errorMessage}</p>}
        </section>

        <section className="panel preview">
          <div className="preview-heading">
            <h2>Preview</h2>
            <span className="chip">{modeLabel}</span>
          </div>
          <div className="preview-content" aria-live="polite">
            <ReactMarkdown>{rewritePreview}</ReactMarkdown>
          </div>
          {resultPayload ? (
            <>
              <div className="result-meta">
                <span>{resultPayload.pages} page{resultPayload.pages === 1 ? "" : "s"}</span>
                <span>{resultPayload.characters.toLocaleString()} characters</span>
                <span>
                  {resultPayload.result.reading_time_minutes} min read
                </span>
              </div>
              {resultPayload.result.highlights.length > 0 && (
                <div className="highlights">
                  <h3>Highlights</h3>
                  <ul>
                    {resultPayload.result.highlights.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="helper-text">Select a PDF and mode, then run the preview to see the Gemini rewrite.</p>
          )}
        </section>

        {quizQuestions.length > 0 && (
          <section className="panel quiz-panel">
            <header>
              <h2>Knowledge Check</h2>
              <p className="lead">Answer a few quick questions to reinforce the rewritten content.</p>
            </header>

            <div className="quiz-list">
              {quizQuestions.map((question, index) => {
                const selected = quizAnswers[question.id];
                const breakdown = quizEvaluation?.breakdown.find((item) => item.question_id === question.id);
                const isCorrect = breakdown?.is_correct;
                const statusClass = breakdown ? (isCorrect ? "correct" : "incorrect") : "";

                return (
                  <article key={question.id} className={`quiz-card ${statusClass}`}>
                    <div className="quiz-card-header">
                      <span className="quiz-step">Q{index + 1}</span>
                      {breakdown && (
                        <span className={`quiz-status ${statusClass}`}>
                          {isCorrect ? "Correct" : "Try Again"}
                        </span>
                      )}
                    </div>
                    <p className="quiz-question">{question.question}</p>
                    <div className="quiz-options">
                      {question.options.map((option, optionIndex) => {
                        const inputId = `${question.id}-${optionIndex}`;
                        return (
                          <label key={inputId} htmlFor={inputId} className="quiz-option">
                            <input
                              id={inputId}
                              type="radio"
                              name={question.id}
                              value={optionIndex}
                              checked={selected === optionIndex}
                              onChange={() => handleAnswerChange(question.id, optionIndex)}
                              disabled={isSubmittingQuiz}
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                    {breakdown && !isCorrect && (
                      <p className="quiz-feedback">{question.explanation || "Review the rewrite above and try again."}</p>
                    )}
                  </article>
                );
              })}
            </div>

            <div className="quiz-actions">
              <button
                className="primary secondary"
                type="button"
                onClick={handleSubmitQuiz}
                disabled={isSubmittingQuiz}
              >
                {isSubmittingQuiz ? "Checking Answers…" : "Submit Quiz Answers"}
              </button>
              {quizEvaluation && (
                <div className="quiz-summary">
                  <p>
                    You answered {quizEvaluation.correct_answers} of {quizEvaluation.total_questions} correctly.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {celebrate && (
        <div className="celebration-overlay" aria-live="polite">
          <div className="confetti">🎉</div>
          <div className="balloons">
            <span className="balloon" />
            <span className="balloon" />
            <span className="balloon" />
          </div>
          <p>Perfect score! Great job!</p>
        </div>
      )}
    </div>
  );
}

export default App;
