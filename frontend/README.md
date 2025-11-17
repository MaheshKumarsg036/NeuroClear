# NeuroClear Frontend

React (Vite) UI for uploading PDFs, selecting an accessibility support mode, and calling the FastAPI backend to stream Gemini rewrites.

## Prerequisites

- Node.js 18+
- npm 9+

## Quick start

1. Copy the example env file and adjust the backend URL if needed:

	```bash
	cd frontend
	cp .env.example .env
	```

2. Install dependencies and start the dev server:

	```bash
	npm install
	npm run dev
	```

By default the frontend runs on http://localhost:5173 and proxies API calls to `VITE_API_BASE_URL` (defaults to `http://127.0.0.1:8000`). Ensure the FastAPI backend is running with `uvicorn backend.app:app --reload`.

## Container image

Build and run the static site with Docker + Nginx:

```bash
docker build -f frontend/Dockerfile -t neuroclear-frontend ..
docker run --rm -p 8080:8080 neuroclear-frontend
```

Pass a different backend URL at build time with `--build-arg VITE_API_BASE_URL=https://your-backend-url`.

## Available scripts

- `npm run dev` – start Vite in dev mode with hot reload.
- `npm run build` – type-check and produce a production build in `dist/`.
- `npm run preview` – locally preview the production build.

## Next steps

- Add auth or per-user history views if needed.
- Enhance error handling (retry, exponential backoff).
- Stream chunked responses for progressive rendering.
