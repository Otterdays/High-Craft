(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.HC2D = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const TILE = 16;
  const COLS = 160;
  const ROWS = 72;
  const PW = 10;
  const PH = 22;
  const REACH = 52;
  const INTERACT = 52;
  const HAZE_SECS = 8;
  const START_GREEN = 40;

  const T = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    NUG: 4,
    RESIN: 5,
    WOOD: 6,
    LEAF: 7,
    STASH: 8
  };

  const NAMES = {
    1: "Grass",
    2: "Dirt",
    3: "Stone",
    4: "Nug",
    5: "Resin",
    6: "Wood",
    7: "Leaf",
    8: "Stash"
  };

  const HP = {
    1: 6,
    2: 8,
    3: 20,
    4: 10,
    5: 24,
    6: 12,
    7: 5,
    8: 14
  };

  const TINT = {
    1: "#4a8a28",
    2: "#8b5a2b",
    3: "#7a7a7a",
    4: "#6adf3a",
    5: "#d48a1a",
    6: "#6b3e1a",
    7: "#2f6a28",
    8: "#c4a15a"
  };

  const HOTBAR = [T.DIRT, T.STONE, T.NUG, T.RESIN, T.WOOD, T.LEAF, T.STASH];
  const PRODUCT = { 4: true, 5: true };

  const PRICE = {
    sellNug: 12,
    sellResin: 20,
    buyNug: 18,
    buyResin: 32
  };

  function emptyInv() {
    const o = Object.create(null);
    for (let i = 1; i <= 8; i += 1) o[i] = 0;
    return o;
  }

  function cloneInv(inv) {
    const o = emptyInv();
    for (let i = 1; i <= 8; i += 1) o[i] = (inv && inv[i]) || 0;
    return o;
  }

  function idx(x, y) {
    return y * COLS + x;
  }

  function inb(x, y) {
    return x >= 0 && y >= 0 && x < COLS && y < ROWS;
  }

  function getT(world, x, y) {
    if (!inb(x, y)) return T.STONE;
    return world[idx(x, y)];
  }

  function setT(world, x, y, t) {
    if (!inb(x, y)) return;
    world[idx(x, y)] = t;
  }

  function isProduct(type) {
    return type === T.NUG || type === T.RESIN;
  }

  function buySpreadOk() {
    return PRICE.buyNug > PRICE.sellNug && PRICE.buyResin > PRICE.sellResin;
  }

  function buy(green, inv, kind) {
    const cost = kind === "nug" ? PRICE.buyNug : PRICE.buyResin;
    const type = kind === "nug" ? T.NUG : T.RESIN;
    if (kind !== "nug" && kind !== "resin") {
      return { ok: false, green, inv: cloneInv(inv), reason: "bad-kind" };
    }
    if (green < cost) {
      return { ok: false, green, inv: cloneInv(inv), reason: "broke" };
    }
    const next = cloneInv(inv);
    next[type] += 1;
    return { ok: true, green: green - cost, inv: next, type, cost };
  }

  function sell(green, inv, type) {
    if (!isProduct(type) || ((inv && inv[type]) || 0) < 1) {
      return { ok: false, green, inv: cloneInv(inv), reason: "no-product" };
    }
    const next = cloneInv(inv);
    next[type] -= 1;
    const gain = type === T.NUG ? PRICE.sellNug : PRICE.sellResin;
    return { ok: true, green: green + gain, inv: next, gain, type };
  }

  function consume(inv, haze) {
    if (((inv && inv[T.NUG]) || 0) < 1) {
      return { ok: false, inv: cloneInv(inv), haze: haze || 0, reason: "no-nugs" };
    }
    const next = cloneInv(inv);
    next[T.NUG] -= 1;
    return { ok: true, inv: next, haze: HAZE_SECS };
  }

  function mulberry32(a) {
    return function rand() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function generate(newSeed) {
    const seed = newSeed >>> 0 || 1;
    const rnd = mulberry32(seed);
    const world = new Uint8Array(COLS * ROWS);
    const surface = new Int16Array(COLS);

    for (let x = 0; x < COLS; x += 1) {
      const h =
        26 +
        Math.sin(x * 0.07 + seed) * 8 +
        Math.sin(x * 0.19 + seed * 0.31) * 4 +
        (rnd() - 0.5) * 5;
      const sh = Math.max(12, Math.min(ROWS - 20, Math.floor(h)));
      surface[x] = sh;
      const dirtDepth = 4 + Math.floor(rnd() * 4);
      for (let y = 0; y < ROWS; y += 1) {
        let t = T.AIR;
        if (y > sh + dirtDepth) t = T.STONE;
        else if (y > sh) t = T.DIRT;
        else if (y === sh) t = T.GRASS;
        world[idx(x, y)] = t;
      }
    }

    for (let i = 0; i < 74; i += 1) {
      const x = 4 + Math.floor(rnd() * (COLS - 8));
      const bump = rnd() < 0.4 ? 0 : 1 + Math.floor(rnd() * 3);
      const y = surface[x] + (rnd() < 0.45 ? 0 : bump);
      const t = getT(world, x, y);
      if (t === T.GRASS || t === T.DIRT) setT(world, x, y, T.NUG);
    }

    for (let i = 0; i < 96; i += 1) {
      const x = 3 + Math.floor(rnd() * (COLS - 6));
      const y = 42 + Math.floor(rnd() * (ROWS - 46));
      if (getT(world, x, y) === T.STONE) setT(world, x, y, T.RESIN);
    }

    for (let i = 0; i < 50; i += 1) {
      let cx = 8 + rnd() * (COLS - 16);
      let cy = 38 + rnd() * 26;
      let life = 18 + rnd() * 34;
      while (life > 0) {
        life -= 1;
        const r = 1.5 + rnd() * 2.1;
        const x0 = Math.floor(cx - r);
        const x1 = Math.ceil(cx + r);
        const y0 = Math.floor(cy - r);
        const y1 = Math.ceil(cy + r);
        for (let y = y0; y <= y1; y += 1) {
          for (let x = x0; x <= x1; x += 1) {
            if (x < 1 || x >= COLS - 1 || y < 10 || y >= ROWS - 2) continue;
            const dx = x - cx;
            const dy = y - cy;
            if (dx * dx + dy * dy <= r * r) setT(world, x, y, T.AIR);
          }
        }
        cx += rnd() * 2 - 1;
        cy += rnd() * 2 - 1.05;
      }
    }

    for (let x = 6; x < COLS - 6; x += 6 + Math.floor(rnd() * 8)) {
      if (rnd() > 0.52) continue;
      const sy = surface[x];
      const ground = getT(world, x, sy);
      if (ground !== T.GRASS && ground !== T.NUG) continue;
      const ht = 4 + Math.floor(rnd() * 4);
      for (let i = 1; i <= ht; i += 1) {
        const y = sy - i;
        if (y < 1) break;
        setT(world, x, y, T.WOOD);
      }
      const top = sy - ht;
      for (let oy = -2; oy <= 1; oy += 1) {
        for (let ox = -2; ox <= 2; ox += 1) {
          if (Math.abs(ox) + Math.abs(oy) > 3) continue;
          const tx = x + ox;
          const ty = top + oy;
          if (getT(world, tx, ty) === T.AIR) setT(world, tx, ty, T.LEAF);
        }
      }
    }

    const sx = COLS >> 1;
    const sy = surface[sx];
    for (let ox = -4; ox <= -1; ox += 1) {
      setT(world, sx + ox, sy, T.WOOD);
    }
    setT(world, sx - 4, sy - 1, T.WOOD);
    setT(world, sx - 1, sy - 1, T.STASH);

    return { seed, world, surface };
  }

  function countType(world, type) {
    let n = 0;
    for (let i = 0; i < world.length; i += 1) {
      if (world[i] === type) n += 1;
    }
    return n;
  }

  function overlapsSolid(world, x, y, w, h) {
    const x0 = Math.floor(x / TILE);
    const x1 = Math.floor((x + w - 0.001) / TILE);
    const y0 = Math.floor(y / TILE);
    const y1 = Math.floor((y + h - 0.001) / TILE);
    for (let ty = y0; ty <= y1; ty += 1) {
      for (let tx = x0; tx <= x1; tx += 1) {
        if (getT(world, tx, ty) !== T.AIR) return true;
      }
    }
    return false;
  }

  function standY(world, px) {
    const tx = Math.max(0, Math.min(COLS - 1, Math.floor(px / TILE)));
    for (let y = 0; y < ROWS; y += 1) {
      if (getT(world, tx, y) !== T.AIR) return y * TILE - PH;
    }
    return (ROWS - 3) * TILE;
  }

  function distToNpc(px, py, nx, ny) {
    return Math.hypot(px - (nx + 5), py - (ny + 11));
  }

  function nearNpc(px, py, nx, ny) {
    return distToNpc(px, py, nx, ny) < INTERACT;
  }

  function inReachTile(px, py, tx, ty) {
    const cx = tx * TILE + TILE / 2;
    const cy = ty * TILE + TILE / 2;
    return Math.hypot(cx - px, cy - py) <= REACH;
  }

  function worldToStr(world) {
    let s = "";
    for (let i = 0; i < world.length; i += 1) {
      s += String.fromCharCode(48 + world[i]);
    }
    return s;
  }

  function strToWorld(s, dest) {
    if (!s || !dest || s.length !== dest.length) return false;
    for (let i = 0; i < s.length; i += 1) {
      dest[i] = s.charCodeAt(i) - 48;
    }
    return true;
  }

  function keyCode(ev) {
    if (ev && ev.code) return ev.code;
    const k = String((ev && ev.key) || "").toLowerCase();
    if (k === "a" || k === "arrowleft") return "KeyA";
    if (k === "d" || k === "arrowright") return "KeyD";
    if (k === "w" || k === "arrowup") return "KeyW";
    if (k === " ") return "Space";
    if (k === "e") return "KeyE";
    if (k === "c") return "KeyC";
    if (k === "escape") return "Escape";
    if (k >= "1" && k <= "7") return "Digit" + k;
    return "";
  }

  function breakInto(world, inv, tx, ty) {
    const t = getT(world, tx, ty);
    if (t === T.AIR) return { ok: false, inv: cloneInv(inv), type: T.AIR };
    setT(world, tx, ty, T.AIR);
    const next = cloneInv(inv);
    next[t] += 1;
    return { ok: true, inv: next, type: t };
  }

  return {
    TILE,
    COLS,
    ROWS,
    PW,
    PH,
    REACH,
    INTERACT,
    HAZE_SECS,
    START_GREEN,
    T,
    NAMES,
    HP,
    TINT,
    HOTBAR,
    PRODUCT,
    PRICE,
    emptyInv,
    cloneInv,
    idx,
    inb,
    getT,
    setT,
    isProduct,
    buySpreadOk,
    buy,
    sell,
    consume,
    generate,
    countType,
    overlapsSolid,
    standY,
    distToNpc,
    nearNpc,
    inReachTile,
    worldToStr,
    strToWorld,
    keyCode,
    breakInto
  };
});
