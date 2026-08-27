"use strict";

function createRunner(layerName) {
  const tests = [];

  function test(name, fn) {
    tests.push({ name, fn });
  }

  function assert(cond, msg) {
    if (!cond) throw new Error(msg || "assert failed");
  }

  function eq(a, b, msg) {
    if (Object.is(a, b)) return;
    throw new Error(msg || "eq failed: " + String(a) + " !== " + String(b));
  }

  function count() {
    return tests.length;
  }

  function names() {
    return tests.map((t) => t.name);
  }

  function run() {
    const results = [];
    for (let i = 0; i < tests.length; i += 1) {
      const t = tests[i];
      try {
        t.fn();
        results.push({ name: t.name, ok: true });
      } catch (err) {
        results.push({
          name: t.name,
          ok: false,
          error: err && err.message ? err.message : String(err)
        });
      }
    }
    const failed = results.filter((r) => !r.ok).length;
    const passed = results.length - failed;
    return {
      layer: layerName,
      results,
      passed,
      failed,
      total: results.length
    };
  }

  return { test, assert, eq, count, names, run, layerName };
}

function summarize(report) {
  const lines = [];
  lines.push("[" + report.layer + "] " + report.passed + "/" + report.total + " passed");
  for (let i = 0; i < report.results.length; i += 1) {
    const r = report.results[i];
    if (r.ok) lines.push("  ok   " + r.name);
    else lines.push("  FAIL " + r.name + " — " + r.error);
  }
  return lines.join("\n");
}

module.exports = { createRunner, summarize };
