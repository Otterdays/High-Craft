"use strict";

const path = require("path");
const HC2D = require("../games/high-craft-2d-v1/hc2d-core.js");

function register(h) {
  h.test("plug buy is a loss vs regular sell", () => {
    h.assert(HC2D.buySpreadOk(), "Plug must overcharge vs Regular");
    h.assert(HC2D.PRICE.buyNug > HC2D.PRICE.sellNug);
    h.assert(HC2D.PRICE.buyResin > HC2D.PRICE.sellResin);
  });

  h.test("buy nug spends Green", () => {
    const inv = HC2D.emptyInv();
    const r = HC2D.buy(HC2D.START_GREEN, inv, "nug");
    h.assert(r.ok);
    h.eq(r.green, HC2D.START_GREEN - HC2D.PRICE.buyNug);
    h.eq(r.inv[HC2D.T.NUG], 1);
    h.eq(inv[HC2D.T.NUG], 0, "input inv must stay untouched");
  });

  h.test("sell nug pays less than plug", () => {
    const inv = HC2D.emptyInv();
    inv[HC2D.T.NUG] = 1;
    const r = HC2D.sell(0, inv, HC2D.T.NUG);
    h.assert(r.ok);
    h.eq(r.green, HC2D.PRICE.sellNug);
    h.eq(r.inv[HC2D.T.NUG], 0);
    const roundTrip = HC2D.sell(
      HC2D.buy(HC2D.START_GREEN, HC2D.emptyInv(), "nug").green,
      HC2D.buy(HC2D.START_GREEN, HC2D.emptyInv(), "nug").inv,
      HC2D.T.NUG
    );
    h.assert(roundTrip.green < HC2D.START_GREEN, "buy then sell must lose Green");
  });

  h.test("consume needs a nug", () => {
    const empty = HC2D.consume(HC2D.emptyInv(), 0);
    h.assert(!empty.ok);
    h.eq(empty.reason, "no-nugs");
    const inv = HC2D.emptyInv();
    inv[HC2D.T.NUG] = 2;
    const r = HC2D.consume(inv, 0);
    h.assert(r.ok);
    h.eq(r.inv[HC2D.T.NUG], 1);
    h.eq(r.haze, HC2D.HAZE_SECS);
  });

  h.test("broke buy is rejected", () => {
    const r = HC2D.buy(0, HC2D.emptyInv(), "nug");
    h.assert(!r.ok);
    h.eq(r.reason, "broke");
    h.eq(r.green, 0);
  });

  h.test("cannot sell dirt", () => {
    const inv = HC2D.emptyInv();
    inv[HC2D.T.DIRT] = 9;
    const r = HC2D.sell(10, inv, HC2D.T.DIRT);
    h.assert(!r.ok);
    h.eq(r.green, 10);
  });

  h.test("same seed same world", () => {
    const a = HC2D.generate(42);
    const b = HC2D.generate(42);
    h.eq(a.seed, 42);
    h.eq(a.world.length, HC2D.COLS * HC2D.ROWS);
    h.eq(HC2D.worldToStr(a.world), HC2D.worldToStr(b.world));
  });

  h.test("world has nugs and resin", () => {
    const g = HC2D.generate(99);
    h.assert(HC2D.countType(g.world, HC2D.T.NUG) > 0, "need nugs");
    h.assert(HC2D.countType(g.world, HC2D.T.RESIN) > 0, "need resin");
    h.assert(HC2D.countType(g.world, HC2D.T.GRASS) > 0, "need grass");
  });

  h.test("solid overlap and air box", () => {
    const world = new Uint8Array(HC2D.COLS * HC2D.ROWS);
    HC2D.setT(world, 5, 5, HC2D.T.STONE);
    h.assert(HC2D.overlapsSolid(world, 5 * 16, 5 * 16, 10, 10));
    h.assert(!HC2D.overlapsSolid(world, 0, 0, 8, 8));
  });

  h.test("breakInto fills pack", () => {
    const world = new Uint8Array(HC2D.COLS * HC2D.ROWS);
    HC2D.setT(world, 3, 4, HC2D.T.NUG);
    const r = HC2D.breakInto(world, HC2D.emptyInv(), 3, 4);
    h.assert(r.ok);
    h.eq(r.inv[HC2D.T.NUG], 1);
    h.eq(HC2D.getT(world, 3, 4), HC2D.T.AIR);
  });

  h.test("world string roundtrip", () => {
    const g = HC2D.generate(7);
    const s = HC2D.worldToStr(g.world);
    const dest = new Uint8Array(g.world.length);
    h.assert(HC2D.strToWorld(s, dest));
    h.eq(HC2D.worldToStr(dest), s);
    h.assert(!HC2D.strToWorld("nope", dest));
  });

  h.test("keyCode maps letters without code", () => {
    h.eq(HC2D.keyCode({ key: "a" }), "KeyA");
    h.eq(HC2D.keyCode({ key: "e" }), "KeyE");
    h.eq(HC2D.keyCode({ code: "KeyD", key: "x" }), "KeyD");
  });

  h.test("core file is not a browser runner", () => {
    h.eq(path.basename(__filename), "hc2d.test.js");
    h.assert(typeof document === "undefined");
    h.assert(typeof window === "undefined");
  });
}

module.exports = { register };
