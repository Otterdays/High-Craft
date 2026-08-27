"use strict";

const { createRunner, summarize } = require("./harness.js");
const meta = require("./meta.test.js");
const hc2d = require("./hc2d.test.js");

function print(report) {
  console.log(summarize(report));
}

const layer1 = createRunner("layer1-tests-for-tests");
meta.register(layer1);
const r1 = layer1.run();
print(r1);
if (r1.failed) {
  console.error("Layer 1 failed. Layer 2 not trusted. Abort.");
  process.exit(2);
}

const layer2 = createRunner("layer2-hc2d-core");
hc2d.register(layer2);
const r2 = layer2.run();
print(r2);
if (r2.failed) {
  console.error("Layer 2 failed.");
  process.exit(1);
}

console.log("Both layers green.");
process.exit(0);
