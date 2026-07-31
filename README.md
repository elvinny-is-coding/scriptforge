# ScriptForge — AI‑Powered Screenwriting Studio

**Built for the IBM AI Builders Challenge (July 2026)**  
**Live demo:** [https://scriptforge-lyart.vercel.app/](https://scriptforge-lyart.vercel.app/)

**Team Members:**  
Elvin Ng Eng Kit, Lee Kue Jet, Soo Jian Yuan, Jischnu Jeremy

---

## About the Project

ScriptForge is an intelligent screenwriting workspace that combines a dedicated screenplay editor with a suite of AI agents for brainstorming, rewriting, analysis, and visual ideation. It was built to help writers move from blank page to polished draft faster, without ever leaving the editor.

The app understands screenplay structure natively — scene headings, action, character, dialogue, parentheticals, transitions, and outlines — and provides keyboard‑driven formatting, live autocomplete, character colours, scene numbers, and a distraction‑free focus mode.

---

## Key Features

- **Screenplay Editor** – Custom Lexical nodes for every element, Tab/Enter auto‑formatting, tool‑bar formatting, scene numbers, and a word/page counter.
- **AI Brainstorm** – Per‑scene chat with a writing partner; suggestions can be inserted directly into the script. The chat is persisted across sessions.
- **AI Improve** – Agents for grammar/style, tone, consistency, logic fallacies, and pacing. Review changes and apply them instantly.
- **Narrative Doctor** – Full‑script analysis that reports plot holes, timeline issues, character arc gaps, and logic flaws.
- **AI Scene Summaries** – One‑sentence summaries appear in the scene list, generated lazily and cached.
- **Inline Rewrite** – Right‑click any dialogue or action line to get 2‑3 AI‑rewritten alternatives and pick one.
- **Character Colors** – Assign a colour to each character; dynamic borders appear throughout the script wherever they speak.
- **Dialogue Tuner** – View all dialogue for a single character grouped by scene, with word counts.
- **Mood Board** – Right‑click any scene description to generate concept art (Cloudflare Workers AI), viewable full‑size.
- **Snapshots** – Manual and automatic checkpoints (before AI insert) that restore editor content, brainstorm chat, and improve outputs together.
- **Export** – Fountain, plain text, formatted PDF with title page and page numbers, and Final Draft XML (.fdx).
- **Public Sharing** – Generate a read‑only link to share your script; no login required for viewers.
- **Dashboard** – Search, sort, rename, soft‑delete projects; reorder scenes with drag‑and‑drop; filter by character; filter by genre and tags.
- **Profile** – Set a display name and bio, shown on shared scripts.
- **Find & Replace** – Search and replace across the current scene (Ctrl+H).
- **Keyboard Shortcuts** – Comprehensive shortcuts for all formatting and tools, with a built‑in help dialog and cheat sheet.
- **Theme Toggle** – Dark, light, and high‑contrast themes with persistent preference.

---

## How IBM Bob Was Used

IBM Bob served as the primary development tool throughout the entire project.

| Task                         | How Bob Helped                                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project Scaffolding**      | Generated the Next.js App Router structure, API route handlers, and the initial Lexical editor setup.                                           |
| **Lexical Node Boilerplate** | Created custom screenplay node classes (Scene Heading, Action, Character, Dialogue, etc.) with proper TypeScript typing and JSON serialization. |
| **Supabase RLS Policies**    | Wrote and debugged Row‑Level Security policies for projects, scenes, snapshots, and mood board images.                                          |
| **Prompt Engineering**       | Iteratively refined system prompts for the Brainstorm, Improve, Narrative Doctor, and image generation agents.                                  |
| **TypeScript Types**         | Generated and refined database types for end‑to‑end type safety across hooks and API routes.                                                    |
| **Debugging**                | Helped diagnose and resolve complex issues involving Lexical `EditorState`, Supabase inserts, and React hydration.                              |

Bob was used daily for chat, code generation, debugging, and architectural guidance, significantly accelerating development.

---

## Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, shadcn/ui
- **Editor:** Meta Lexical with custom screenplay nodes
- **Backend/API:** Next.js Route Handlers, Supabase
- **AI:** Groq (Llama 3.3 70B), Cloudflare Workers AI (FLUX.1 Schnell)
- **Authentication & Database:** Supabase Auth (Magic Link), PostgreSQL with Row‑Level Security (RLS)
- **Deployment:** Vercel

---

---

## Getting Started (Local)

### 1. Clone the Repository

```bash
git clone https://github.com/elvinny-is-coding/scriptforge.git
cd scriptforge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`, then fill in your:

- Supabase credentials
- Groq API key
- Cloudflare Workers AI credentials

### 4. Run Database Migrations

```bash
npx supabase db push
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

---

## Demo Video

## ▶️ Watch the 3-minute demo at https://drive.google.com/drive/folders/1kv7AjIm8c8sQKiq5UAw77oH4JkdYfnp9?usp=sharing

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

Built for the **IBM AI Builders Challenge 2026**.
