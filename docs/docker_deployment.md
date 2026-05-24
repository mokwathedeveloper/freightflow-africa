# Docker & CI/CD Deployment Guide — FreightFlow SaaS

This document provides the complete Docker and CI/CD deployment configuration for FreightFlow, aligned with the Africa's Talking Hackathon requirement to deploy via Docker with automated CI/CD.

---

## 1. Project Structure (for Docker context)

```
freightflow/
├── Dockerfile.api            ← Node.js/Express backend
├── Dockerfile.web            ← Next.js frontend
├── docker-compose.yml        ← Full stack orchestration
├── .env.example              ← Environment variable template
├── .dockerignore
├── server/                   ← Backend source code
│   └── package.json
└── web/                      ← Frontend source code
    └── package.json
```

---

## 2. Dockerfile — Node.js/Express Backend

```dockerfile
# Dockerfile.api
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy source
COPY server/ .

# Production build (if using TypeScript)
# RUN npm run build

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "index.js"]
```

**Multi-stage build (with TypeScript):**
```dockerfile
# Dockerfile.api (TypeScript version)
FROM node:20-alpine AS builder
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/ .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY server/package.json ./
EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

---

## 3. Dockerfile — Next.js Frontend

```dockerfile
# Dockerfile.web
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY web/package*.json ./
RUN npm ci

# Build Next.js app
COPY web/ .
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
```

---

## 4. docker-compose.yml — Full Stack

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: freightflow_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-freightflow}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-freightflow_secret}
      POSTGRES_DB: ${POSTGRES_DB:-freightflow}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-freightflow}"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: freightflow_api
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-freightflow}:${POSTGRES_PASSWORD:-freightflow_secret}@db:5432/${POSTGRES_DB:-freightflow}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-7d}
      AT_API_KEY: ${AT_API_KEY}
      AT_USERNAME: ${AT_USERNAME}
      AT_SENDER_ID: ${AT_SENDER_ID:-FreightFlow}
      AT_USSD_CODE: ${AT_USSD_CODE}
      AT_VOICE_NUMBER: ${AT_VOICE_NUMBER}
      MPESA_CONSUMER_KEY: ${MPESA_CONSUMER_KEY}
      MPESA_CONSUMER_SECRET: ${MPESA_CONSUMER_SECRET}
      MPESA_SHORTCODE: ${MPESA_SHORTCODE}
      MPESA_PASSKEY: ${MPESA_PASSKEY}
      APP_URL: ${APP_URL:-http://localhost:4000}
      NODE_ENV: ${NODE_ENV:-production}
    ports:
      - "4000:4000"
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    container_name: freightflow_web
    restart: unless-stopped
    depends_on:
      - api
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:4000}
      NODE_ENV: ${NODE_ENV:-production}
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```

---

## 5. .env.example

```bash
# .env.example — copy to .env and fill in values
# NEVER commit the actual .env file to git

# Africa's Talking
AT_API_KEY=your_at_api_key_here
AT_USERNAME=sandbox
AT_SENDER_ID=FreightFlow
AT_USSD_CODE=*384*7447#
AT_VOICE_NUMBER=+254XXXXXXXXX

# Database
POSTGRES_USER=freightflow
POSTGRES_PASSWORD=your_db_password_here
POSTGRES_DB=freightflow
DATABASE_URL=postgresql://freightflow:your_db_password_here@db:5432/freightflow

# JWT Authentication
JWT_SECRET=your_jwt_secret_minimum_32_chars_here
JWT_EXPIRES_IN=7d

# M-Pesa (Safaricom Daraja)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_mpesa_passkey
MPESA_CALLBACK_URL=https://your-domain.com/api/webhooks/mpesa

# Application
NODE_ENV=production
PORT=4000
APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

**Add to `.gitignore`:**
```
.env
.env.local
.env.production
node_modules/
.next/
dist/
```

---

## 6. .dockerignore

```
node_modules
.next
.env
.env.*
!.env.example
dist
*.log
.git
.gitignore
README.md
docs/
design/
```

---

## 7. Health Check Endpoint

Add this to your Express backend so Docker and hosting platforms can verify the API is alive:

```javascript
// server/routes/health.js
const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FreightFlow API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

module.exports = router;

// In server/index.js:
app.use('/health', require('./routes/health'));
```

---

## 8. GitHub Actions CI/CD Workflow

```yaml
# .github/workflows/deploy.yml
name: FreightFlow CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: freightflow
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: freightflow_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: server/package-lock.json

      - name: Install backend dependencies
        run: npm ci
        working-directory: server

      - name: Run database migrations
        run: npx prisma migrate deploy
        working-directory: server
        env:
          DATABASE_URL: postgresql://freightflow:test_password@localhost:5432/freightflow_test

      - name: Run tests
        run: npm test
        working-directory: server
        env:
          DATABASE_URL: postgresql://freightflow:test_password@localhost:5432/freightflow_test
          JWT_SECRET: test_secret_for_ci
          AT_API_KEY: sandbox
          AT_USERNAME: sandbox
          NODE_ENV: test

  build-and-deploy:
    name: Build & Deploy
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push API image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: Dockerfile.api
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/freightflow-api:latest

      - name: Build and push Web image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: Dockerfile.web
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/freightflow-web:latest

      - name: Deploy to Render
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_API }}"
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_WEB }}"
```

**GitHub Secrets required (set in repo Settings → Secrets):**

| Secret | Value |
|--------|-------|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Your Docker Hub password or access token |
| `RENDER_DEPLOY_HOOK_API` | Render deploy hook URL for the API service |
| `RENDER_DEPLOY_HOOK_WEB` | Render deploy hook URL for the web service |

---

## 9. Deploy to Render (Free Tier)

1. Go to [render.com](https://render.com) and create a free account
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `freightflow-api`
   - **Environment:** `Docker`
   - **Dockerfile Path:** `./Dockerfile.api`
   - **Instance Type:** Free
5. Add all environment variables from `.env.example`
6. Click **Create Web Service**
7. Repeat for the frontend (`freightflow-web`, `./Dockerfile.web`)
8. Add a **PostgreSQL** database from Render's dashboard (free tier available)

**Get the live URL from Render** (e.g., `https://freightflow-api.onrender.com`) and update `APP_URL` in your environment variables.

---

## 10. Local Development (without Docker)

```bash
# Backend
cd server
npm install
npx prisma migrate dev
npm run dev          # starts on http://localhost:4000

# Frontend (separate terminal)
cd web
npm install
npm run dev          # starts on http://localhost:3000
```

---

## 11. Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `db connection refused` | DB not ready when API starts | Ensure `depends_on` with `condition: service_healthy` in compose |
| `ECONNREFUSED localhost:4000` in web | Web container can't reach `localhost` | Use `http://api:4000` as the API URL inside Docker (service name, not localhost) |
| `prisma migrate` fails in CI | Missing DATABASE_URL | Set `DATABASE_URL` in GitHub Actions env |
| AT SMS not sending in sandbox | Wrong AT_USERNAME | Must be exactly `sandbox` (lowercase) for AT sandbox |
| USSD not working | Callback URL not reachable | AT USSD needs a publicly accessible URL — use ngrok in local dev |
| `next build` fails | Missing env vars at build time | Prefix frontend-needed vars with `NEXT_PUBLIC_` |

**For local USSD testing (without a public URL):**
```bash
# Install ngrok
npm install -g ngrok

# Expose your local API
ngrok http 4000

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Set as your USSD callback URL in AT dashboard
```

---

*Related docs: [`docs/africas_talking_integration.md`](africas_talking_integration.md) · [`docs/development_task_list.md`](development_task_list.md)*
