#!/usr/bin/env node

import { access, constants, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const command = process.argv[2];
const targetArg = process.argv[3];
const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredTools = [
  {
    name: "node",
    args: ["--version"],
  },
  {
    name: "npm",
    args: ["--version"],
  },
  {
    name: "git",
    args: ["--version"],
  },
  {
    name: "ztk",
    args: ["run", "echo", "ok"],
    hint: "Install with `brew install codejunkie99/ztk/ztk` and initialize with `ztk init -g`.",
  },
];
const targetScripts = {
  init: "npx @sha3dev/harness@latest init",
  "open:chrome-canary": "node scripts/open-chrome-canary.mjs",
  format: "biome format --write --config-path=biome/biome.json .",
  lint: "biome lint --config-path=biome/biome.json .",
  check: "biome check --config-path=biome/biome.json .",
  ci: "npm run check",
};

if (command !== "init") {
  console.error("Usage: harness init [target-directory]");
  process.exit(1);
}

const targetDirectory = resolve(process.cwd(), targetArg ?? ".");

await initializeProject(targetDirectory);

async function initializeProject(directory) {
  await assertReadable(resolve(rootDirectory, "skills"));
  await assertReadable(resolve(rootDirectory, "biome", "biome.json"));
  await assertReadable(resolve(rootDirectory, "scripts", "open-chrome-canary.mjs"));
  await mkdir(directory, { recursive: true });

  const failingTools = getFailingTools(requiredTools);

  await cp(resolve(rootDirectory, "skills"), resolve(directory, "skills"), {
    force: true,
    recursive: true,
  });

  await mkdir(resolve(directory, "biome"), { recursive: true });
  await cp(resolve(rootDirectory, "biome", "biome.json"), resolve(directory, "biome", "biome.json"), {
    force: true,
  });

  await mkdir(resolve(directory, "scripts"), { recursive: true });
  await cp(resolve(rootDirectory, "scripts", "open-chrome-canary.mjs"), resolve(directory, "scripts", "open-chrome-canary.mjs"), {
    force: true,
  });

  await updatePackageJson(directory);

  console.log(`Initialized harness in ${directory}`);

  if (failingTools.length > 0) {
    console.warn(`Missing or failing tools: ${failingTools.map((tool) => tool.name).join(", ")}`);

    for (const tool of failingTools) {
      if (tool.hint !== undefined) {
        console.warn(`${tool.name}: ${tool.hint}`);
      }
    }

    process.exitCode = 1;
  }
}

async function assertReadable(path) {
  await access(path, constants.R_OK);
}

function getFailingTools(tools) {
  return tools.filter((tool) => {
    const result = spawnSync(tool.name, tool.args, {
      stdio: "ignore",
    });

    return result.error !== undefined || result.status !== 0;
  });
}

async function updatePackageJson(directory) {
  const packageJsonPath = resolve(directory, "package.json");
  const packageJson = await readPackageJson(packageJsonPath, directory);

  packageJson.scripts = {
    ...packageJson.scripts,
    ...targetScripts,
  };

  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    "@biomejs/biome": packageJson.devDependencies?.["@biomejs/biome"] ?? "^2.0.0",
  };

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

async function readPackageJson(path, directory) {
  try {
    const content = await readFile(path, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    return {
      name: basename(directory),
      version: "0.0.0",
      private: true,
    };
  }
}
