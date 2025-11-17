import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";
import { transformPdf, type TransformResponse } from "./api";

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
  const [resultPayload, setResultPayload] = useState<TransformResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const modeLabel = useMemo(
    () => accessibilityModes.find((mode) => mode.value === selectedMode)?.label ?? "",
    [selectedMode]
  );

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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error. Please try again.";
      setErrorMessage(message);
      setResultPayload(null);
    } finally {
      setIsGenerating(false);
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
      </main>
    </div>
  );
}

export default App;
