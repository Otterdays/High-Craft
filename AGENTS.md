# AGENTS.md

Community site for HighCraft (Minecraft survival series + Otters MC Studios hub) plus an **internal games lab**.

**Studio project hub (public site):** https://otterdays.github.io/Minecraft-Stuffs/  
(Repo: https://github.com/Otterdays/Minecraft-Stuffs — link hub CTAs to the Pages URL, not the repo, unless the user asks for GitHub.)

## #1 — Caveman ultra (first thing)

**Before any other work:** activate `/caveman ultra`.

- Load + follow the caveman skill at ultra intensity for all replies in this repo
- Terse compressed prose; full technical accuracy; no fluff; no announcing the mode
- Code, commits, PR bodies, exact errors: write normal (caveman skill boundaries)
- Off only if user says `stop caveman` / `normal mode`
- If the caveman skill file is missing from this machine, still write chat in that style

This rule beats every rule below when they conflict on communication style.

## Stack

- GitHub Pages from `main` / root. **No Actions required. No paid services. No bundler. No package manager. No backend.**
- Public landing: `index.html` (inline CSS + JS)
- Extra static pages allowed when a real feature needs a split (games lab is that split)
- Vanilla HTML / CSS / JS only for anything under `games/`
- Assets under `assets/images/`
- Internal docs under `DOCS/` (preservation header; never delete existing content)
- Relative URLs only (`games/index.html`, `../index.html`). This repo is often served as a **project Pages** site (`/High-Craft/`). Root-absolute paths like `/games/` will 404.

## Site map

| URL path | File | Public story |
|----------|------|----------------|
| `/` | `index.html` | HighCraft Minecraft series + studio hub |
| `/games/` | `games/index.html` | Internal lab index. Stamp it internal. |
| `/games/high-craft-2d-v1/` | `games/high-craft-2d-v1/index.html` + `game.css` + `game.js` | High Craft 2D V1 sketch |

Do **not** fold the 2D toy into `index.html` as the whole site. It **does** get a `projects` array card (Play → `games/high-craft-2d-v1/`). Keep dealing copy off the **hero**; the card may use cartoon stoop-economy language.

## High Craft 2D (internal only)

**Nobody is expected to play this.** It is a crew joke / systems sketch, not a product.

Canon design: `DOCS/GDD_HIGH_CRAFT_2D.md` (intent). The V1 folder is what is actually coded.

### Theme (this is the game)

Not a Minecraft reskin with funny ore. Core loop is a **cartoon stoop economy** on a Terraria-shaped body:

1. **Dig** nugs / resin out of the hill
2. **Sell** to **The Regular** (cheap) for **Green**
3. **Buy** from **The Plug** (rip-off) if you are empty
4. **Consume** a nug (`C`) = haze *potion* (jump, sway, green tint). Not a drug sim.
5. **Build** a hole / stash box because you can

Buy-from-Plug then sell-to-Regular must stay a **loss**. Mining is the only print. See GDD rates.

### Content fence

- Fiction. Sitcom crime. Game tokens named Green / Nug / Resin / Haze.
- **Never** add real-world cultivation, chemistry, weights, street prices, evasion, or “how to deal” documentation.
- Consume = Minecraft-potion status effect. No addiction meter, no instructional portrayal.
- 18+ parody copy is OK on `games/*` only.
- **`index.html` stays mostly clean:** Games button in the top bar. No dealing copy on the **hero**. High Craft 2D **does** get a project card in the `projects` array (`highcraft: true`, relative `url`, `linkLabel: "Play"`).

### How to edit V1

- Tiles, prices, economy, gen: `games/high-craft-2d-v1/hc2d-core.js` (this is what the Node suite hits)
- DOM / canvas / input: `games/high-craft-2d-v1/game.js` (must load **after** `hc2d-core.js`)
- Chrome / HUD: `game.css` + `index.html` in that folder
- Lab listing: add a card on `games/index.html` + a new folder under `games/<slug>/`
- New lab toys follow the same rule: static HTML/CSS/JS, relative links, internal stamp, `noindex`

## Rules (public hub)

- Keep the landing one page unless a real feature forces a split
- Project cards: edit the `projects` array in `index.html`, do not invent a CMS
- Player roster: edit the `#players` grid in `index.html` (name + gamertag)
- Server version chip: edit the `#serverVersion` copy in `index.html` (floating; minimize persists via `localStorage`). Always label **Java Edition**.
- Server IP: `#join` banner in `index.html` and README **Play with us** — currently `afykirby.aternos.me` (Aternos free host, Java Edition only — not Bedrock). If the world is offline, players should message the host to start it (free-plan idle shutdown). Update site + README together.
- Recommended modpack: `#modpack` banner + hero “Get Modpack” → [Fabulously Optimized](https://modrinth.com/modpack/fabulously-optimized). Note in the banner + README that the pack is most likely still on current stable Java Edition (currently **26.2**), not the snapshot world. Update that number when stable bumps.
- **Games button:** `.games-btn` in the top bar, **outside** `.nav-links` (nav hides under 700px; Games must still show). Points at `games/index.html`.
- Windows-compatible paths
- Do not add a bundler, framework, or backend without being asked
- User-facing copy on the **landing** stays in the site's existing voice
- Visual language: Minecraft wiki light panels + classic dirt/stone/wood framing (pixel-tiled cobble + oak rails); keep the game-landing hero. Lab catalog may reuse that chrome. The 2D play page may go dark for the canvas.

## Tests (required) — script only, never browser

**Do not run browser tests.** No Cursor browser MCP, no Playwright, no Puppeteer, no screenshots-as-proof, no clicking through the canvas, no `localhost` playthrough as verification. This beats the generic “verify UI in the browser” user rule **in this repo**.

Verification is a **double-layer Node suite**. No package manager. No test HTML page.

```
node tests/run.js
```

| Layer | File | Job |
|-------|------|-----|
| 1 | `tests/meta.test.js` | Tests **the harness** and that layer 2 exists / names the required cases. If this fails, layer 2 is not trusted (`exit 2`). |
| 2 | `tests/hc2d.test.js` | Tests **game core** (`hc2d-core.js`): prices, buy/sell/consume, gen, tiles. |
| runner | `tests/run.js` + `tests/harness.js` | Runs 1 then 2. Vanilla `node`. |

Do not add a browser spec. Visual QA is the human’s problem. Agents stop after `node tests/run.js` is green.

## After every change (required)

Before you stop or push, run this pass:

1. **`node tests/run.js`** — both layers green. Never substitute a browser session.
2. **Paths still resolve** — `index.html`, `games/`, `games/high-craft-2d-v1/` (script order: `hc2d-core.js` then `game.js`)
3. **AGENTS.md** — update if stack, structure, or conventions changed
4. **README.md** — refresh when the public story of the repo changed. Do **not** pitch High Craft 2D as a real game.
5. **Commit message** — Conventional Commits: `feat|fix|docs|refactor|chore|test(scope): …`

Do this on basically every meaningful edit — not only when the user says “update docs.”

## Docs

`DOCS/` exists. Follow the preservation header. Never delete existing content. Append, amend, or annotate only.

| File | Role |
|------|------|
| `DOCS/GDD_HIGH_CRAFT_2D.md` | Internal GDD for High Craft 2D |
| `DOCS/SUMMARY.md` | Short map of public vs lab |
| `DOCS/SCRATCHPAD.md` | Active tasks |

If GDD and V1 code disagree: GDD wins on **intent**; code wins on **what shipped**. Then align them.
