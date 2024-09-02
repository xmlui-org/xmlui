import { green } from "picocolors";
import path from "path";
import { makeDir } from "./helpers/make-dir";
import { tryGitInit } from "./helpers/git";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { isWriteable } from "./helpers/is-writeable";
import type { PackageManager } from "./helpers/get-pkg-manager";

import type { TemplateType } from "./templates";
import { installTemplate } from "./templates";

export async function createApp({
  appPath,
  packageManager,
  useGit
}: {
  appPath: string;
  packageManager: PackageManager;
  useGit: boolean;
}): Promise<void> {
  const template: TemplateType = "default";
  const root = path.resolve(appPath);

  if (!(await isWriteable(path.dirname(root)))) {
    console.error("The application path is not writable, please check folder permissions and try again.");
    console.error("It is likely you do not have write permissions for this folder.");
    process.exit(1);
  }

  const appName = path.basename(root);

  await makeDir(root);
  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  console.log(`Creating a new UI Engine app in ${green(root)}.`);
  console.log();

  process.chdir(root);

  await installTemplate({
    appName,
    root,
    template,
    packageManager,
    useGit
  });
  
  if (useGit && tryGitInit(root)) {
    console.log("Initialized a git repository.");
    console.log();
  }
  console.log(`${green("Success!")} Created ${appName} at ${appPath}`);

  console.log();
}
