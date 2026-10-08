# AGENTS.md

Static personal site for GitHub Pages (`joseamaya.github.io`). No build, test, lint, or package manager. Push to `master` deploys the repo root as-is.

## Preview

Pages reference absolute paths (`/images/...`, `/como-deje-de-programar-y-empece-a-orquestar/`), so serve the **repo root** over HTTP; opening files directly breaks images and the redirect.

```
python3 -m http.server 8000
```

## Layout

- `index.html` + `css/styles.css` + `js/main.js` — portfolio/CV. Bilingual via `data-es`/`data-en` attributes; `main.js` toggles them (localStorage `language`, default `es`; also `theme`). PDF export is client-side in `main.js`.
- Six self-contained Reveal.js talk decks, each with its own `index.html`, `css/`, `js/deck.js`, `assets/` and `vendor/`:
  - `como-deje-de-programar-y-empece-a-orquestar/` — opencode/orchestration talk. `charla-opencode/` is only a redirect stub to this path.
  - `memoria-persistente-chatbots-telegram/` — Telegram + LangChain/LangGraph + MongoDB memory talk.
  - `introduccion-a-langchain/` — LangChain intro talk (SoporteBot case: models, prompts, structured outputs, RAG, agents).
  - `agentes-de-ia/` — AI Agents talk (GDG Piura: the agent loop, tools, memory, LangChain/LangGraph).
  - `introduccion-a-fastapi/` — FastAPI intro talk (Tienda API case: REST, routing, Pydantic validation, dependencies, database, security, testing). Uses its own FastAPI-branded theme (teal), not the shared navy one.
  - `arquitecturas-multitenant-en-python/` — multitenant SaaS in Python talk (AulaSaaS case: the 3 isolation patterns, PostgreSQL schemas, django-tenants, operations, FastAPI/SQLAlchemy). Ships its own Django/Postgres-branded theme (green/blue).
- `vendor/` lives inside each deck (Reveal, and Chart.js/fonts for the opencode one). Do not edit.

## Decks

- Slides are inline `<section>` elements in each deck's `index.html`; interactivity is that deck's `js/deck.js`.
- opencode deck only: `js/data.js` is a **generated snapshot** of opencode usage stats (single line assigning `window.DECK`). There is no generator in this repo — regenerate externally or edit the JSON by hand. Numbers use `data-count="<path.into.DECK>"` (plus optional `data-fmt="money|m|int|raw"`); add computed values in the `extra` object in `deck.js`, not inline.
- memory, langchain, agentes-de-ia, fastapi and multitenant decks: speaker notes live in `<aside class="notes">` per slide (Reveal notes plugin); code blocks use highlight.js (`language-python`).
- langchain and memory share the same visual theme (`css/theme.css`, copied per deck) and `css/fonts.css`; the fastapi (teal) and multitenant (Django green/Postgres blue) decks ship their own branded variants.
- PDF/print export: load a deck URL with `?print-pdf`; `deck.js` detects this and skips animations/typing.
