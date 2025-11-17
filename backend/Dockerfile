# syntax=docker/dockerfile:1.7
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY backend/ /app/

ENV PORT=8080
EXPOSE 8080

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
