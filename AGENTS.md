# AGENTS.md

Single-file community site for HighCraft (Minecraft survival series + Otters MC Studios hub).

## Stack

- Static `index.html` only (inline CSS + JS)
- Assets under `assets/images/`
- GitHub Pages from `main` / root
- No package manager, no build

## Rules

- Keep it one page unless a real feature forces a split
- Project cards: edit the `projects` array in `index.html`, do not invent a CMS
- Player roster: edit the `#players` grid in `index.html` (name + gamertag)
- Windows-compatible paths
- Do not add a bundler, framework, or backend without being asked
- User-facing copy stays in the site's existing voice
- Visual language: Minecraft wiki light panels + classic dirt/stone/wood framing; keep the game-landing hero

## After every change (required)

Before you stop or push, run this pass:

1. **Site still works** — `index.html` loads; image paths and anchors still resolve
2. **AGENTS.md** — update if stack, structure, or conventions changed
3. **README.md** — refresh when the public story of the repo changed (look, features, how to edit, live URL, assets). Keep it sharp for GitHub visitors; do not leave it stale after a visible site change
4. **Commit message** — Conventional Commits: `feat|fix|docs|refactor|chore|test(scope): …`

Do this on basically every meaningful edit — not only when the user says “update docs.”

## Docs

If `DOCS/` is added later, follow the preservation header and never delete existing content.
