# Smart Volunteer Allocation System

## Overview

AI-powered emergency management platform for allocating volunteers to emergencies using Gemini AI. Built as a pnpm monorepo with React+Vite frontend and Express API server.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (artifact: `smart-volunteer`)
- **API framework**: Express 5 (artifact: `api-server`, port 8080)
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: Gemini 2.5 Flash via `@workspace/integrations-gemini-ai`
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- **Build**: esbuild (ESM bundle)

## Application Features

- **Dashboard**: Analytics summary, priority breakdown chart, skill demand chart, recent emergencies
- **Volunteers**: Full CRUD with search, availability filter, toggle availability
- **Emergencies**: Full CRUD with status filter, resolve action
- **AI Analysis**: Describe an emergency → Gemini AI assesses priority, required skills, assigns matching available volunteers, creates emergency record

## Database Schema

- `volunteers` table: id, name, email, phone, skills[], available, location, totalAssignments, createdAt, updatedAt
- `emergencies` table: id, description, priority, status, requiredSkills[], assignedVolunteers[], reason, estimatedResponseTime, location, createdAt, resolvedAt

## API Routes

- `GET/POST /api/volunteers` — list (with search/available/skill filters) / create
- `GET/PUT/DELETE /api/volunteers/:id` — get / update / delete
- `PATCH /api/volunteers/:id/availability` — toggle availability
- `GET/POST /api/emergencies` — list (with status filter) / create
- `GET /api/emergencies/:id` — get single
- `PATCH /api/emergencies/:id/status` — update status
- `POST /api/emergency/analyze` — AI analysis (Gemini 2.5 Flash)
- `GET /api/analytics/summary` — dashboard summary stats
- `GET /api/analytics/recent-emergencies` — recent N emergencies
- `GET /api/analytics/priority-breakdown` — count by priority
- `GET /api/analytics/skill-demand` — top demanded skills

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Important Notes

- The orval zod codegen uses `workspace: lib/api-zod/src/generated/` (not `src/`) to prevent barrel regeneration conflicts. `lib/api-zod/src/index.ts` is managed manually.
- esbuild build.mjs externalizes `@google-cloud/*` but NOT `@google/*` so `@google/genai` gets bundled.
- Gemini AI env vars: `AI_INTEGRATIONS_GEMINI_BASE_URL` and `AI_INTEGRATIONS_GEMINI_API_KEY` are set via Replit AI Integrations.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
