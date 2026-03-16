const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const standaloneServerPath = path.join(
  process.cwd(),
  ".next",
  "standalone",
  "server.js",
);
const buildIdPath = path.join(process.cwd(), ".next", "BUILD_ID");

function buildExists() {
  return fs.existsSync(standaloneServerPath) && fs.existsSync(buildIdPath);
}

function runBuild() {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["run", "build"], {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  if (typeof result.status === "number") {
    process.exit(result.status);
  }

  process.exit(1);
}

if (!buildExists()) {
  runBuild();
}
