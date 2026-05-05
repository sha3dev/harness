import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

const packageJsonPath = new URL("../package.json", import.meta.url);
const maxPublishAttempts = 5;

let packageJson = await readPackageJson();
let publishedVersion = getPublishedVersion(packageJson.name);

if (publishedVersion !== undefined && compareVersions(packageJson.version, publishedVersion) <= 0) {
  await bumpToNextPatch(publishedVersion);
}

for (let attempt = 1; attempt <= maxPublishAttempts; attempt += 1) {
  const result = spawnSync("npm", ["publish"], {
    encoding: "utf8",
    stdio: ["inherit", "pipe", "pipe"],
  });

  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);

  if (result.status === 0) {
    process.exit(0);
  }

  if (!isVersionConflict(result) || attempt === maxPublishAttempts) {
    process.exit(result.status ?? 1);
  }

  packageJson = await readPackageJson();
  publishedVersion = getPublishedVersion(packageJson.name) ?? packageJson.version;
  await bumpToNextPatch(publishedVersion);
}

async function readPackageJson() {
  return JSON.parse(await readFile(packageJsonPath, "utf8"));
}

async function bumpToNextPatch(version) {
  packageJson.version = nextPatchVersion(version);
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  console.error(`[publish] bumped ${packageJson.name} to ${packageJson.version}`);
}

function getPublishedVersion(packageName) {
  const result = spawnSync("npm", ["view", packageName, "version", "--json"], {
    encoding: "utf8",
  });

  if (result.status === 0) {
    return JSON.parse(result.stdout);
  }

  const output = `${result.stdout}\n${result.stderr}`;
  if (output.includes("E404")) {
    return undefined;
  }

  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

function nextPatchVersion(version) {
  const [major, minor, patch] = parseVersion(version);
  return `${major}.${minor}.${patch + 1}`;
}

function isVersionConflict(result) {
  const output = `${result.stdout}\n${result.stderr}`;
  return output.includes("EPUBLISHCONFLICT") || output.includes("previously published") || output.includes("cannot publish over");
}

function compareVersions(left, right) {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);

  for (const index of [0, 1, 2]) {
    if (leftParts[index] > rightParts[index]) {
      return 1;
    }
    if (leftParts[index] < rightParts[index]) {
      return -1;
    }
  }

  return 0;
}

function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  return match.slice(1).map(Number);
}
