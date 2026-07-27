#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const targetVersion = process.env.TARGET_VERSION?.trim();
const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

if (targetVersion && !semverPattern.test(targetVersion)) {
  fail(`TARGET_VERSION must be an exact stable semver version, got "${targetVersion}".`);
}

const previousFixedVersions = targetVersion ? readFixedGroupVersions() : null;

runChangesetVersion();

if (targetVersion) {
  retargetFixedGroup(targetVersion, previousFixedVersions);
}

function runChangesetVersion() {
  const changesetBin = path.join(
    root,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "changeset.cmd" : "changeset",
  );
  const command = fs.existsSync(changesetBin) ? changesetBin : "changeset";
  const result = spawnSync(command, ["version", ...process.argv.slice(2)], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    fail(result.error.message);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function readFixedGroupVersions() {
  const fixedGroup = getXmluiFixedGroup();
  const packagesByName = readWorkspacePackages();

  return new Map(
    fixedGroup.map((packageName) => {
      const workspacePackage = packagesByName.get(packageName);

      if (!workspacePackage) {
        fail(`Could not find workspace package "${packageName}" from the fixed release group.`);
      }

      return [packageName, readJson(workspacePackage.packageJsonPath).version];
    }),
  );
}

function retargetFixedGroup(targetVersion, previousVersions) {
  const fixedGroup = getXmluiFixedGroup();
  const packagesByName = readWorkspacePackages();
  const releasePackages = fixedGroup.map((packageName) => {
    const workspacePackage = packagesByName.get(packageName);

    if (!workspacePackage) {
      fail(`Could not find workspace package "${packageName}" from the fixed release group.`);
    }

    const packageJson = readJson(workspacePackage.packageJsonPath);
    return {
      ...workspacePackage,
      calculatedVersion: packageJson.version,
    };
  });

  const calculatedVersions = new Set(releasePackages.map((pkg) => pkg.calculatedVersion));
  if (calculatedVersions.size !== 1) {
    fail(
      `Expected fixed release group packages to share one calculated version, got ${[
        ...calculatedVersions,
      ].join(", ")}.`,
    );
  }

  const calculatedVersion = [...calculatedVersions][0];
  const previousVersion = previousVersions.get("xmlui");

  if (!semverGreaterThan(calculatedVersion, previousVersion)) {
    fail(
      `TARGET_VERSION was set, but Changesets did not bump the xmlui fixed group from ${previousVersion}.`,
    );
  }

  if (calculatedVersion === targetVersion) {
    console.log(`Changesets already calculated ${targetVersion}; no retargeting needed.`);
    return;
  }

  if (!semverGreaterThan(targetVersion, calculatedVersion)) {
    fail(`TARGET_VERSION ${targetVersion} must be greater than calculated version ${calculatedVersion}.`);
  }

  for (const pkg of releasePackages) {
    const packageJson = readJson(pkg.packageJsonPath);
    packageJson.version = targetVersion;
    writeJson(pkg.packageJsonPath, packageJson);
    retargetChangelog(pkg.changelogPath, calculatedVersion, targetVersion, fixedGroup);
  }

  retargetRootPackageLock(releasePackages, targetVersion);

  console.log(
    `Retargeted ${fixedGroup.join(", ")} from ${calculatedVersion} to ${targetVersion}.`,
  );
}

function getXmluiFixedGroup() {
  const config = readJson(".changeset/config.json");
  const fixedGroup = config.fixed?.find((group) => group.includes("xmlui"));

  if (!fixedGroup) {
    fail("Could not find a Changesets fixed group containing xmlui.");
  }

  return fixedGroup;
}

function readWorkspacePackages() {
  const rootPackageJson = readJson("package.json");
  const packagesByName = new Map();

  for (const workspacePattern of rootPackageJson.workspaces ?? []) {
    for (const workspacePath of expandWorkspacePattern(workspacePattern)) {
      const packageJsonPath = path.join(workspacePath, "package.json");

      if (!fs.existsSync(packageJsonPath)) {
        continue;
      }

      const packageJson = readJson(packageJsonPath);
      if (!packageJson.name) {
        continue;
      }

      packagesByName.set(packageJson.name, {
        name: packageJson.name,
        workspacePath,
        packageJsonPath,
        changelogPath: path.join(workspacePath, "CHANGELOG.md"),
      });
    }
  }

  return packagesByName;
}

function expandWorkspacePattern(workspacePattern) {
  const normalizedPattern = stripLeadingDotSlash(workspacePattern);

  if (!normalizedPattern.endsWith("/*")) {
    return [normalizedPattern];
  }

  const parentDir = normalizedPattern.slice(0, -2);
  return fs
    .readdirSync(parentDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(parentDir, entry.name));
}

function stripLeadingDotSlash(value) {
  return value.startsWith("./") ? value.slice(2) : value;
}

function retargetChangelog(changelogPath, calculatedVersion, targetVersion, packageNames) {
  if (!fs.existsSync(changelogPath)) {
    return;
  }

  const changelog = fs.readFileSync(changelogPath, "utf8");
  const header = `## ${calculatedVersion}`;
  const headerIndex = changelog.indexOf(header);

  if (headerIndex === -1) {
    return;
  }

  const nextHeaderIndex = changelog.indexOf("\n## ", headerIndex + header.length);
  const sectionEnd = nextHeaderIndex === -1 ? changelog.length : nextHeaderIndex;
  const section = changelog.slice(headerIndex, sectionEnd);
  let retargetedSection = section.replace(header, `## ${targetVersion}`);

  for (const packageName of packageNames) {
    retargetedSection = retargetedSection.replaceAll(
      `${packageName}@${calculatedVersion}`,
      `${packageName}@${targetVersion}`,
    );
  }

  fs.writeFileSync(
    changelogPath,
    `${changelog.slice(0, headerIndex)}${retargetedSection}${changelog.slice(sectionEnd)}`,
  );
}

function retargetRootPackageLock(releasePackages, targetVersion) {
  const packageLockPath = "package-lock.json";

  if (!fs.existsSync(packageLockPath)) {
    return;
  }

  const packageLock = readJson(packageLockPath);

  for (const pkg of releasePackages) {
    const packageEntry = packageLock.packages?.[pkg.workspacePath];
    if (packageEntry?.version) {
      packageEntry.version = targetVersion;
    }

    const lockEntry = packageLock[pkg.name];
    if (lockEntry?.version) {
      lockEntry.version = targetVersion;
    }
  }

  writeJson(packageLockPath, packageLock);
}

function semverGreaterThan(left, right) {
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);

  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] > rightParts[index]) {
      return true;
    }

    if (leftParts[index] < rightParts[index]) {
      return false;
    }
  }

  return false;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function fail(message) {
  console.error(`changeset-version: ${message}`);
  process.exit(1);
}
