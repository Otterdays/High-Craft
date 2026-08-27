"use strict";

const path = require("path");
const { createRunner } = require("./harness.js");

const MIN_LAYER2 = 10;

function register(h) {
  h.test("assert true passes", () => {
    h.assert(true, "true should pass");
  });

  h.test("assert false throws", () => {
    let threw = false;
    try {
      h.assert(false, "boom");
    } catch (err) {
      threw = err.message === "boom";
    }
    h.assert(threw, "assert(false) must throw the message");
  });

  h.test("eq uses Object.is", () => {
    h.eq(1, 1);
    h.eq(NaN, NaN);
    let threw = false;
    try {
      h.eq(1, 2);
    } catch (err) {
      threw = /eq failed/.test(err.message);
    }
    h.assert(threw, "eq(1,2) must fail");
  });

  h.test("inner runner records a deliberate fail", () => {
    const inner = createRunner("probe-fail");
    inner.test("always fails", () => {
      inner.assert(false, "expected");
    });
    inner.test("always passes", () => {
      inner.assert(true);
    });
    const report = inner.run();
    h.eq(report.total, 2);
    h.eq(report.failed, 1);
    h.eq(report.passed, 1);
    h.assert(report.results[0].ok === false, "first test should fail");
    h.assert(report.results[1].ok === true, "second test should pass");
  });

  h.test("inner runner all-pass is trusted", () => {
    const inner = createRunner("probe-pass");
    inner.test("a", () => inner.eq(2, 2));
    inner.test("b", () => inner.assert(1));
    const report = inner.run();
    h.eq(report.failed, 0);
    h.eq(report.passed, 2);
  });

  h.test("empty suite is detectable", () => {
    const inner = createRunner("empty");
    h.eq(inner.count(), 0);
    const report = inner.run();
    h.eq(report.total, 0);
  });

  h.test("layer2 game tests exist and meet floor", () => {
    const layer2 = require("./hc2d.test.js");
    const inner = createRunner("layer2-probe");
    layer2.register(inner);
    h.assert(
      inner.count() >= MIN_LAYER2,
      "layer2 must have at least " + MIN_LAYER2 + " tests, got " + inner.count()
    );
  });

  h.test("layer2 required names are present", () => {
    const layer2 = require("./hc2d.test.js");
    const inner = createRunner("layer2-names");
    layer2.register(inner);
    const names = inner.names();
    const need = [
      "plug buy is a loss vs regular sell",
      "buy nug spends Green",
      "sell nug pays less than plug",
      "consume needs a nug",
      "same seed same world"
    ];
    for (let i = 0; i < need.length; i += 1) {
      h.assert(names.indexOf(need[i]) !== -1, "missing layer2 test: " + need[i]);
    }
  });

  h.test("harness path is script-only", () => {
    const here = path.basename(__filename);
    h.eq(here, "meta.test.js");
    h.assert(!/browser|playwright|puppeteer/i.test(here), "no browser runner");
  });
}

module.exports = { register, MIN_LAYER2 };
