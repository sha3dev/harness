#!/usr/bin/env node

import { spawn } from "node:child_process";
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
  { source: ["AGENTS.md"], target: ["AGENTS.md"] },
  { source: ["claude", "skills"], target: [".claude", "skills"], recursive: true },
  { source: ["claude", "config.json"], target: [".claude", "config.json"] },
  { source: ["biome", "biome.json"], target: ["biome", "biome.json"] },
  { source: ["scripts", "open-chrome-canary.mjs"], target: ["scripts", "open-chrome-canary.mjs"] },
  { source: ["scripts", "playwright-spain-init.js"], target: ["scripts", "playwright-spain-init.js"] },
  { source: ["scripts", "publish.mjs"], target: ["scripts", "publish.mjs"] },
];

const biomeConfigArgs = ["--config-path=biome/biome.json", "."];
const formatOnlyBiomeArgs = ["check", "--write", "--linter-enabled=false", ...biomeConfigArgs];
const safeBiomeCheckArgs = ["check", "--write", ...biomeConfigArgs];
const unsafeBiomeCheckArgs = ["check", "--write", "--unsafe", "--skip=suspicious/noConsole", "--skip=complexity/useOptionalChain", ...biomeConfigArgs];

if (command !== "init") {
  printUsage();
  process.exit(1);
}

const initOptions = parseInitArgs(rawArgs.slice(1));
await initializeProject(process.cwd(), initOptions);

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
  await patchBiomeSchema(directory);
  const biomeVersion = await updatePackageJson(directory);
  await formatProject(directory, biomeVersion);
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
    await cp(source, target, { force: true, recursive: file.recursive === true });
  }
}

async function patchBiomeSchema(directory) {
  const version = await detectBiomeVersion(directory);
  if (!version) {
    return;
  }
  const biomePath = resolve(directory, "biome", "biome.json");
  const content = await readFile(biomePath, "utf8");
  const schemaPattern = /"https:\/\/biomejs\.dev\/schemas\/[^"]+\/schema\.json"/;
  const schemaUrl = `"https://biomejs.dev/schemas/${version}/schema.json"`;
  await writeFile(biomePath, content.replace(schemaPattern, schemaUrl));
}

async function detectBiomeVersion(directory) {
  try {
    const biomePackagePath = resolve(directory, "node_modules", "@biomejs", "biome", "package.json");
    const content = await readFile(biomePackagePath, "utf8");
    return JSON.parse(content).version ?? null;
  } catch {
    return null;
  }
}

async function updatePackageJson(directory) {
  const packageJsonPath = resolve(directory, "package.json");
  const packageJson = await readPackageJson(packageJsonPath, directory);
  const isUserScript = ([name]) => !name.startsWith("harness:");
  const userScripts = Object.fromEntries(Object.entries(packageJson.scripts ?? {}).filter(isUserScript));
  packageJson.scripts = { ...userScripts, ...targetScripts };
  const currentBiome = packageJson.devDependencies?.["@biomejs/biome"];
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    "@biomejs/biome": currentBiome ?? "^2.0.0",
  };
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  return packageJson.devDependencies["@biomejs/biome"];
}

async function readPackageJson(path, directory) {
  try {
    const content = await readFile(path, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
    return { name: basename(directory), version: "0.0.0", private: true };
  }
}

function parseInitArgs(args) {
  const options = { dryRun: false };
  for (const arg of args) {
    if (arg === "--dry-run" || arg === "--check") {
      options.dryRun = true;
      continue;
    }
    const prefix = arg.startsWith("-") ? "Unknown option" : "Unexpected argument";
    console.error(`${prefix}: ${arg}`);
    printUsage();
    process.exit(1);
  }
  return options;
}

function reportDryRun(directory) {
  console.log(`Would initialize harness in ${directory}\n`);
  console.log("Files copied or refreshed:");
  for (const file of managedCopies) {
    console.log(`- ${file.target.join("/")}`);
  }
  console.log("\npackage.json scripts:");
  for (const [name, script] of Object.entries(targetScripts)) {
    console.log(`- ${name}: ${script}`);
  }
  console.log("\npackage.json devDependencies:");
  console.log("- @biomejs/biome: ^2.0.0");
  console.log("\nFormat and fix commands:");
  console.log("- npx --yes @biomejs/biome@^2.0.0 check --write --linter-enabled=false --config-path=biome/biome.json .");
  console.log("- npx --yes @biomejs/biome@^2.0.0 check --write --unsafe --skip=suspicious/noConsole --skip=complexity/useOptionalChain --config-path=biome/biome.json .");
  console.log("- npx --yes @biomejs/biome@^2.0.0 check --write --config-path=biome/biome.json .");
}

async function formatProject(directory, biomeVersion) {
  const biomePackage = `@biomejs/biome@${biomeVersion}`;
  await runBiome(directory, biomePackage, formatOnlyBiomeArgs);
  await runBiome(directory, biomePackage, unsafeBiomeCheckArgs);
  await runBiome(directory, biomePackage, safeBiomeCheckArgs);
}

async function runBiome(directory, biomePackage, commandArgs) {
  const args = ["--yes", biomePackage, ...commandArgs];
  await new Promise((resolvePromise, reject) => {
    const child = spawn("npx", args, { cwd: directory, stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      console.error(`Biome applied available fixes, but some diagnostics remain. Exit code: ${code}`);
      resolvePromise();
    });
  });
}

function printUsage() {
  console.error("Usage: harness init [--dry-run]");
}
