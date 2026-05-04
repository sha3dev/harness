#!/usr/bin/env node

import { access, constants, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rawArgs = process.argv.slice(2);
const command = rawArgs[0];
const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targetScripts = {
  "harness:init": "npx @sha3/harness@latest init",
  "harness:open-chrome-canary": "node scripts/open-chrome-canary.mjs",
  "harness:check": "biome check --config-path=biome/biome.json .",
  "harness:publish": "node scripts/publish.mjs",
};
const managedCopies = [
  {
    source: ["AGENTS.md"],
    target: ["AGENTS.md"],
  },
  {
    source: ["skills"],
    target: ["skills"],
    recursive: true,
  },
  {
    source: ["biome", "biome.json"],
    target: ["biome", "biome.json"],
  },
  {
    source: ["mcp", "playwright-local-canary.json"],
    target: ["mcp", "playwright-local-canary.json"],
  },
  {
    source: ["scripts", "open-chrome-canary.mjs"],
    target: ["scripts", "open-chrome-canary.mjs"],
  },
  {
    source: ["scripts", "publish.mjs"],
    target: ["scripts", "publish.mjs"],
  },
];

if (command !== "init") {
  printUsage();
  process.exit(1);
}

const initOptions = parseInitArgs(rawArgs.slice(1));
const targetDirectory = process.cwd();

await initializeProject(targetDirectory, initOptions);

async function initializeProject(directory, options) {
  for (const file of managedCopies) {
    await assertReadable(resolve(rootDirectory, ...file.source));
  }

  if (options.dryRun) {
    reportDryRun(directory);
    return;
  }

  await mkdir(directory, { recursive: true });

  await copyManagedFiles(directory);
  await updatePackageJson(directory);

  console.log(`Initialized harness in ${directory}`);
}

async function assertReadable(path) {
  await access(path, constants.R_OK);
}

async function copyManagedFiles(directory) {
  for (const file of managedCopies) {
    const source = resolve(rootDirectory, ...file.source);
    const target = resolve(directory, ...file.target);

    await mkdir(dirname(target), { recursive: true });
    await cp(source, target, {
      force: true,
      recursive: file.recursive === true,
    });
  }
}

function parseInitArgs(args) {
  const options = {
    dryRun: false,
  };

  for (const arg of args) {
    if (arg === "--dry-run" || arg === "--check") {
      options.dryRun = true;
      continue;
    }

    console.error(arg.startsWith("-") ? `Unknown option: ${arg}` : `Unexpected argument: ${arg}`);
    printUsage();
    process.exit(1);
  }

  return options;
}

function reportDryRun(directory) {
  console.log(`Would initialize harness in ${directory}`);
  console.log("");
  console.log("Files copied or refreshed:");

  for (const file of managedCopies) {
    console.log(`- ${file.target.join("/")}`);
  }

  console.log("");
  console.log("package.json scripts:");

  for (const [name, script] of Object.entries(targetScripts)) {
    console.log(`- ${name}: ${script}`);
  }

  console.log("");
  console.log("package.json devDependencies:");
  console.log("- @biomejs/biome: ^2.0.0");
}

function printUsage() {
  console.error("Usage: harness init [--dry-run]");
}

async function updatePackageJson(directory) {
  const packageJsonPath = resolve(directory, "package.json");
  const packageJson = await readPackageJson(packageJsonPath, directory);
  const userScripts = Object.fromEntries(Object.entries(packageJson.scripts ?? {}).filter(([name]) => !name.startsWith("harness:")));

  packageJson.scripts = {
    ...userScripts,
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
