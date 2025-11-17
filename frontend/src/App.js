import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";
import { transformPdf } from "./api";
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
    const [resultPayload, setResultPayload] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const modeLabel = useMemo(() => accessibilityModes.find((mode) => mode.value === selectedMode)?.label ?? "", [selectedMode]);
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
    };
    const handleGeneratePreview = async () => {
        if (!documentFile) {
            setErrorMessage("Please select a PDF document first.");
            return;
        }
        setIsGenerating(true);
        setErrorMessage(null);
        try {
            const response = await transformPdf(selectedMode, documentFile);
            setResultPayload(response);
            setPreviewText(response.result?.rewrite ?? "");
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unexpected error. Please try again.";
            setErrorMessage(message);
            setResultPayload(null);
        }
        finally {
            setIsGenerating(false);
        }
    };
    const rewritePreview = resultPayload?.result?.rewrite?.trim().length
        ? resultPayload.result.rewrite
        : previewText;
    return (_jsxs("div", { className: "page", children: [_jsxs("header", { className: "top-bar", children: [_jsxs("div", { className: "brand-mark", "aria-hidden": true, children: [_jsx("span", { className: "dot dot-blue" }), _jsx("span", { className: "dot dot-red" }), _jsx("span", { className: "dot dot-yellow" }), _jsx("span", { className: "dot dot-green" })] }), _jsxs("div", { children: [_jsx("p", { className: "top-label", children: "NeuroClear" }), _jsx("h1", { children: "Accessibility Studio" })] })] }), _jsxs("main", { className: "workspace", children: [_jsxs("section", { className: "panel", children: [_jsxs("header", { children: [_jsx("h2", { children: "Content Intake" }), _jsx("p", { className: "lead", children: "Upload content, choose a support mode, and preview how the assistant will reshape it." })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "file-upload", className: "field-label", children: "PDF Upload" }), _jsx("input", { id: "file-upload", type: "file", accept: "application/pdf", onChange: handleFileChange }), uploadedFileName && _jsxs("p", { className: "helper-text", children: ["Selected file: ", uploadedFileName] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "mode-select", className: "field-label", children: "Support Mode" }), _jsx("select", { id: "mode-select", value: selectedMode, onChange: (event) => setSelectedMode(event.target.value), children: accessibilityModes.map((mode) => (_jsx("option", { value: mode.value, children: mode.label }, mode.value))) })] }), _jsx("button", { className: "primary", onClick: handleGeneratePreview, disabled: isGenerating, children: isGenerating ? "Preparing Preview…" : "Preview Accessibility Rewrite" }), errorMessage && _jsx("p", { className: "error-text", role: "alert", children: errorMessage })] }), _jsxs("section", { className: "panel preview", children: [_jsxs("div", { className: "preview-heading", children: [_jsx("h2", { children: "Preview" }), _jsx("span", { className: "chip", children: modeLabel })] }), _jsx("div", { className: "preview-content", "aria-live": "polite", children: _jsx(ReactMarkdown, { children: rewritePreview }) }), resultPayload ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "result-meta", children: [_jsxs("span", { children: [resultPayload.pages, " page", resultPayload.pages === 1 ? "" : "s"] }), _jsxs("span", { children: [resultPayload.characters.toLocaleString(), " characters"] }), _jsxs("span", { children: [resultPayload.result.reading_time_minutes, " min read"] })] }), resultPayload.result.highlights.length > 0 && (_jsxs("div", { className: "highlights", children: [_jsx("h3", { children: "Highlights" }), _jsx("ul", { children: resultPayload.result.highlights.map((item, index) => (_jsx("li", { children: item }, `${item}-${index}`))) })] }))] })) : (_jsx("p", { className: "helper-text", children: "Select a PDF and mode, then run the preview to see the Gemini rewrite." }))] })] })] }));
}
export default App;
