<!-- PRESERVATION RULE: Never delete or replace content. Append or annotate only. -->

# High Craft 2D — Game Design Document (INTERNAL)

| Field | Value |
|-------|--------|
| Status | **Internal lab only.** Not a product. Not a release. Not for players. |
| Codename | High Craft 2D |
| Shipped sketch | **V1** — `games/high-craft-2d-v1/` |
| Genre | 2D side-on sandbox (Terraria camera + Minecraft grid) + cartoon street economy |
| Platform | Static HTML / CSS / JS on GitHub Pages. No backend. No build. |
| Audience | Otters MC Studios / HighCraft crew. Nobody is expected to actually play this. |
| Content | 18+ parody. Fictional plants, fictional cash, fictional NPCs. |
| Last updated | 2026-08-27 |

If this doc and the V1 prototype drift, **this file wins on intent**; the prototype wins on what is literally coded.

---

## 0. Why this exists

HighCraft the Minecraft series is already the joke (the name, the boys, the world). A 2D clone that only paints nuggets on dirt is a reskin. The interesting toy is a **cartoon corner sim glued to a dig-and-build body**.

V1 is a **sketch of verbs**, not a game people grind. Build the loop so it is visible in five minutes: dig product, sell it, buy it, smoke the margins, build a hole that looks like a trap shack. Then stop.

---

## 1. One-liner

You carve a 2D hillside, pull product out of the dirt, run a stash, buy from a plug, sell to a regular, and can consume your own supply as a stupid potion.

---

## 2. What it is / is not

**Is**

- Terraria-shaped movement: gravity, jump, fall, a world taller than the screen.
- Minecraft-shaped blocks: grid tiles, mine, place, hotbar counts.
- GTA-lite *fantasy* of a corner: product, cash, a supplier, a customer, self-use.
- A browser toy in this repo so it costs $0 on Pages.

**Is not**

- A real game with retention, balance, or a playerbase.
- A grow op simulator, a chemistry lesson, or a street-crime manual.
- Multiplayer, cops, heat, quality tiers, or crafting (not in V1).
- Part of the public HighCraft landing pitch. The homepage stays the Minecraft series.

---

## 3. Design reflection (read this first)

### 3.1 The reskin trap

If nug tiles are just gold ore with a funny name, the theme is wallpaper. Wallpaper dies in an hour even when nobody planned to play. The theme has to **change the decision** on every unit of product:

> Eat it, sell it, or stash it.

Cash exists so the plug can overcharge you. The regular exists so digging beats shopping. Consumption exists so you can light your profit on fire for a jump boost. That triangle *is* the game.

### 3.2 Steal loops, not textbooks

| Real-world thing (do not simulate) | Game verb we actually ship |
|------------------------------------|----------------------------|
| Cultivation, yields, cuts | Dig a nug tile. That is the whole “grow.” |
| Street prices, weights, cuts | Integer **Green** and integer item counts. Fake numbers. |
| Dealing tradecraft | Walk to an NPC. Press Interact. Instant trade. |
| Getting high | Status effect: haze overlay, sway, jump buff, short timer. Same as a Minecraft potion / Terraria flask. |
| A trap house | Wood box you place. Flavor. No tenant sim. |

If a sentence would help someone do crime in meatspace, it does not belong here. If a sentence is “villager trading but the villager is named The Plug,” it belongs here.

### 3.3 Internal-only consequences

- No hero CTA. No “Play now” on the HighCraft landing.
- `games/` is an **internal lab index**, labeled as such.
- Copy can be crude. Systems stay cartoon.
- Do not spend weeks on feel. V1 is done when the five verbs work: **move, mine, buy, sell, consume**.
- localStorage save is enough. Nobody is coming back for a season pass.

### 3.4 Tone

Same crew energy as the Minecraft world: dumb, loyal, slightly feral. The dealing layer is **sitcom crime**, not prestige-drug cinema. Names are joke-myth (nugs, resin, haze, Green, The Plug, The Regular). No brands, no real strain porn, no “how we run a corner” documentation.

---

## 4. Pillars

