#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const spawn = require("cross-spawn");
const cheerio = require("cheerio");

// Helper function to run commands and stream output
function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`> Running: ${command} ${args.join(" ")} in ${cwd}`);
    const child = spawn(command, args, { cwd, stdio: "inherit" });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`));
        return;
      }
      resolve();
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Finds the monorepo root directory and its workspaces configuration by searching upwards.
 * @param {string} startDir The directory to start searching from.
 * @returns {Promise<{root: string | null, workspaces: string[] | null}>} An object containing the monorepo root path and its workspaces, or {root: null, workspaces: null} if not found.
 */
async function findMonorepoRoot(startDir) {
  let currentDir = startDir;
  const maxDepth = 10;
  let depth = 0;

  while (currentDir !== path.parse(currentDir).root && depth < maxDepth) {
    const packageJsonPath = path.join(currentDir, "package.json");
    const lernaJsonPath = path.join(currentDir, "lerna.json");

    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        if (packageJson.workspaces) {
          console.log(`Found monorepo root via package.json with workspaces at: ${currentDir}`);
          const workspaces = Array.isArray(packageJson.workspaces)
            ? packageJson.workspaces
            : packageJson.workspaces.packages || null;
          return { root: currentDir, workspaces: workspaces };
        }
      } catch (err) {
        console.warn(`Warning: Could not read package.json at ${packageJsonPath}: ${err.message}`);
      }
    }

    if (await fs.pathExists(lernaJsonPath)) {
      console.log(`Found monorepo root via lerna.json at: ${currentDir}`);
      return { root: currentDir, workspaces: ["packages/*", "apps/*"] }; // Default Lerna patterns
    }

    currentDir = path.dirname(currentDir);
    depth++;
  }

  console.log(`Could not find monorepo root from ${startDir} up to depth ${maxDepth}.`);
  return { root: null, workspaces: null };
}

/**
 * Discovers local monorepo packages based on workspace patterns and collects their names.
 * This function is used to identify packages that should NOT be included in the temporary
 * build directory's package.json, as they will be handled by the monorepo's linking.
 * @param {string} baseDirForLocalPackages The monorepo root directory.
 * @param {string[]} lookupPatterns An array of glob-like patterns from workspaces.
 * @returns {Promise<Set<string>>} A set of package names that are local monorepo packages.
 */
async function discoverLocalMonorepoPackageNames(baseDirForLocalPackages, lookupPatterns) {
  const discoveredPackageNames = new Set();
  const discoveredPackagePaths = {};

  for (const pattern of lookupPatterns) {
    // Handle glob patterns like 'packages/*' or 'apps/*'
    if (pattern.endsWith("/*") || pattern.endsWith("**")) {
      const patternBaseDir = path.join(
        baseDirForLocalPackages,
        pattern.replace(/(\/\*\*|\/\*)$/, ""),
      );
      try {
        if (
          (await fs.pathExists(patternBaseDir)) &&
          (await fs.stat(patternBaseDir)).isDirectory()
        ) {
          const subDirs = await fs.readdir(patternBaseDir, {
            withFileTypes: true,
          });
          for (const dirent of subDirs) {
            if (dirent.isDirectory()) {
              const packagePath = path.join(patternBaseDir, dirent.name);
              const packageJsonPath = path.join(packagePath, "package.json");
              if (await fs.pathExists(packageJsonPath)) {
                try {
                  const pkgJson = await fs.readJson(packageJsonPath);
                  if (pkgJson.name) {
                    discoveredPackageNames.add(pkgJson.name);
                    discoveredPackagePaths[pkgJson.name] = packagePath;
                    console.log(
                      `Discovered local monorepo package name: '${pkgJson.name}' from path '${packagePath}'`,
                    );
                  }
                } catch (err) {
                  console.warn(
                    `Warning: Could not read package.json for potential workspace package at ${packageJsonPath}: ${err.message}`,
                  );
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn(
          `Warning: Error processing workspace pattern base directory '${patternBaseDir}' for pattern '${pattern}': ${err.message}`,
        );
      }
    } else {
      // Handle direct paths like './xmlui'
      const packagePath = path.join(baseDirForLocalPackages, pattern);
      try {
        if ((await fs.pathExists(packagePath)) && (await fs.stat(packagePath)).isDirectory()) {
          const packageJsonPath = path.join(packagePath, "package.json");
          if (await fs.pathExists(packageJsonPath)) {
            try {
              const pkgJson = await fs.readJson(packageJsonPath);
              if (pkgJson.name) {
                discoveredPackageNames.add(pkgJson.name);
                discoveredPackagePaths[pkgJson.name] = packagePath;
                console.log(
                  `Discovered local monorepo package name: '${pkgJson.name}' from direct path '${pattern}'`,
                );
              }
            } catch (err) {
              console.warn(
                `Warning: Could not read package.json for direct workspace package at ${packageJsonPath}: ${err.message}`,
              );
            }
          }
        }
      } catch (err) {
        console.warn(
          `Warning: Error processing direct workspace path '${packagePath}' for pattern '${pattern}': ${err.message}`,
        );
      }
    }
  }
  return {
    localMonorepoPackageNames: discoveredPackageNames,
    localMonorepoPackagePaths: discoveredPackagePaths,
  };
}

async function main() {
  console.log("🚀 Starting XMLUI Optimizer...");

  const hostProjectDir = process.cwd(); // Directory where the script is run
  const optimizerPackageDir = path.resolve(__dirname, ".."); // Root of xmlui-optimizer package
  const templateDir = path.join(optimizerPackageDir, "template");

  console.log(`Host project directory: ${hostProjectDir}`);
  console.log(`Optimizer template directory: ${templateDir}`);

  // --- Determine monorepo root and its workspaces ---
  const { root: monorepoRootPath, workspaces: monorepoWorkspaces } =
    await findMonorepoRoot(hostProjectDir);

  // If a monorepo root is found, use it; otherwise, fall back to hostProjectDir
  const baseDirForLocalPackages = monorepoRootPath || hostProjectDir;
  console.log(`Base directory for locating local monorepo packages: ${baseDirForLocalPackages}`);

  // Define default monorepo package patterns if no workspaces are found or inferred
  const defaultMonorepoPackagePatterns = ["packages/*", "libs/*", "apps/*"];
  const effectiveLookupPatterns =
    monorepoWorkspaces && monorepoWorkspaces.length > 0
      ? monorepoWorkspaces
      : defaultMonorepoPackagePatterns;

  console.log(
    `Effective lookup patterns for local packages: ${effectiveLookupPatterns.join(", ")}`,
  );

  // Discover all local monorepo package names
  const { localMonorepoPackageNames, localMonorepoPackagePaths } =
    await discoverLocalMonorepoPackageNames(baseDirForLocalPackages, effectiveLookupPatterns);
  // --- END Determine monorepo root and its workspaces --

  // Define a temporary build directory within the monorepo root (or host project if not monorepo)
  const tempBuildDir = path.join(baseDirForLocalPackages, "xmlui-temp-build");
  const tempBuildDistClientDir = path.join(tempBuildDir, "build", "client");

  const hostOutputDir = path.join(hostProjectDir, "xmlui-optimized-output");

  let cleanupFn = async () => {};

  try {
    // 1. Clean up previous temporary build directory
    console.log(`\n🧹 Cleaning up previous temporary build directory: ${tempBuildDir}`);
    await fs.remove(tempBuildDir);
    await fs.ensureDir(tempBuildDir);
    console.log("Temporary build directory cleanup complete.");

    console.log(`\n🧹 Cleaning up previous output in host project: ${hostOutputDir}`);
    await fs.remove(hostOutputDir);
    console.log("Host output cleanup complete.");

    // 2. Copy all files from the template directory to the temporary build directory
    console.log("\n📄 Copying all files from template to temporary build directory...");
    await fs.copy(templateDir, tempBuildDir, {
      overwrite: true,
      filter: (src, dest) => {
        // Exclude node_modules and package-lock.json from the initial full copy
        // as they will be handled by npm install later.
        return !(src.includes("node_modules") || src.includes("package-lock.json"));
      },
    });
    console.log("All essential template files copied to temporary build directory.");

    // 3. Copy all top-level folders/files from host project to root level
    // This automatically includes any folders the host project has without manual specification.
    // Template files (app/, generate-files.js, etc.) are protected and won't be overwritten.
    console.log("\n📂 Copying files from host project to temporary build directory...");

    const hostEntries = await fs.readdir(hostProjectDir, {
      withFileTypes: true,
    });

    // Protected names - template files that host should NOT overwrite
    const protectedNames = new Set([
      "package.json",
      "package-lock.json",
      "tsconfig.json",
      "node_modules",
      ".git",
      ".env",
      ".env.local",
      ".env.production",
      ".env.development",
      "xmlui-optimized-output",
      "xmlui-temp-build",
      "build",
      "dist",
      ".eslintrc.cjs",
      ".gitignore",
      "README.md",
      // Template directories that must not be overwritten
      "app",
      "generate-files.js",
      "discover-paths.js",
      "vite.config.ts",
    ]);

    // Directories that should be merged/overwritten from host if they exist
    const mergeDirsAndFiles = new Set([
      "src",
      "utils",
      "content",
      "public",
      "navSections",
      "scripts",
      "extensions.ts",
      "extensions.js",
      "extensions.mjs",
      "extensions.mts",
    ]);

    for (const entry of hostEntries) {
      const srcPath = path.join(hostProjectDir, entry.name);
      const destPath = path.join(tempBuildDir, entry.name);

      if (protectedNames.has(entry.name)) {
        console.log(`Skipping protected item: ${entry.name}`);
        continue;
      }

      // For known directories, copy/merge them
      if (entry.isDirectory() && mergeDirsAndFiles.has(entry.name)) {
        await fs.copy(srcPath, destPath, { overwrite: true });
        console.log(`Copied directory '${entry.name}' to temp build`);
        continue;
      }

      // For other directories and files, copy if doesn't exist in template or is not protected
      if (entry.isDirectory() || entry.isFile()) {
        const templatePath = path.join(templateDir, entry.name);
        const existsInTemplate = await fs.pathExists(templatePath);

        if (!existsInTemplate || mergeDirsAndFiles.has(entry.name)) {
          try {
            if (entry.isDirectory()) {
              await fs.copy(srcPath, destPath, { overwrite: true });
              console.log(`Copied directory '${entry.name}' to temp build`);
            } else {
              await fs.copy(srcPath, destPath, { overwrite: true });
              console.log(`Copied file '${entry.name}' to temp build`);
            }
          } catch (copyErr) {
            console.warn(`Warning: Could not copy '${entry.name}': ${copyErr.message}`);
          }
        } else {
          console.log(`Skipping '${entry.name}' - template version preserved`);
        }
      }
    }

    console.log("File copying from host project to temporary build directory complete.");

    // generate meta and inline scripts from index.html

    try {
      const indexHtmlPath = path.join(hostProjectDir, "index.html");
      // 1. Read & Parse
      const htmlContent = await fs.readFile(indexHtmlPath, "utf-8");
      const $ = cheerio.load(htmlContent);

      // 2. Extract Data
      const title = $("title").text();
      const lang = $("html").attr("lang") || "en";

      const links = [];
      const externalScripts = []; // Separate array for external scripts
      $("link").each((i, el) => {
        links.push({ ...el.attribs });
      });

      const metas = [];
      $("meta").each((i, el) => {
        metas.push({ ...el.attribs });
      });

      const inlineScriptContents = [];
      $("script").each((i, el) => {
        const script = $(el);
        // Exclude the main Vite script
        if (script.attr("type") === "module" && script.attr("src")?.startsWith("/index.ts")) {
          return;
        }

        if (script.attr("src")) {
          externalScripts.push(el.attribs);
        } else {
          inlineScriptContents.push(script.html());
        }
      });
      // 4. Generate InlineScripts.tsx (if needed)
      if (inlineScriptContents.length > 0) {
        const InlineScriptsArray = `
