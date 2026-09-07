# Distribution Engine
Not your ordinary content repuropser

---

An intelligent, multi-platform content distribution engine that ingests core source material, extracts analytical intelligence using Google Gemini, synthesizes cross-platform distribution strategies with deterministic diversity re-ranking, manages content asset preparation, and tracks execution outcomes.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Compiler)
- **UI & Styling**: React 19, [Tailwind CSS v4](https://tailwindcss.com/), Base UI, Phosphor Icons, Lucide, MorphIcons
- **Authentication**: [Better Auth](https://www.better-auth.com/) (Google & GitHub OAuth, session caching)
- **Database & ORM**: PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/)
- **AI Intelligence**: [Google Gemini 2.5](https://ai.google.dev/) via `@google/genai`
- **Testing**: [Vitest](https://vitest.dev/) with JSDOM and Testing Library

## Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env` and fill in your database and API credentials:

```bash
cp .env.example .env
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Database Schema

Generate and push database schemas:

```bash
pnpm db:push
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Verification & Quality Commands

- **Unit & Integration Tests**: `pnpm test`
- **TypeScript Typecheck**: `pnpm tsc --noEmit`
- **ESLint**: `pnpm lint`
- **Production Build**: `pnpm build`

## Architecture & Workflows

1. **Content Ingestion**: Ingest core source material (articles, memos, transcripts, notes).
2. **Content Intelligence**: AI-powered extraction of key themes, core ideas, target angles, and technical concepts.
3. **Distribution Planning**: Multi-platform strategy generation across 7 platforms (X, LinkedIn, Substack, YouTube, Reddit, Dev.to, Hacker News) with algorithmic candidate scoring and diversity re-ranking.
4. **Asset Workspace**: Per-strategy asset drafting, live character counting, markdown preview, and status progression.
5. **Execution Queue**: Prioritized queue management (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `SKIPPED`).
6. **Outcomes & Analytics**: Tracking execution observations, metrics, and quantitative outcome history.
