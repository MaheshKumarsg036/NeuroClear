import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";
import { transformPdf, } from "./api";
const accessibilityModes = [
    { value: "adhd", label: "Focus Support (ADHD)" },
    { value: "autism", label: "Clarity First (Autism)" },
    { value: "dyslexia", label: "Reading Ease (Dyslexia)" },
    { value: "anxiety", label: "Calm Flow (Anxiety)" },
    { value: "elderly", label: "Gentle Guidance (Elderly)" }
];
function App() {
    const [selectedMode, setSelectedMode] = useState(accessibilityModes[0].value);
    const [uploadedFileName, setUploadedFileName] = useState(null);
    const [documentFile, setDocumentFile] = useState(null);
    const [previewText, setPreviewText] = useState("Upload a PDF to preview the accessibility rewrite.");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
    const [resultPayload, setResultPayload] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [quizSessionId, setQuizSessionId] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizEvaluation, setQuizEvaluation] = useState(null);
    const [celebrate, setCelebrate] = useState(false);
    const modeLabel = useMemo(() => accessibilityModes.find((mode) => mode.value === selectedMode)?.label ?? "", [selectedMode]);
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
    const handleFileChange = (event) => {
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
            const initialAnswers = questions.reduce((acc, question) => {
                acc[question.id] = null;
                return acc;
            }, {});
            setQuizAnswers(initialAnswers);
            setQuizEvaluation(response.quiz_evaluation ?? null);
            setCelebrate(response.celebration_effect === "party_popper_and_balloons");
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unexpected error. Please try again.";
            setErrorMessage(message);
            setResultPayload(null);
            resetQuizState();
        }
        finally {
            setIsGenerating(false);
        }
    };
    const handleAnswerChange = (questionId, optionIndex) => {
        setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    };
    const handleSubmitQuiz = async () => {
        if (!quizSessionId) {
            setErrorMessage("Quiz session not found. Regenerate the rewrite to try again.");
            return;
        }
        const answered = Object.entries(quizAnswers).reduce((acc, [key, value]) => {
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unable to submit quiz answers.";
            setErrorMessage(message);
        }
        finally {
            setIsSubmittingQuiz(false);
        }
    };
    const rewritePreview = resultPayload?.result?.rewrite?.trim().length
        ? resultPayload.result.rewrite
        : previewText;
    return (_jsxs("div", { className: "page", children: [_jsxs("header", { className: "top-bar", children: [_jsxs("div", { className: "brand-mark", "aria-hidden": true, children: [_jsx("span", { className: "dot dot-blue" }), _jsx("span", { className: "dot dot-red" }), _jsx("span", { className: "dot dot-yellow" }), _jsx("span", { className: "dot dot-green" })] }), _jsxs("div", { children: [_jsx("p", { className: "top-label", children: "NeuroClear" }), _jsx("h1", { children: "Accessibility Studio" })] })] }), _jsxs("main", { className: "workspace", children: [_jsxs("section", { className: "panel", children: [_jsxs("header", { children: [_jsx("h2", { children: "Content Intake" }), _jsx("p", { className: "lead", children: "Upload content, choose a support mode, and preview how the assistant will reshape it." })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "file-upload", className: "field-label", children: "PDF Upload" }), _jsx("input", { id: "file-upload", type: "file", accept: "application/pdf", onChange: handleFileChange }), uploadedFileName && _jsxs("p", { className: "helper-text", children: ["Selected file: ", uploadedFileName] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "mode-select", className: "field-label", children: "Support Mode" }), _jsx("select", { id: "mode-select", value: selectedMode, onChange: (event) => setSelectedMode(event.target.value), children: accessibilityModes.map((mode) => (_jsx("option", { value: mode.value, children: mode.label }, mode.value))) })] }), _jsx("button", { className: "primary", onClick: handleGeneratePreview, disabled: isGenerating, children: isGenerating ? "Preparing Preview…" : "Preview Accessibility Rewrite" }), errorMessage && _jsx("p", { className: "error-text", role: "alert", children: errorMessage })] }), _jsxs("section", { className: "panel preview", children: [_jsxs("div", { className: "preview-heading", children: [_jsx("h2", { children: "Preview" }), _jsx("span", { className: "chip", children: modeLabel })] }), _jsx("div", { className: "preview-content", "aria-live": "polite", children: _jsx(ReactMarkdown, { children: rewritePreview }) }), resultPayload ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "result-meta", children: [_jsxs("span", { children: [resultPayload.pages, " page", resultPayload.pages === 1 ? "" : "s"] }), _jsxs("span", { children: [resultPayload.characters.toLocaleString(), " characters"] }), _jsxs("span", { children: [resultPayload.result.reading_time_minutes, " min read"] })] }), resultPayload.result.highlights.length > 0 && (_jsxs("div", { className: "highlights", children: [_jsx("h3", { children: "Highlights" }), _jsx("ul", { children: resultPayload.result.highlights.map((item, index) => (_jsx("li", { children: item }, `${item}-${index}`))) })] }))] })) : (_jsx("p", { className: "helper-text", children: "Select a PDF and mode, then run the preview to see the Gemini rewrite." }))] }), quizQuestions.length > 0 && (_jsxs("section", { className: "panel quiz-panel", children: [_jsxs("header", { children: [_jsx("h2", { children: "Knowledge Check" }), _jsx("p", { className: "lead", children: "Answer a few quick questions to reinforce the rewritten content." })] }), _jsx("div", { className: "quiz-list", children: quizQuestions.map((question, index) => {
                                    const selected = quizAnswers[question.id];
                                    const breakdown = quizEvaluation?.breakdown.find((item) => item.question_id === question.id);
                                    const isCorrect = breakdown?.is_correct;
                                    const statusClass = breakdown ? (isCorrect ? "correct" : "incorrect") : "";
                                    return (_jsxs("article", { className: `quiz-card ${statusClass}`, children: [_jsxs("div", { className: "quiz-card-header", children: [_jsxs("span", { className: "quiz-step", children: ["Q", index + 1] }), breakdown && (_jsx("span", { className: `quiz-status ${statusClass}`, children: isCorrect ? "Correct" : "Try Again" }))] }), _jsx("p", { className: "quiz-question", children: question.question }), _jsx("div", { className: "quiz-options", children: question.options.map((option, optionIndex) => {
                                                    const inputId = `${question.id}-${optionIndex}`;
                                                    return (_jsxs("label", { htmlFor: inputId, className: "quiz-option", children: [_jsx("input", { id: inputId, type: "radio", name: question.id, value: optionIndex, checked: selected === optionIndex, onChange: () => handleAnswerChange(question.id, optionIndex), disabled: isSubmittingQuiz }), _jsx("span", { children: option })] }, inputId));
                                                }) }), breakdown && !isCorrect && (_jsx("p", { className: "quiz-feedback", children: question.explanation || "Review the rewrite above and try again." }))] }, question.id));
                                }) }), _jsxs("div", { className: "quiz-actions", children: [_jsx("button", { className: "primary secondary", type: "button", onClick: handleSubmitQuiz, disabled: isSubmittingQuiz, children: isSubmittingQuiz ? "Checking Answers…" : "Submit Quiz Answers" }), quizEvaluation && (_jsx("div", { className: "quiz-summary", children: _jsxs("p", { children: ["You answered ", quizEvaluation.correct_answers, " of ", quizEvaluation.total_questions, " correctly."] }) }))] })] }))] }), celebrate && (_jsxs("div", { className: "celebration-overlay", "aria-live": "polite", children: [_jsx("div", { className: "confetti", children: "\uD83C\uDF89" }), _jsxs("div", { className: "balloons", children: [_jsx("span", { className: "balloon" }), _jsx("span", { className: "balloon" }), _jsx("span", { className: "balloon" })] }), _jsx("p", { children: "Perfect score! Great job!" })] }))] }));
}
export default App;
