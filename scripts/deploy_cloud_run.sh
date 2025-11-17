#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud CLI is required. Install it from https://cloud.google.com/sdk/docs/install" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker CLI is required. Install Docker Desktop or the standalone CLI." >&2
  exit 1
fi

if [ -f "$ROOT_DIR/backend/.env" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ROOT_DIR/backend/.env"
  set +a
fi

: "${PROJECT_ID?Set PROJECT_ID environment variable before running this script.}"
REGION="${REGION:-us-central1}"
BACKEND_SERVICE="${BACKEND_SERVICE:-neuroclear-backend}"
FRONTEND_SERVICE="${FRONTEND_SERVICE:-neuroclear-frontend}"
BACKEND_IMAGE="gcr.io/${PROJECT_ID}/${BACKEND_SERVICE}:latest"
FRONTEND_IMAGE="gcr.io/${PROJECT_ID}/${FRONTEND_SERVICE}:latest"
: "${GEMINI_API_KEY?Provide GEMINI_API_KEY in backend/.env or environment.}"

echo "\nBuilding backend container image..."
docker build -f "$ROOT_DIR/backend/Dockerfile" -t "$BACKEND_IMAGE" "$ROOT_DIR"

echo "Pushing backend image to Artifact Registry/GCR..."
docker push "$BACKEND_IMAGE"

echo "Deploying backend to Cloud Run (${BACKEND_SERVICE})..."
gcloud run deploy "$BACKEND_SERVICE" \
  --image "$BACKEND_IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY}" \
  --project "$PROJECT_ID"

BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --platform managed \
  --format 'value(status.url)')

echo "Backend deployed at: ${BACKEND_URL}"

echo "\nBuilding frontend container image..."
docker build -f "$ROOT_DIR/frontend/Dockerfile" \
  --build-arg "VITE_API_BASE_URL=${BACKEND_URL}" \
  -t "$FRONTEND_IMAGE" \
  "$ROOT_DIR"

echo "Pushing frontend image..."
docker push "$FRONTEND_IMAGE"

echo "Deploying frontend to Cloud Run (${FRONTEND_SERVICE})..."
gcloud run deploy "$FRONTEND_SERVICE" \
  --image "$FRONTEND_IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "PORT=8080" \
  --project "$PROJECT_ID"

FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --platform managed \
  --format 'value(status.url)')

echo "\nDeployment complete!"
echo "Backend URL : ${BACKEND_URL}"
echo "Frontend URL: ${FRONTEND_URL}"