// This component was generated to hold inline scripts from your index.html

export const scripts = [
${inlineScriptContents.map((script) => `    ${JSON.stringify(script.trim())}`).join(",\n")}
];
`;

        const REMIX_INLINE_SCRIPTS_PATH = path.join(tempBuildDir, "app", "inline-scripts.js");
        await fs.writeFile(REMIX_INLINE_SCRIPTS_PATH, InlineScriptsArray.trim());
        console.log(`✅ Generated inline scripts array at ${REMIX_INLINE_SCRIPTS_PATH}`);

        const inlineScriptsComponent = `
//This component was generated to reactify the inline scripts gathered from your index.html

import {scripts} from "./inline-scripts.js";

export function InlineScripts() {
  return (
    <>
      {scripts.map((script, index) => (
        <script key={index} dangerouslySetInnerHTML={{ __html: script.trim() }} />
      ))}
    </>
  );
}`;
        const REMIX_INLINE_SCRIPTS_COMPONENT_PATH = path.join(
          tempBuildDir,
          "app",
          "InlineScripts.tsx",
        );
        await fs.writeFile(REMIX_INLINE_SCRIPTS_COMPONENT_PATH, inlineScriptsComponent.trim());
        console.log(`✅ Generated inline scripts component at ${REMIX_INLINE_SCRIPTS_PATH}`);
      }

      const metaFunctionPayload = [...metas, { title: title }];
      const metaFunctionContent = `