1. **Hole in the hill** — vertical dirt is the map. Your shack is a wound in the terrain.
2. **Product is a decision** — every nug is eat / sell / stash.
3. **Bad deals on purpose** — the plug is a ripoff; the regular lowballs; mining is how you win.
4. **Haze is a potion** — consume is a self-debuff with a funny upside, not a sim.
5. **Snack-sized** — one seed, one world, one browser tab. Quit whenever.

---

## 5. Player fantasy

You are not a botanist and you are not a kingpin. You are a **hillside stash-runner** who treats the earth like a vending machine and the surface like a stoop.

Win condition for V1: there is none. You mess around, you make Green, you eat a nug and bounce off a cliff. That is the whole review.

---

## 6. Core loop (V1)

```
spawn with a little Green
    → dig grass/dirt/stone, pop nugs + resin
    → (optional) consume a nug → haze potion
    → walk to The Regular → sell product for Green
    → walk to The Plug → buy product if you are empty/lazy (bad rate)
    → place wood/dirt into a shack around a stash
    → repeat until you close the tab
```

**Loop coupling (this is the design):**

- Mining prints product (good).
- Selling converts product → Green (good, but Regular pays less than Plug charges).
- Buying converts Green → product (bad rate; panic button).
- Consuming destroys product for a short buff (strictly worse for the wallet, fun for the cliff).

If those four rates ever get “fair,” the joke dies. Keep the plug greedy and the regular cheap.

---

## 7. Verbs

| Verb | Input (V1) | Result |
|------|------------|--------|
| Move | A/D or arrows | Walk |
| Jump | Space / W | Jump if grounded |
| Mine | Hold LMB on a tile in reach | Tile HP → air, item into pack |
| Place | RMB | Spend 1 of selected tile, if air and not inside player |
| Select | 1–7, scroll, click slot | Hotbar |
| Buy | E near The Plug | Spend Green, gain selected buy item |
| Sell | E near The Regular | Lose 1 selected product, gain Green |
| Consume | C (or on-screen Use) | Lose 1 nug, start/refresh haze |
| Interact prompt | Auto when close | HUD says what E will do |

No crafting grid. No inventory screen beyond hotbar + Green + haze meter.

---

## 8. Materials (fiction)

Ids are engine truth. Names are UI.

| Id | Name | Role |
|----|------|------|
| 0 | Air | Empty |
| 1 | Grass | Surface skin |
| 2 | Dirt | Cheap fill |
| 3 | Stone | Slow mine, caves |
| 4 | Nug | **Product.** Dig, sell, consume. |
| 5 | Resin | **Product.** Dig, sell. Not consumed in V1. |
| 6 | Wood | Shack building |
| 7 | Leaf | Tree fluff, placeable |
| 8 | Stash | Placeable crate. Flavor in V1 (no extra inventory). Marks “this is the trap.” |

**Not in V1:** seeds, growbeds, drying, bags, weapons, armor.

World gen plants nugs near surface and in shallow dirt, resin in deeper stone. Trees = wood + leaf. That is the whole “supply chain.”

---

## 9. Economy (game tokens only)

Currency name: **Green**. Integer. Never dollars, grams, or real weights.

V1 rates (tune in code if it feels dead; keep the *shape*):

| Action | Rate |
|--------|------|
| Start Green | 40 |
| Regular buys 1 Nug | +12 Green |
| Regular buys 1 Resin | +20 Green |
| Plug sells 1 Nug | −18 Green |
| Plug sells 1 Resin | −32 Green |
| Consume 1 Nug | −1 Nug, $0 |

Spread is the joke: **you cannot arbitrage the two NPCs.** Buy-from-Plug then sell-to-Regular is a loss. Digging is the only print.

No tax, no heat, no police. Green is a score you can waste.

---

## 10. NPCs (V1)

Two bodies. No dialogue trees.

**The Plug** — stands near spawn shack. Shop. Buys nothing. Sells nugs and resin at the ripoff table. Purple/dark sprite so they read as “shop.”

**The Regular** — wanders a short surface patrol. Buys whatever product you have selected (nug or resin). Orange/tan sprite so they read as “customer.” If you have no product selected, E does nothing useful; prompt says to pick a product.

Both are immortal, unkillable, un-rob-able. This is not an FPS.

Later (not V1, do not build): more customers, demand spikes, a snitch, a cop as a *status* not a shooter, named crew as extra plugs.

---

