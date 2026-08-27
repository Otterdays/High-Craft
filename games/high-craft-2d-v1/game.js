(() => {
  "use strict";

  const C = globalThis.HC2D;
  if (!C) throw new Error("hc2d-core.js must load before game.js");

  const TILE = C.TILE;
  const COLS = C.COLS;
  const ROWS = C.ROWS;
  const PW = C.PW;
  const PH = C.PH;
  const REACH = C.REACH;
  const SAVE_KEY = "hc2d-v1";
  const GRAVITY = 0.42;
  const MOVE = 0.92;
  const JUMP = -7.35;
  const HAZE_JUMP = -8.7;
  const MAX_FALL = 11;
  const HAZE_SECS = C.HAZE_SECS;
  const T = C.T;
  const NAMES = C.NAMES;
  const HP = C.HP;
  const TINT = C.TINT;
  const HOTBAR = C.HOTBAR;

  const canvas = document.getElementById("view");
  const ctx = canvas.getContext("2d");
  const cashEl = document.getElementById("cash");
  const statusEl = document.getElementById("status");
  const promptEl = document.getElementById("prompt");
  const hotbarEl = document.getElementById("hotbar");
  const hazeFill = document.getElementById("hazeFill");
  const startEl = document.getElementById("start");
  const shopEl = document.getElementById("shop");
  const pauseEl = document.getElementById("pause");
  const touchEl = document.getElementById("touch");

  const keys = Object.create(null);
  const hold = { left: false, right: false, jump: false, mine: false };

  let world = new Uint8Array(COLS * ROWS);
  let surface = new Int16Array(COLS);
  let seed = 1;
  let running = false;
  let paused = false;
  let lastTs = 0;
  let cam = { x: 0, y: 0 };
  let sel = 2;
  let green = C.START_GREEN;
  let haze = 0;
  let face = 1;
  let mineTarget = null;
  let mineDmg = 0;
  let pointer = { x: 0, y: 0, down: false, right: false };
  let floaters = [];
  let particles = [];
  let inv = emptyInv();

  const player = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    grounded: false
  };

  const plug = { x: 0, y: 0, kind: "plug" };
  const regular = { x: 0, y: 0, kind: "buyer", dir: 1, minX: 0, maxX: 0 };

  function emptyInv() {
    return C.emptyInv();
  }

  function idx(x, y) {
    return C.idx(x, y);
  }

  function inb(x, y) {
    return C.inb(x, y);
  }

  function getT(x, y) {
    return C.getT(world, x, y);
  }

  function setT(x, y, t) {
    C.setT(world, x, y, t);
  }

  function generate(newSeed) {
    const g = C.generate(newSeed);
    seed = g.seed;
    world = g.world;
    surface = g.surface;
  }

  function standY(px) {
    return C.standY(world, px);
  }

  function spawnActors() {
    const sx = COLS >> 1;
    plug.x = (sx - 4) * TILE + 3;
    plug.y = standY(plug.x);
    player.x = (sx - 2) * TILE + (TILE - PW) / 2;
    player.y = standY(player.x) - 2;
    player.vx = 0;
    player.vy = 0;
    regular.x = (sx + 3) * TILE;
    regular.y = standY(regular.x);
    regular.minX = (sx + 1) * TILE;
    regular.maxX = (sx + 18) * TILE;
    regular.dir = 1;
  }

  function overlapsSolid(x, y, w, h) {
    return C.overlapsSolid(world, x, y, w, h);
  }

  function moveBox(ent, dx, dy, w, h) {
    if (dx !== 0) {
      ent.x += dx;
      if (overlapsSolid(ent.x, ent.y, w, h)) {
        if (dx > 0) ent.x = Math.floor((ent.x + w) / TILE) * TILE - w;
        else ent.x = Math.floor(ent.x / TILE + 1) * TILE;
        ent.vx = 0;
      }
    }
    if (dy !== 0) {
      ent.y += dy;
      if (overlapsSolid(ent.x, ent.y, w, h)) {
        if (dy > 0) {
          ent.y = Math.floor((ent.y + h) / TILE) * TILE - h;
          ent.grounded = true;
        } else {
          ent.y = Math.floor(ent.y / TILE + 1) * TILE;
        }
        ent.vy = 0;
      }
    }
  }

  function onGround(ent) {
    return overlapsSolid(ent.x + 0.2, ent.y + PH, PW - 0.4, 1.2);
  }

  function playerCenter() {
    return { x: player.x + PW / 2, y: player.y + PH / 2 };
  }

  function distTo(nx, ny) {
    const p = playerCenter();
    return C.distToNpc(p.x, p.y, nx, ny);
  }

  function nearPlug() {
    return C.nearNpc(playerCenter().x, playerCenter().y, plug.x, plug.y);
  }

  function nearRegular() {
    return C.nearNpc(playerCenter().x, playerCenter().y, regular.x, regular.y);
  }

  function inReachTile(tx, ty) {
    const p = playerCenter();
    return C.inReachTile(p.x, p.y, tx, ty);
  }

  function canvasToWorld(cx, cy) {
    const r = canvas.getBoundingClientRect();
    const x = ((cx - r.left) / r.width) * canvas.width + cam.x;
    const y = ((cy - r.top) / r.height) * canvas.height + cam.y;
    return { x, y };
  }

  function burst(x, y, color, n) {
    for (let i = 0; i < n; i += 1) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2.4,
        vy: -Math.random() * 2.2,
        life: 18 + Math.random() * 10,
        color
      });
    }
  }

  function floatText(x, y, text, color) {
    floaters.push({ x, y, text, color, life: 50 });
  }

  function breakTile(tx, ty) {
    const t = getT(tx, ty);
    if (t === T.AIR) return;
    setT(tx, ty, T.AIR);
    inv[t] = (inv[t] || 0) + 1;
    burst(tx * TILE + 8, ty * TILE + 8, TINT[t] || "#fff", 7);
    renderHotbar();
    paintHud();
  }

  function placeTile(tx, ty) {
    const type = HOTBAR[sel];
    if (getT(tx, ty) !== T.AIR) return;
    if (!inReachTile(tx, ty)) return;
    if ((inv[type] || 0) < 1) return;
    const px = tx * TILE;
    const py = ty * TILE;
    const hitsPlayer =
      px < player.x + PW &&
      px + TILE > player.x &&
      py < player.y + PH &&
      py + TILE > player.y;
    if (hitsPlayer) return;
    inv[type] -= 1;
    setT(tx, ty, type);
    renderHotbar();
    paintHud();
  }

  function consume() {
    const r = C.consume(inv, haze);
    if (!r.ok) {
      floatText(player.x, player.y - 8, "no nugs", "#faa");
      return;
    }
    inv = r.inv;
    haze = r.haze;
    floatText(player.x, player.y - 10, "haze", "#9f6");
    renderHotbar();
    paintHud();
  }

  function sellOne() {
    const type = HOTBAR[sel];
    const r = C.sell(green, inv, type);
    if (!r.ok) {
      floatText(player.x, player.y - 8, "select product", "#faa");
      return;
    }
    inv = r.inv;
    green = r.green;
    floatText(regular.x, regular.y - 12, "+" + r.gain + " Green", "#7dffa0");
    renderHotbar();
    paintHud();
  }

  function buy(kind) {
    const r = C.buy(green, inv, kind);
    if (!r.ok) {
      floatText(plug.x, plug.y - 12, "broke", "#faa");
      return;
    }
    green = r.green;
    inv = r.inv;
    floatText(plug.x, plug.y - 12, NAMES[r.type] + " (rip)", "#f6c");
    renderHotbar();
    paintHud();
  }

  function interact() {
    if (nearPlug()) {
      shopEl.hidden = false;
      return;
    }
    if (nearRegular()) {
      sellOne();
    }
  }

  function paintHud() {
    cashEl.textContent = "Green: " + green;
    const nugs = inv[T.NUG] || 0;
    const resin = inv[T.RESIN] || 0;
    statusEl.textContent =
      "Nugs " + nugs + " · Resin " + resin + (haze > 0 ? " · HAZED" : "");
    const pct = Math.max(0, Math.min(100, (haze / HAZE_SECS) * 100));
    hazeFill.style.height = pct + "%";
  }

  function renderHotbar() {
    hotbarEl.innerHTML = HOTBAR.map((type, i) => {
      const n = inv[type] || 0;
      const on = i === sel ? " on" : "";
      return (
        '<button type="button" class="slot' +
        on +
        '" data-i="' +
        i +
        '" title="' +
        NAMES[type] +
        '">' +
        '<span class="swatch" style="background:' +
        TINT[type] +
        '"></span>' +
        '<span class="n">' +
        n +
        "</span></button>"
      );
    }).join("");
  }

  function drawTile(dx, dy, type) {
    if (type === T.AIR) return;
    const x = Math.floor(dx);
    const y = Math.floor(dy);
    if (type === T.GRASS) {
      ctx.fillStyle = "#6b4420";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "#3d8c32";
      ctx.fillRect(x, y, TILE, 5);
      ctx.fillStyle = "#2f6a24";
      ctx.fillRect(x, y + 5, TILE, 1);
      return;
    }
    if (type === T.DIRT) {
      ctx.fillStyle = "#7a4e22";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "#5c3818";
      ctx.fillRect(x + 3, y + 6, 3, 3);
      ctx.fillRect(x + 10, y + 11, 2, 2);
      return;
    }
    if (type === T.STONE) {
      ctx.fillStyle = "#6e6e6e";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "#8a8a8a";
      ctx.fillRect(x + 1, y + 1, 6, 4);
      ctx.fillStyle = "#555";
      ctx.fillRect(x + 9, y + 8, 5, 5);
      return;
    }
    if (type === T.NUG) {
      ctx.fillStyle = "#4a8a28";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "#8dff4a";
      ctx.fillRect(x + 3, y + 3, 10, 10);
      ctx.fillStyle = "#5a2a6a";
      ctx.fillRect(x + 5, y + 6, 2, 2);
      ctx.fillRect(x + 9, y + 9, 2, 2);
      return;
    }
    if (type === T.RESIN) {
      ctx.fillStyle = "#5a5a5a";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "#e09a22";
      ctx.fillRect(x + 4, y + 4, 8, 8);
      ctx.fillStyle = "#f6d56a";
      ctx.fillRect(x + 6, y + 6, 3, 3);
      return;
    }
    if (type === T.WOOD) {
      ctx.fillStyle = "#6b3e18";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "#4a280e";
      ctx.fillRect(x, y + 4, TILE, 1);
      ctx.fillRect(x, y + 10, TILE, 1);
      return;
    }
    if (type === T.LEAF) {
      ctx.fillStyle = "#245a22";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "#3d8c32";
      ctx.fillRect(x + 2, y + 2, 4, 4);
      return;
    }
    if (type === T.STASH) {
      ctx.fillStyle = "#c4a15a";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.strokeStyle = "#5c3a12";
      ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 2);
      ctx.lineTo(x + 14, y + 14);
      ctx.moveTo(x + 14, y + 2);
      ctx.lineTo(x + 2, y + 14);
      ctx.stroke();
    }
  }

  function drawGuy(x, y, palette, facing) {
    const gx = Math.floor(x);
    const gy = Math.floor(y);
    ctx.fillStyle = palette.pants;
    ctx.fillRect(gx + 1, gy + 14, 8, 8);
    ctx.fillStyle = palette.shirt;
    ctx.fillRect(gx, gy + 6, 10, 10);
    ctx.fillStyle = palette.skin;
    ctx.fillRect(gx + 2, gy, 6, 6);
    ctx.fillStyle = "#1a1a1a";
    const eye = facing >= 0 ? gx + 6 : gx + 2;
    ctx.fillRect(eye, gy + 2, 2, 2);
    ctx.fillStyle = palette.hat;
    ctx.fillRect(gx + 1, gy - 2, 8, 3);
  }

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (haze > 0) {
      g.addColorStop(0, "#4a6a38");
      g.addColorStop(1, "#8ab85a");
    } else {
      g.addColorStop(0, "#6ec4ff");
      g.addColorStop(1, "#d8f0ff");
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawWorld() {
    const x0 = Math.max(0, Math.floor(cam.x / TILE));
    const y0 = Math.max(0, Math.floor(cam.y / TILE));
    const x1 = Math.min(COLS, Math.ceil((cam.x + canvas.width) / TILE) + 1);
    const y1 = Math.min(ROWS, Math.ceil((cam.y + canvas.height) / TILE) + 1);
    for (let ty = y0; ty < y1; ty += 1) {
      for (let tx = x0; tx < x1; tx += 1) {
        const t = getT(tx, ty);
        if (t === T.AIR) continue;
        const depth = Math.max(0, ty - surface[tx]);
        drawTile(tx * TILE - cam.x, ty * TILE - cam.y, t);
        if (depth > 4 && t !== T.NUG && t !== T.RESIN) {
          ctx.fillStyle = "rgba(0,0,0," + Math.min(0.45, depth * 0.035) + ")";
          ctx.fillRect(
            Math.floor(tx * TILE - cam.x),
            Math.floor(ty * TILE - cam.y),
            TILE,
            TILE
          );
        }
      }
    }
  }

  function drawCursor() {
    const tx = Math.floor(pointer.x / TILE);
    const ty = Math.floor(pointer.y / TILE);
    if (!inb(tx, ty) || !inReachTile(tx, ty)) return;
    const dx = Math.floor(tx * TILE - cam.x);
    const dy = Math.floor(ty * TILE - cam.y);
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.strokeRect(dx + 0.5, dy + 0.5, TILE - 1, TILE - 1);
    if (mineTarget && mineTarget.tx === tx && mineTarget.ty === ty) {
      const maxHp = HP[getT(tx, ty)] || 10;
      const p = Math.min(1, mineDmg / maxHp);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(dx, dy + TILE - TILE * p, TILE, TILE * p);
    }
  }

  function draw() {
    ctx.imageSmoothingEnabled = false;
    drawSky();
    const sway = haze > 0 ? Math.sin(performance.now() / 180) * 1.4 : 0;
    ctx.save();
    ctx.translate(sway, 0);
    drawWorld();
    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - cam.x, p.y - cam.y, 2, 2);
    }
    drawGuy(plug.x - cam.x, plug.y - cam.y, {
      shirt: "#4a2060",
      pants: "#2a1028",
      skin: "#e0b090",
      hat: "#2a0a30"
    }, 1);
    drawGuy(regular.x - cam.x, regular.y - cam.y, {
      shirt: "#c45c12",
      pants: "#4a3728",
      skin: "#e8c4a0",
      hat: "#e07020"
    }, regular.dir);
    drawGuy(player.x - cam.x, player.y - cam.y, {
      shirt: "#3c8527",
      pants: "#4a3728",
      skin: "#e8c4a0",
      hat: "#2f6a24"
    }, face);
    drawCursor();
    for (let i = 0; i < floaters.length; i += 1) {
      const f = floaters[i];
      ctx.fillStyle = f.color;
      ctx.font = "7px sans-serif";
      ctx.fillText(f.text, f.x - cam.x, f.y - cam.y);
    }
    ctx.restore();
    if (haze > 0) {
      ctx.fillStyle = "rgba(40, 90, 20, 0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function stepPhysics(step) {
    const left = keys.KeyA || keys.ArrowLeft || hold.left;
    const right = keys.KeyD || keys.ArrowRight || hold.right;
    const jump = keys.Space || keys.KeyW || keys.ArrowUp || hold.jump;
    const accel = haze > 0 ? MOVE * 0.85 : MOVE;
    if (left) {
      player.vx -= accel * step;
      face = -1;
    }
    if (right) {
      player.vx += accel * step;
      face = 1;
    }
    player.vx *= player.grounded ? 0.72 : 0.86;
    if (Math.abs(player.vx) < 0.02) player.vx = 0;
    player.vx = Math.max(-2.4, Math.min(2.4, player.vx));
    player.grounded = onGround(player);
    if (jump && player.grounded) {
      player.vy = haze > 0 ? HAZE_JUMP : JUMP;
      player.grounded = false;
    }
    player.vy = Math.min(MAX_FALL, player.vy + GRAVITY * step);
    moveBox(player, player.vx * step, 0, PW, PH);
    moveBox(player, 0, player.vy * step, PW, PH);
    player.grounded = onGround(player);

    regular.x += regular.dir * 0.32 * step;
    if (regular.x < regular.minX || regular.x > regular.maxX) {
      regular.dir *= -1;
    }
    regular.y = standY(regular.x);
    plug.y = standY(plug.x);

    if (player.y > ROWS * TILE + 40) {
      player.x = (COLS >> 1) * TILE;
      player.y = standY(player.x) - 4;
      player.vy = 0;
    }
  }

  function stepMine(step) {
    const mining = pointer.down || hold.mine;
    const tx = Math.floor(pointer.x / TILE);
    const ty = Math.floor(pointer.y / TILE);
    if (!mining) {
      mineTarget = null;
      mineDmg = 0;
      return;
    }
    if (!inb(tx, ty) || !inReachTile(tx, ty) || getT(tx, ty) === T.AIR) {
      mineTarget = null;
      mineDmg = 0;
      return;
    }
    if (!mineTarget || mineTarget.tx !== tx || mineTarget.ty !== ty) {
      mineTarget = { tx, ty };
      mineDmg = 0;
    }
    mineDmg += 9 * step;
    const need = HP[getT(tx, ty)] || 10;
    if (mineDmg >= need) {
      breakTile(tx, ty);
      mineDmg = 0;
    }
  }

  function stepFx(step) {
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.x += p.vx * step;
      p.y += p.vy * step;
      p.vy += 0.12 * step;
      p.life -= step;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = floaters.length - 1; i >= 0; i -= 1) {
      const f = floaters[i];
      f.y -= 0.35 * step;
      f.life -= step;
      if (f.life <= 0) floaters.splice(i, 1);
    }
  }

  function updatePrompt() {
    if (nearPlug()) {
      promptEl.hidden = false;
      promptEl.textContent = "E — buy from The Plug (rip-off)";
      return;
    }
    if (nearRegular()) {
      promptEl.hidden = false;
      promptEl.textContent = "E — sell selected product to The Regular";
      return;
    }
    promptEl.hidden = true;
  }

  function resize() {
    const stage = canvas.parentElement;
    const scale = 3;
    const w = Math.max(320, Math.floor(stage.clientWidth / scale));
    const h = Math.max(180, Math.floor(stage.clientHeight / scale));
    canvas.width = w;
    canvas.height = h;
  }

  function followCam() {
    cam.x = player.x + PW / 2 - canvas.width / 2;
    cam.y = player.y + PH / 2 - canvas.height / 2;
    const maxX = COLS * TILE - canvas.width;
    const maxY = ROWS * TILE - canvas.height;
    cam.x = Math.max(0, Math.min(maxX, cam.x));
    cam.y = Math.max(0, Math.min(maxY, cam.y));
  }

  function tick(ts) {
    requestAnimationFrame(tick);
    if (!lastTs) lastTs = ts;
    const dt = Math.min(50, ts - lastTs);
    lastTs = ts;
    const step = dt / 16.67;
    if (running && !paused && shopEl.hidden) {
      stepPhysics(step);
      stepMine(step);
      stepFx(dt / 16.67);
      haze = Math.max(0, haze - dt / 1000);
      followCam();
      updatePrompt();
      paintHud();
    }
    draw();
  }

  function worldToStr() {
    return C.worldToStr(world);
  }

  function strToWorld(s) {
    return C.strToWorld(s, world);
  }

  function save() {
    try {
      const data = {
        seed,
        world: worldToStr(),
        player: { x: player.x, y: player.y },
        inv,
        green,
        sel,
        haze
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (err) {
      /* private mode */
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      generate(data.seed || 1);
      if (!strToWorld(data.world)) return false;
      player.x = data.player.x;
      player.y = data.player.y;
      inv = Object.assign(emptyInv(), data.inv);
      green = data.green | 0;
      sel = data.sel | 0;
      haze = data.haze || 0;
      plug.x = ((COLS >> 1) - 4) * TILE + 3;
      plug.y = standY(plug.x);
      regular.x = ((COLS >> 1) + 3) * TILE;
      regular.y = standY(regular.x);
      regular.minX = ((COLS >> 1) + 1) * TILE;
      regular.maxX = ((COLS >> 1) + 18) * TILE;
      return true;
    } catch (err) {
      return false;
    }
  }

  function newWorld() {
    generate((Math.random() * 0xffffffff) >>> 0);
    inv = emptyInv();
    green = C.START_GREEN;
    haze = 0;
    sel = 2;
    spawnActors();
    renderHotbar();
    paintHud();
    save();
  }

  function bootWorld() {
    if (!load()) newWorld();
    else {
      renderHotbar();
      paintHud();
    }
  }

  function onPointer(ev) {
    const w = canvasToWorld(ev.clientX, ev.clientY);
    pointer.x = w.x;
    pointer.y = w.y;
  }

  canvas.addEventListener("contextmenu", (ev) => ev.preventDefault());
  canvas.addEventListener("pointerdown", (ev) => {
    onPointer(ev);
    canvas.setPointerCapture(ev.pointerId);
    if (ev.button === 2) {
      pointer.right = true;
      const tx = Math.floor(pointer.x / TILE);
      const ty = Math.floor(pointer.y / TILE);
      placeTile(tx, ty);
    } else if (ev.button === 0 || ev.pointerType === "touch") {
      pointer.down = true;
    }
  });
  canvas.addEventListener("pointermove", onPointer);
  canvas.addEventListener("pointerup", (ev) => {
    pointer.down = false;
    pointer.right = false;
    try {
      canvas.releasePointerCapture(ev.pointerId);
    } catch (err) {
      /* ignore */
    }
  });
  canvas.addEventListener(
    "wheel",
    (ev) => {
      ev.preventDefault();
      sel = (sel + (ev.deltaY > 0 ? 1 : -1) + HOTBAR.length) % HOTBAR.length;
      renderHotbar();
    },
    { passive: false }
  );

  window.addEventListener("keydown", (ev) => {
    const code = C.keyCode(ev);
    if (!code) return;
    keys[code] = true;
    if (code === "Space") ev.preventDefault();
    if (code === "Escape") {
      if (!shopEl.hidden) {
        shopEl.hidden = true;
        return;
      }
      paused = !paused;
      pauseEl.hidden = !paused;
      if (!paused) save();
    }
    if (!running || paused) return;
    if (code === "KeyE") interact();
    if (code === "KeyC") consume();
    if (code.startsWith("Digit")) {
      const n = code.charCodeAt(5) - 49;
      if (n >= 0 && n < HOTBAR.length) {
        sel = n;
        renderHotbar();
      }
    }
  });
  window.addEventListener("keyup", (ev) => {
    const code = C.keyCode(ev);
    if (code) keys[code] = false;
  });

  hotbarEl.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-i]");
    if (!btn) return;
    sel = Number(btn.dataset.i);
    renderHotbar();
  });

  document.getElementById("dropIn").addEventListener("click", () => {
    startEl.hidden = true;
    running = true;
    const p = playerCenter();
    pointer.x = p.x;
    pointer.y = p.y;
    canvas.focus();
  });
  document.getElementById("resume").addEventListener("click", () => {
    paused = false;
    pauseEl.hidden = true;
  });
  document.getElementById("newWorld").addEventListener("click", () => {
    paused = false;
    pauseEl.hidden = true;
    newWorld();
  });
  document.getElementById("shopClose").addEventListener("click", () => {
    shopEl.hidden = true;
  });
  document.getElementById("buyNug").addEventListener("click", () => buy("nug"));
  document.getElementById("buyResin").addEventListener("click", () => buy("resin"));
  document.getElementById("touchUse").addEventListener("click", consume);
  document.getElementById("touchDeal").addEventListener("click", interact);
  document.getElementById("touchPlace").addEventListener("click", () => {
    const p = playerCenter();
    const tx = Math.floor((p.x + face * 18) / TILE);
    const ty = Math.floor((p.y + 6) / TILE);
    placeTile(tx, ty);
  });

  touchEl.addEventListener("pointerdown", (ev) => {
    const btn = ev.target.closest("[data-hold]");
    if (!btn) return;
    hold[btn.dataset.hold] = true;
  });
  touchEl.addEventListener("pointerup", (ev) => {
    const btn = ev.target.closest("[data-hold]");
    if (!btn) return;
    hold[btn.dataset.hold] = false;
  });
  document.getElementById("touchMine").addEventListener("pointerdown", () => {
    hold.mine = true;
    const p = playerCenter();
    pointer.x = p.x + face * 20;
    pointer.y = p.y + 4;
    pointer.down = true;
  });
  document.getElementById("touchMine").addEventListener("pointerup", () => {
    hold.mine = false;
    pointer.down = false;
  });

  if (window.matchMedia("(pointer: coarse)").matches) {
    touchEl.classList.add("show");
  }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) save();
  });
  setInterval(save, 15000);

  startEl.removeAttribute("hidden");
  resize();
  bootWorld();
  followCam();
  draw();
  requestAnimationFrame(tick);
})();
