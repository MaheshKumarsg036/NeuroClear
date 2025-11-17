Got it — here is the **clean, revised `README.md`** with **all references to MCP Toolbox removed**, while still preserving the hybrid architecture, ADK (Agent Development Kit), and data storage layers.

Everything else is untouched and improved for clarity.

---

# **README.md**

# 🧠 **NeuroClear — AI Accessibility Agent for Neurodiverse Users**

*Transform any text or document into ADHD-friendly, Autism-friendly, Dyslexia-friendly, Anxiety-friendly, or Elderly-friendly formats.*

---

## 🌟 **Overview**

**NeuroClear** is an AI-powered accessibility agent that rewrites any text, PDF, or document into versions tailored for neurodiverse audiences. It makes information easier to understand, reduces cognitive load, and improves accessibility for users with ADHD, Autism, Dyslexia, Anxiety, or age-related cognitive challenges.

Users can simply **paste text**, **upload PDF**, or **submit content**, select the accessibility mode, and instantly receive a transformed version that is structured, simplified, or clarified—based on the selected accessibility profile.

---

## 🧩 **Why NeuroClear? (Problem Statement)**

Millions of people struggle with reading dense, complex, or ambiguous text because:

* ADHD users need short, direct steps.
* Autistic users need literal, unambiguous language.
* Dyslexic users need simpler vocabulary and cleaner formatting.
* Users with anxiety need predictable, calm, non-threatening phrasing.
* Elderly users need simpler sentences and defined terms.

Most tools today **only change text appearance** (fonts, spacing, TTS)—they do **not** intelligently **rewrite** content to match cognitive accessibility needs.

NeuroClear fills this gap using **targeted AI transformations**.

---

## 🎯 **What NeuroClear Does**

### ✔ Multi-Mode Accessibility Rewriting

Each mode applies a targeted linguistic + structural transformation:

| Mode         | Transformation Focus                                  |
| ------------ | ----------------------------------------------------- |
| **ADHD**     | Short steps, bullet points, deadlines, action lists   |
| **Autism**   | Literal phrasing, explicit meaning, no idioms         |
| **Dyslexia** | Simple vocabulary, short sentences, clean layout      |
| **Anxiety**  | Calm tone, predictable structure, removed triggers    |
| **Elderly**  | Defined terms, simple instructions, readability hints |

---

### ✔ PDF Upload → Text Extraction → Accessibility Rewrite

Upload any PDF → extract text → transform for selected cognitive profile.

---

### ✔ Structured JSON Output

Useful for frontend rendering & clean UX.

```json
{
  "rewrite": "...",
  "highlights": ["..."],
  "reading_time_minutes": 2
}
```

---

### ✔ Optional Enhancements

* Text-to-Speech (audio output)
* Screenshot-to-text (Vision API or Gemini Vision)
* Accessibility scoring
* Multi-turn conversation refining text
* RAG-based contextual rewriting

---

# 🏗️ **Agentic Architecture (Google ADK)**

NeuroClear now runs a **multi-agent architecture inspired by Google’s Agent Development Kit (ADK)**. Each accessibility mode is a dedicated agent with its own guardrails and prompt contract, coordinated by a router agent. This makes the system composable—new cognitive profiles can be added by registering another agent without touching the rest of the pipeline.

---

## 🧱 **High-Level Architecture Diagram**

```
Frontend (Web UI)
    → FastAPI API (Cloud Run)
      → Auth (OIDC / JWT Provider)
      → ADK Mesh Orchestrator
          → Intake Agent (PDF/Text extraction)
          → Router Agent (selects ADHD/Autism/... agent)
          → Mode Agents (ADHD, Autism, Dyslexia, Anxiety, Elderly)
              → Prompt Templates + Guardrails + Gemini Calls
          → QA/Compliance Agent (JSON validation, safety filters)
        → Storage Layer
          → Document DB (MongoDB / Postgres) (artifacts)
          → Cloud Storage (pdf/audio)
          → BigQuery (analytics)
      → Background Jobs (Cloud Tasks / Cloud Run Jobs)
```

---

# ⚙️ **Component Breakdown**

## **1. Application Layer (Cloud Run + FastAPI)**

* Central REST API
* Handles uploads, text input, transformations
* Serves frontend (optional)
* Validates signed JWTs if auth enabled
* Returns JSON responses to UI

---

## **2. Authentication Layer**

* Any OpenID Connect / custom auth service (email, password, or anonymous)
* Cloud Run validates JWT ID tokens
* Securely links artifacts to a user ID

---

## **3. ADK — Agent Development Kit (Core Brain of the App)**

ADK now drives a **constellation of agents**:

