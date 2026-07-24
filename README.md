# ScriptForge — AI Screenwriting Ideation Studio

**Challenge:** July – Reimagine Creative Industries with AI  
**Team:** [Your team name or solo]  
**Submission:** July 31, 2026

---

## Problem Statement

Screenwriters struggle with writer’s block, narrative inconsistencies, and slow ideation cycles. Existing tools are either simple word processors or generic AI chatbots that don’t understand screenplay structure. Writers need a purpose‑built creative partner that speaks their language.

## Solution

ScriptForge is a web app that combines a dedicated screenplay editor with a suite of AI agents for brainstorming, rewriting, consistency checking, and visual ideation. It uses IBM Bob as the primary development tool, Groq for fast NLP, Cloudflare Workers AI for image generation, and Supabase for persistence.

## AI Approach & Architecture

- **Brainstorm Agent:** Conversational ideation anchored to the current scene.
- **Improve Agents:** Grammar/style correction, tone shifting, consistency, fallacies, and pacing analysis.
- **Doctor Agent:** Full‑script narrative analysis for timeline, character arcs, and logic.
- **Image Pipeline:** Scene description → Groq prompt refiner (with user‑defined style sheet) → Cloudflare Workers AI (Flux.1 Schnell).

## How IBM Bob Was Used

- Scaffolded Next.js API routes and Lexical node boilerplate.
- Debugged Supabase Row‑Level Security policies.
- Generated TypeScript types and prompt chain logic.
- Refactored Fountain export/import parsers.
- Iterated on system prompts for the specialised agents.

## Tech Stack

- Frontend: Next.js (App Router), Tailwind CSS, shadcn/ui
- Editor: Meta Lexical (custom screenplay nodes)
- Backend/API: Next.js Route Handlers, Supabase
- AI: Groq (LLaMA 3.1), Cloudflare Workers AI
- Auth/DB: Supabase Auth + PostgreSQL

---

## Getting Started

1. Clone repo and install dependencies:

```bash
npm install
```