// This function was generated to hold meta tags from your index.html
export function metaFunction() {
    return ${JSON.stringify(metaFunctionPayload, null, 2)};
}
            `;

      const REMIX_META_FN_PATH = path.join(tempBuildDir, "app", "metaFunction.ts");
      await fs.writeFile(REMIX_META_FN_PATH, metaFunctionContent.trim());
      console.log(`✅ Generated meta function at ${REMIX_META_FN_PATH}`);

      const linksFunctionContent = `
// This function was generated to hold external link tags from your index.html
export function linksFunction(){
    return ${JSON.stringify(links, null, 2)};
}
            `;

      const REMIX_LINKS_FN_PATH = path.join(tempBuildDir, "app", "linksFunction.ts");
      await fs.writeFile(REMIX_LINKS_FN_PATH, linksFunctionContent.trim());
      console.log(`✅ Generated links function at ${REMIX_LINKS_FN_PATH}`);

      const externalScriptsFunctionContent = `
// This function was generated to hold external script tags from your index.html
export function externalScriptsFunction(){
    return ${JSON.stringify(externalScripts, null, 2)};
}
            `;

      const REMIX_EXTERNAL_SCRIPTS_FN_PATH = path.join(
        tempBuildDir,
        "app",
        "externalScriptsFunction.ts",
      );
      await fs.writeFile(REMIX_EXTERNAL_SCRIPTS_FN_PATH, externalScriptsFunctionContent.trim());
      console.log(`✅ Generated external scripts function at ${REMIX_EXTERNAL_SCRIPTS_FN_PATH}`);
    } catch (error) {
      console.error("❌ An error occurred reading index.html, generating metas:", error.message);
    }

    // --- END generate meta and inline scripts from index.html ---

    // 4. Merge package.json dependencies
    console.log("\n🔄 Merging dependencies into temporary build directory package.json...");
    const hostPackageJsonPath = path.join(hostProjectDir, "package.json");
    const tempPackageJsonPath = path.join(tempBuildDir, "package.json");

    let hostPackageJson = {};
    if (await fs.pathExists(hostPackageJsonPath)) {
      try {
        hostPackageJson = await fs.readJson(hostPackageJsonPath);
        console.log(`Successfully read host package.json from ${hostPackageJsonPath}`);
      } catch (readErr) {
        console.error(
          `Error reading host package.json: ${readErr.message}. Continuing without host dependencies.`,
        );
        hostPackageJson = {};
      }
    } else {
      console.warn(
        `Warning: Host package.json not found at ${hostPackageJsonPath}. No dependencies will be merged from host.`,
      );
    }

    let tempPackageJson = {};
    if (await fs.pathExists(tempPackageJsonPath)) {
      try {
        tempPackageJson = await fs.readJson(tempPackageJsonPath);
        console.log(`Successfully read temporary build package.json from ${tempPackageJsonPath}`);
      } catch (readErr) {
        throw new Error(
          `Error reading temporary build package.json: ${readErr.message}. This file is essential.`,
        );
      }
    } else {
      throw new Error(
        `Error: Temporary build package.json not found at ${tempPackageJsonPath}. This file is required.`,
      );
    }

    // Combine host and template dependencies
    const mergedDependencies = {
      ...tempPackageJson.dependencies, // Template's runtime deps first
      ...hostPackageJson.dependencies, // Host's runtime deps override
    };

    const mergedDevDependencies = {
      ...hostPackageJson.devDependencies, // Host's dev deps first
      ...tempPackageJson.devDependencies, // Template's dev deps override where specified
    };

    if (monorepoRootPath && mergedDependencies["xmlui"]) {
      console.log(`Pre build xmlui monorepo dependency`);
      await runCommand("npm", ["i"], monorepoRootPath);
      await runCommand("npm", ["run", "build-xmlui"], monorepoRootPath);
      await runCommand("npm", ["run", "prepublishOnly"], localMonorepoPackagePaths["xmlui"]);
      cleanupFn = async () => {
        await runCommand("npm", ["run", "postpublish"], localMonorepoPackagePaths["xmlui"]);
      };
    }

    // Remove local monorepo packages from the merged dependencies and devDependencies,
    // as they will be handled by the monorepo's package manager (e.g., linked).
    for (const pkgName of localMonorepoPackageNames) {
      if (mergedDependencies[pkgName]) {
        delete mergedDependencies[pkgName];
        console.log(
          `Removed local monorepo package '${pkgName}' from runtime dependencies in temporary package.json.`,
        );
      }
      if (mergedDevDependencies[pkgName]) {
        delete mergedDevDependencies[pkgName];
        console.log(
          `Removed local monorepo package '${pkgName}' from dev dependencies in temporary package.json.`,
        );
      }
    }

    // Update the temporary package.json with merged dependencies
    tempPackageJson.dependencies = mergedDependencies;
    tempPackageJson.devDependencies = mergedDevDependencies;

    await fs.writeJson(tempPackageJsonPath, tempPackageJson, { spaces: 2 });
    console.log(`Merged dependencies and wrote updated package.json to ${tempPackageJsonPath}`);
    // --- END Dependency Merging ---

    // 5. Run npm install in the temporary build directory
    console.log(`\n📦 Installing dependencies in temporary build folder: ${tempBuildDir}`);
    // Use --legacy-peer-deps as a fallback for complex monorepo peer dependency graphs
    await runCommand("npm", ["install", "--loglevel=error", "--legacy-peer-deps"], tempBuildDir);
    console.log("Dependency installation in temporary build directory complete.");

    // 6. Run npm run build in the temporary build directory
    console.log(`\n🛠️  Building project in temporary build folder: ${tempBuildDir}`);
    await runCommand("npm", ["run", "build"], tempBuildDir);
    console.log("Build in temporary build directory complete.");

    // 7. Copy build output from temporary build directory to hostProjectDir/xmlui-optimized-output
    console.log(`\n📤 Copying build output to host project: ${hostOutputDir}`);
    if (await fs.pathExists(tempBuildDistClientDir)) {
      await fs.ensureDir(hostOutputDir);
      await fs.copy(tempBuildDistClientDir, hostOutputDir);
      console.log(`Build output successfully copied to ${hostOutputDir}`);
    } else {
      console.warn(
        `Warning: Build output directory ${tempBuildDistClientDir} not found. Skipping copy back to host.`,
      );
    }

    console.log(`\n✅ XMLUI Optimization successful!`);
    console.log(`Optimized build artifacts are located in your project at: ${hostOutputDir}`);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  } finally {
    // Ensure cleanup happens even if there's an error
    if (await fs.pathExists(tempBuildDir)) {
      console.log(`\n🧹 Cleaning up temporary build directory: ${tempBuildDir}`);
      await fs.remove(tempBuildDir);
      console.log("Temporary build directory cleanup complete.");
    }
    await cleanupFn();
  }
}

main();