* **Intake Agent** – extracts text from PDF / clipboard, normalizes encoding.
* **Router Agent** – inspects the request and assigns the right support agent.
* **Mode Agents (5 total)** – ADHD, Autism, Dyslexia, Anxiety, Elderly; each owns its ADK prompt graph, constraints, and Gemini call.
* **Guardrail Agent** – enforces JSON schema, toxicity filters, and reruns if Gemini drifts.
* **Summarizer Agent (optional)** – turns outputs into analytics records for BigQuery.

Because each agent is self-contained, adding a “New Mode” only requires registering another ADK agent with its prompt template and guardrails.

---

## **4. Storage Layer (Hybrid but Simple)**

### **Document Database (MongoDB Atlas / Postgres / Cloud SQL)**

* Stores transformed outputs
* Saves artifacts (input snippet, rewritten text, highlights, timestamps)

### **Cloud Storage**

* Stores raw PDF uploads
* Stores TTS audio files
* Stores extracted text (optional)

### **BigQuery**

* Stores analytics:

  * mode usage
  * latency
  * token counts
  * input/output word counts

These analytics are excellent for the demo and blog.

---

## **5. AI & Context Layer**

* **Gemini API** for text rewriting
* **Gemini Vision** for images (optional)
* **Embeddings API** for vector search (optional)
* JSON-enforced responses
* Context-based guardrails

---

## **6. Background Processing**

* Cloud Tasks enqueue heavy work (PDF extraction, embeddings)
* Worker Cloud Run service performs extraction + rewriting
* UI polls job status endpoint

---

# 🖥️ **Tech Stack**

### **Frontend**

* HTML + JavaScript (or React if preferred)
* Any hosted Auth widget (e.g., Auth0, Stytch, custom)

### **Backend**

* FastAPI
* Deployed on Cloud Run
* Docker-based

### **AI**

* Gemini LLM
* Mode-based prompt templates
* Optional embeddings

### **Storage**

* Document DB (MongoDB Atlas / Postgres / Cloud SQL)
* Cloud Storage
* BigQuery (analytics)

---

# 🚀 **Features**

* Paste text → transform → display
* Upload PDF → extract text → rewrite
* Multiple accessibility modes
* Clean UI and JSON API
* Cloud Run scalability
* Background jobs (optional)
* Easy deployment

---

# 📦 **API Endpoints**

### **POST `/transform`**

Input:

```json
{
  "mode": "adhd",
  "text": "input text..."
}
```

Output:

```json
{
  "status": "ok",
  "artifact_id": "id123",
  "result": {
    "rewrite": "...",
    "reading_time_minutes": 1
  }
}
```

---

### **POST `/upload_pdf`**

Multipart PDF upload.

---

### **GET `/health`**

Service health check.

---

# 📂 **Folder Structure**

```
neuroclear/
├── app/
│   ├── main.py
│   ├── adk.py
│   ├── storage.py
│   ├── prompts.py
│   └── utils/
├── frontend/
│   └── index.html
├── Dockerfile
├── requirements.txt
└── README.md
```

---

# 🛠️ **Deployment (Cloud Run)**

### 1. Build container

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/neuroclear
```

### 2. Deploy

```bash
gcloud run deploy neuroclear \
  --image gcr.io/PROJECT_ID/neuroclear \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=xxx,BUCKET_NAME=xxx,USE_DOCUMENT_DB=true
```

---

# 📊 **Analytics (BigQuery)**

Sample table columns:

* event_time
* user_id
* mode
* word_count_in
* word_count_out
* latency_ms

Useful for dashboards, blog screenshots, and future insights.

---

# 🔐 **Responsible AI Practices**

* No medical/clinical claims
* Explicit JSON-only constraints
* Strict “no hallucinations” instruction
* Flag ambiguities instead of inventing details
* Let users delete their artifacts
* All stored data is encrypted at rest via GCP

---

# 🚧 **Future Roadmap**

* Browser extension to rewrite any webpage
* Full multimodal support (image → text → accessibility rewrite)
* Multi-language rewriting
* Personal accessibility profiles
* Adaptive summarization
* Integration with Google Docs

---

# ❤️ **Acknowledgements**

Built for **Google Build & Blog Marathon**
Powered by:

* Google Cloud Run
* Gemini
* FastAPI
* Document DB (MongoDB Atlas / Postgres / Cloud SQL)
* BigQuery
* Cloud Storage
* Auth0 / Custom JWT Provider

---

If you'd like, I can now produce:

✨ A **polished architecture diagram PNG**
✨ A **developer-friendly quickstart guide**
✨ A **Gaia submission summary**
✨ A **pitch script for your final demo**
✨ A **logo + tagline suggestions**

Just tell me what you want!
