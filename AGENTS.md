# AGENTS.md

Single-file community site for HighCraft (Minecraft survival series + Otters MC Studios hub).

**Studio project hub (public site):** https://otterdays.github.io/Minecraft-Stuffs/  
(Repo: https://github.com/Otterdays/Minecraft-Stuffs — link hub CTAs to the Pages URL, not the repo, unless the user asks for GitHub.)

## #1 — Caveman ultra (first thing)

**Before any other work:** activate `/caveman ultra`.

- Load + follow the caveman skill at ultra intensity for all replies in this repo
- Terse compressed prose; full technical accuracy; no fluff; no announcing the mode
- Code, commits, PR bodies, exact errors: write normal (caveman skill boundaries)
- Off only if user says `stop caveman` / `normal mode`

This rule beats every rule below when they conflict on communication style.

## Stack

- Static `index.html` only (inline CSS + JS)
- Assets under `assets/images/`
- GitHub Pages from `main` / root
- No package manager, no build

## Rules

- Keep it one page unless a real feature forces a split
- Project cards: edit the `projects` array in `index.html`, do not invent a CMS
- Player roster: edit the `#players` grid in `index.html` (name + gamertag)
- Server version chip: edit the `#serverVersion` copy in `index.html` (floating; minimize persists via `localStorage`). Always label **Java Edition**.
- Server IP: `#join` banner in `index.html` and README **Play with us** — currently `afykirby.aternos.me` (Aternos free host, Java Edition only — not Bedrock). If the world is offline, players should message the host to start it (free-plan idle shutdown). Update site + README together.
- Recommended modpack: `#modpack` banner + hero “Get Modpack” → [Fabulously Optimized](https://modrinth.com/modpack/fabulously-optimized). Note in the banner + README that the pack is most likely still on current stable Java Edition (currently **26.2**), not the snapshot world. Update that number when stable bumps.
- Windows-compatible paths
- Do not add a bundler, framework, or backend without being asked
- User-facing copy stays in the site's existing voice
- Visual language: Minecraft wiki light panels + classic dirt/stone/wood framing (pixel-tiled cobble + oak rails); keep the game-landing hero

## After every change (required)

Before you stop or push, run this pass:

1. **Site still works** — `index.html` loads; image paths and anchors still resolve
2. **AGENTS.md** — update if stack, structure, or conventions changed
3. **README.md** — refresh when the public story of the repo changed (look, features, how to edit, live URL, assets). Keep it sharp for GitHub visitors; do not leave it stale after a visible site change
4. **Commit message** — Conventional Commits: `feat|fix|docs|refactor|chore|test(scope): …`

Do this on basically every meaningful edit — not only when the user says “update docs.”

## Docs

If `DOCS/` is added later, follow the preservation header and never delete existing content.
