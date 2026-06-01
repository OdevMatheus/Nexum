# Nexum

Monorepo for Nexum with a Spring Boot backend and a React + Vite frontend.

## Overview
- `backend/`: Java 25 + Spring Boot 4.0.6 API.
- `frontend/`: React 19 + TypeScript + Vite UI.
- Infra (local): PostgreSQL, Redis, Kafka (via `docker/docker-compose.yml`).

## Prerequisites
- Java 25 (for the backend).
- Node.js + npm (for the frontend).
- Docker (optional, for local infra).

## Setup
1) Start the local infra (Postgres, Redis, Kafka):

```powershell
cd D:\Repositories\nexum\docker
docker compose up -d
```

2) Configure backend environment variables (create `backend/.env`):
- `JWT_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `APP_BASE_URL`

## Run backend
```powershell
cd D:\Repositories\nexum\backend
.\mvnw spring-boot:run
```

Backend runs at `http://localhost:8080`.

## Run frontend
```powershell
cd D:\Repositories\nexum\frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Notes
- Database connection defaults to `localhost:5432` with `nexum_user` / `nexum_password`.
- Redis defaults to `localhost:6379`.
- Kafka defaults to `localhost:9092`.
