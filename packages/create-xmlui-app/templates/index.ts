import { install } from "../helpers/install";
import { copy } from "../helpers/copy";
import os from "os";
import fs from "fs/promises";
import path from "path";
import { bold, cyan } from "picocolors";
import pkg from '../package.json'

import type { InstallTemplateArgs } from "./types";

/**
 * Install a UI Engine internal template to a given `root` directory.
 */
export const installTemplate = async ({ appName, root, packageManager, template, useGit }: InstallTemplateArgs) => {
  console.log(bold(`Using ${packageManager}.`));

  /**
   * Copy the template files to the target directory.
   */
  console.log("\nInitializing project with template:", template, "\n");
  const templatePath = path.join(__dirname, template, "ts");
  const copySource = ["**"];

  if (!useGit) {
    copySource.push("!gitignore");
  }
  await copy(copySource, root, {
    parents: true,
    cwd: templatePath,
    rename(name) {
      switch (name) {
        case "gitignore":
        case "eslintrc.json": {
          return `.${name}`;
        }
        // README.md is ignored by webpack-asset-relocator-loader used by ncc:
        // https://github.com/vercel/webpack-asset-relocator-loader/blob/e9308683d47ff507253e37c9bcbb99474603192b/src/asset-relocator.js#L227
        case "README-template.md": {
          return "README.md";
        }
        default: {
          return name;
        }
      }
    },
  });

  /** Create a package.json for the new project and write it to disk. */
  const packageJson: any = {
    name: appName,
    version: "0.1.0",
    private: true,
    scripts: {
      start: "xmlui start",
      build: "xmlui build",
      preview: "xmlui preview",
      "build-prod": "npm run build -- --prod",
      "release-ci": "npm run build-prod && xmlui zip-dist",
    },
    /**
     * Default dependencies.
     */
    dependencies: {
      "@nsoftware-com/xmlui": pkg.version,
    },
  };

  await fs.writeFile(path.join(root, "package.json"), JSON.stringify(packageJson, null, 2) + os.EOL);

  console.log("\nInstalling dependencies:");
  for (const dependency in packageJson.dependencies) console.log(`- ${cyan(dependency)}`);

  console.log();

  await install(packageManager);
};

export * from "./types";