## 11. Consumption (haze)

Consumption is **Minecraft milk/potion**, not a portrayal of a real session.

On consume (need ≥1 Nug):

- Nug count −1
- Haze timer = ~8 seconds (refresh if already hazed)
- Visual: green vignette, slight camera sway, sky tint
- Gameplay: jump a bit higher, walk a bit slipperier, mine reach unchanged
- Cannot consume resin in V1 (keeps one obvious “use” button)

No addiction meter. No HP damage. No “pass out.” When the timer hits 0, you are sober. Boring on purpose.

---

## 12. Space & generation (V1)

- Width ~160 tiles, height ~72, tile 16px.
- Rolling hills, dirt crust, stone mass, worm caves.
- Surface trees.
- Spawn at world center on the grass.
- A tiny wood **stoop** (4–8 blocks) next to The Plug so the “trap” is readable without the player placing anything.
- Day/night optional polish; not required for the loop.

Camera: follow player, pixel scale ~3, no rotation except tiny haze sway.

---

## 13. Controls

| Device | Map |
|--------|-----|
| Keyboard | A/D move, Space/W jump, E interact, C consume, 1–7 hotbar, Esc pause |
| Mouse | LMB mine, RMB place, wheel hotbar |
| Touch | On-screen left/right/jump + Mine / Place / Use / Deal (Deal = E) |

Pause: New world, save is automatic.

Save key: `hc2d-v1` in localStorage (world bytes + player + inv + Green + seed). Nobody will care if we wipe the schema.

---

## 14. Presentation

- Pixel tiles drawn in canvas (no new art pipeline).
- Player: green hoodie, dumb face.
- HUD: hotbar, Green, haze bar, interact prompt, “INTERNAL LAB” chip.
- First screen: click to drop in. Text must say this is internal and not a real game.

Public HighCraft visual language (wiki panels, dirt header) on `games/index.html`. The play page can go darker so the canvas reads.

---

## 15. Scope fence

**V1 must**

- Walk, jump, collide
- Mine / place
- Procgen world
- Nug + resin in the ground
- Green + buy + sell
- Consume haze
- Two NPCs
- localStorage
- Keyboard + mouse; coarse touch extras

**V1 must not**

- Cops, guns, wanted stars
- Real strain names, real prices, real grow steps
- Multiplayer
- Lighting engine, bosses, biomes
- A tutorial that explains dealing as a practice

**Maybe later (parking lot only)**

- Kush Grove / Munchie Marsh biomes
- Growbed tick (still fictional: plant block → wait → nug block)
- Heat meter as a joke clock, not a crime sim
- More buyers with different spreads
- A boss named after a snack

Do not pull parking-lot items into V1 because “then it would be a real game.” It is not supposed to be.

---

## 16. Site & repo rules (agents)

- GDD lives at `DOCS/GDD_HIGH_CRAFT_2D.md`. Internal. Do not surface it as a consumer page.
- Catalog: `games/index.html`. Stamp **internal lab**.
- Prototype: `games/high-craft-2d-v1/` (`hc2d-core.js` + `game.js` + css/html).
- Verification: `node tests/run.js` only. **No browser tests.**
- Homepage: one **Games** control in the top bar. No dealing copy on `index.html`.
- Relative URLs only (`games/…`) so GitHub project Pages (`/High-Craft/`) does not 404.
- Still no bundler, no Actions, no backend.
- If you add systems, prefer the five verbs. Do not add a wiki on how corners work.

---

## 17. Open questions (do not block V1)

- Do we ever want a third NPC (The Snitch) as a Green sink?
- Should Stash tiles actually hold overflow items? (Nice; not needed.)
- Wipe save when the schema changes, or migrate? Wipe is fine.

---

## 18. Changelog

- **2026-08-27** — First GDD. Reframed from “weed Minecraft reskin” to cartoon buy / sell / consume loop. Marked internal-only. V1 = five verbs in a browser sketch.
- **2026-08-27** — [AMENDED] Agents must not browser-test. Economy/gen live in `hc2d-core.js`. Double-layer Node suite: tests-for-tests then core tests.
- **2026-08-27** — [AMENDED] Landing `projects` array ships a High Craft 2D **Play** card (HighCraft Pick). Hero still has no dealing copy.
