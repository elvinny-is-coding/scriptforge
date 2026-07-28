# ScriptForge — AI-Powered Screenwriting Studio

**Built for the IBM AI Builders Challenge (July 2026)**  
**Live demo:** https://scriptforge-lyart.vercel.app/

---

## About the Project

ScriptForge is an intelligent screenwriting workspace that combines a dedicated screenplay editor with a suite of AI agents for brainstorming, rewriting, analysis, and visual ideation. It was built to help writers move from blank page to polished draft faster, without ever leaving the editor.

The app understands screenplay structure natively—scene headings, action, character, dialogue, parentheticals, and transitions—and provides keyboard-driven formatting, live autocomplete, and a distraction-free focus mode.

---

## Key Features

- **Screenplay Editor** with custom Lexical nodes for every screenplay element, Tab/Enter auto-formatting, and toolbar formatting controls.
- **AI Brainstorm** – A scene-specific chat interface with one-click insertion of suggestions directly into the screenplay.
- **AI Improve** – AI agents for grammar, style, tone, consistency, fallacy detection, and pacing, with instant application of suggestions.
- **Narrative Doctor** – Full-script analysis that identifies plot holes, character arc gaps, timeline inconsistencies, and logic flaws.
- **Character Colors** – Assign colors to characters; matching borders appear throughout the script wherever they speak.
- **Mood Board** – Generate concept art from scene descriptions using Cloudflare Workers AI and view images in full resolution.
- **Snapshots** – Manual and automatic checkpoints (before every AI insertion) that restore the editor, Brainstorm chat, and Improve state together.
- **Export** – Export to Fountain, plain text, or professionally formatted PDF with title page and page numbers.
- **Dashboard** – Search, sort, rename, delete projects, reorder scenes with drag-and-drop, and filter by character.
- **Keyboard Shortcuts** – Comprehensive shortcut support with a built-in help dialog.

---

## How IBM Bob Was Used

IBM Bob served as the primary development tool throughout the entire project.

| Task                         | How Bob Helped                                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project Scaffolding**      | Generated the Next.js App Router structure, API route handlers, and the initial Lexical editor setup.                                           |
| **Lexical Node Boilerplate** | Created custom screenplay node classes (Scene Heading, Action, Character, Dialogue, etc.) with proper TypeScript typing and JSON serialization. |
| **Supabase RLS Policies**    | Wrote and debugged Row-Level Security policies for projects, scenes, snapshots, and mood board images.                                          |
| **Prompt Engineering**       | Iteratively refined system prompts for the Brainstorm, Improve, Narrative Doctor, and image generation agents.                                  |
| **TypeScript Types**         | Generated and refined database types for end-to-end type safety across hooks and API routes.                                                    |
| **Debugging**                | Helped diagnose and resolve complex issues involving Lexical `EditorState`, Supabase inserts, and React hydration.                              |

Bob was used daily for chat, code generation, debugging, and architectural guidance, significantly accelerating development.

---

## Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, shadcn/ui
- **Editor:** Meta Lexical with custom screenplay nodes
- **Backend/API:** Next.js Route Handlers, Supabase
- **AI:** Groq (Llama 3.3 70B), Cloudflare Workers AI (FLUX.1 Schnell)
- **Authentication & Database:** Supabase Auth (Magic Link), PostgreSQL with Row-Level Security (RLS)
- **Deployment:** Vercel

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

▶️ Watch the 3-minute demo

> Replace this section with the final video link after uploading.

---

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

Built for the **IBM AI Builders Challenge 2026**.
