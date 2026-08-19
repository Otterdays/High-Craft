# HighCraft W/ The Boys

Community site for **HighCraft** — a long-term Minecraft survival world, series, and home for [Otters MC Studios](https://github.com/Otterdays/Minecraft-Stuffs) projects.

One shared world. Towns, kingdoms, bosses, stupid infrastructure, and a history nobody else could have made.

**Live site:** [https://otterdays.github.io/High-Craft/](https://otterdays.github.io/High-Craft/)

## Run locally

Open `index.html` in a browser, or serve the folder:

```powershell
npx --yes serve .
```

No build step. No backend. Pure static HTML/CSS/JS.

## Edit the project hub

The studio project cards live in the `projects` array near the bottom of `index.html`.

1. Copy an existing object.
2. Change name, description, tags, and GitHub URL.
3. Set `category` to `server`, `mod`, `tool`, or `game`.
4. Set `highcraft: true` to show it under HighCraft Picks.

## GitHub Pages

This repo is set up as a static GitHub Pages site from the `main` branch root (`index.html`). After the first push, if the live URL 404s, turn Pages on under **Settings → Pages → Deploy from a branch → `main` / `/ (root)`**.
