# HighCraft W/ The Boys

<p align="center">
  <img src="assets/images/promo-1.png" alt="HighCraft — friends around the campfire under the HighCraft crest" width="920" />
</p>

<p align="center">
  <strong>One Minecraft world. A bunch of friends. No speedrunning.</strong><br />
  Towns · kingdoms · bosses · stupid infrastructure · a history only this crew could make.
</p>

<p align="center">
  <a href="https://otterdays.github.io/High-Craft/"><img src="https://img.shields.io/badge/Live_site-GitHub_Pages-3c8527?style=for-the-badge&logo=github" alt="Live site" /></a>
  <a href="https://github.com/Otterdays/Minecraft-Stuffs"><img src="https://img.shields.io/badge/Otters_MC_Studios-Project_hub-8b5a2b?style=for-the-badge" alt="Otters MC Studios" /></a>
</p>

**Live:** [otterdays.github.io/High-Craft](https://otterdays.github.io/High-Craft/)

---

## What this is

HighCraft is a long-term survival series and community world — plus the public landing page for [Otters MC Studios](https://github.com/Otterdays/Minecraft-Stuffs) mods, tools, and experiments that grow up around it.

The site leans **Minecraft Wiki** structure (light content panels, clear sections) with **classic Minecraft** framing (dirt header, stone + wood side rails, beveled buttons) and a full-bleed game-landing hero.

## The Boys (so far)

| Player | Gamertag |
|--------|----------|
| Ryan | Darksora269 |
| Nick D | Porta Jawn Shidda |

More slots on the site stay open until the rest of the crew is named.

## Repo layout

```
High-Craft/
├── index.html          # entire site (HTML + CSS + JS)
├── assets/images/      # promo art + sample shots
├── AGENTS.md           # rules for AI / contributors
└── README.md           # you are here
```

## Run locally

Open `index.html` in a browser, or:

```powershell
npx --yes serve .
```

No install. No build. No backend.

## Edit without breaking the vibe

**Studio project cards** — `projects` array near the bottom of `index.html`

1. Copy an object  
2. Set name, description, tags, GitHub URL  
3. `category`: `server` | `mod` | `tool` | `game`  
4. `highcraft: true` → shows under HighCraft Picks  

**Crew roster** — `#players` grid in `index.html` (display name + gamertag)

**Imagery** — drop files in `assets/images/` and point the hero / gallery / season blocks at them

## GitHub Pages

Deployed from **`main`** → **`/` (root)**.  
If the live URL 404s: **Settings → Pages → Deploy from a branch → `main` / root**.

---

Built by the boys. Probably destroyed by the boys.
