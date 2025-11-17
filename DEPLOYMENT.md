# Cloud Run Deployment Guide

This repository contains a FastAPI backend and a Vite/React frontend. Use `scripts/deploy_cloud_run.sh` to containerize, push, and deploy both apps to Google Cloud Run in one shot.

## Prerequisites

1. **Google Cloud project** with billing enabled.
2. **gcloud CLI** authenticated against the project (`gcloud auth login`).
3. **Docker** CLI (Docker Desktop or equivalent) and `gcloud auth configure-docker` executed once.
4. **Gemini API key** stored in `backend/.env` or exported as `GEMINI_API_KEY`.

## Script Overview

```
PROJECT_ID=my-project \
REGION=us-central1 \
BACKEND_SERVICE=neuroclear-backend \
FRONTEND_SERVICE=neuroclear-frontend \
./scripts/deploy_cloud_run.sh
```

### What the script does

1. Builds the backend image using `backend/Dockerfile` and pushes `gcr.io/PROJECT_ID/BACKEND_SERVICE:latest`.
2. Deploys the backend to Cloud Run with `GEMINI_API_KEY` injected as an environment variable.
3. Reads the backend URL from Cloud Run.
4. Builds the frontend image (`frontend/Dockerfile`) while injecting `VITE_API_BASE_URL` so the UI hits the deployed backend.
5. Deploys the frontend to Cloud Run and prints both service URLs.

### Required environment variables

- `PROJECT_ID` – Google Cloud project to deploy into.
- `GEMINI_API_KEY` – Gemini key passed to the backend (read from `backend/.env` automatically if present).

Optional overrides:

- `REGION` – defaults to `us-central1`.
- `BACKEND_SERVICE` – defaults to `neuroclear-backend`.
- `FRONTEND_SERVICE` – defaults to `neuroclear-frontend`.

### Notes

- Run `chmod +x scripts/deploy_cloud_run.sh` if your shell needs execute permissions.
- The frontend is an SPA served by Nginx listening on port 8080; Cloud Run handles TLS.
- Re-run the script any time you need to redeploy; images are tagged `:latest` for simplicity, but you can change tags in the script if you need versioned releases.
