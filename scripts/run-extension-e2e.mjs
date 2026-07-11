#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const args = process.argv.slice(2);
const packageName = args[0] && !args[0].startsWith("-") ? args[0] : undefined;
const playwrightArgs = packageName ? args.slice(1) : args;

if (packageName) {
  const packageDir = path.join(repoRoot, "packages", packageName);
  if (!existsSync(packageDir)) {
    console.error(`Extension package not found: packages/${packageName}`);
    process.exit(2);
  }

  const specs = await findPackageSpecs(packageDir);
  if (specs.length === 0) {
    console.log(`No E2E specs found for ${packageName}.`);
    process.exit(0);
  }

  runPlaywright(specs, playwrightArgs);
} else {
  runPlaywright([], playwrightArgs);
}

async function findPackageSpecs(packageDir) {
  const files = [];
  await collectSpecs(packageDir, files);
  return files
    .map((file) => path.relative(repoRoot, file))
    .sort();
}

async function collectSpecs(dir, files) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "dist-metadata") {
      continue;
    }

    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectSpecs(entryPath, files);
      continue;
    }

    if (entry.isFile() && isE2eSpec(entry.name)) {
      files.push(entryPath);
    }
  }
}

function isE2eSpec(fileName) {
  return fileName.endsWith(".e2e.spec.ts") || fileName.endsWith(".spec.ts");
}

function runPlaywright(specs, extraArgs) {
  const result = spawnSync(
    "npx",
    ["playwright", "test", "-c", "playwright.extensions.config.ts", ...specs, ...extraArgs],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        XMLUI_E2E_EXTENSION_PACKAGE: packageName ?? "",
      },
      stdio: "inherit",
    },
  );

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 1);
}
