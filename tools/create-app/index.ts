#!/usr/bin/env node
import { bold, cyan, green, red, yellow } from "picocolors";
import Commander from "commander";
import path from "path";
import prompts from "prompts";
import checkForUpdate from "update-check";
import { createApp } from "./create-app";
import { validateNpmName } from "./helpers/validate-pkg";
import packageJson from "./package.json";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import fs from "fs";

let projectPath: string = "";

const handleSigTerm = () => process.exit(0);

process.on("SIGINT", handleSigTerm);
process.on("SIGTERM", handleSigTerm);

const onPromptState = (state: any) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write("\x1B[?25h");
    process.stdout.write("\n");
    process.exit(1);
  }
};

const program = new Commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments("<project-directory>")
  .usage(`${green("<project-directory>")} [options]`)
  .action((name) => {
    projectPath = name;
  })
  .option(
    "--use-git",
    `Explicitly tell the CLI to initialize a git repository`
  )
  .allowUnknownOption()
  .parse(process.argv);

const packageManager = "npm";

async function run(): Promise<void> {
  if (typeof projectPath === "string") {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      onState: onPromptState,
      type: "text",
      name: "path",
      message: "What is your project named?",
      initial: "my-app",
      validate: (name) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));
        if (validation.valid) {
          return true;
        }
        return "Invalid project name: " + validation.problems![0];
      },
    });

    if (typeof res.path === "string") {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log(
      "\nPlease specify the project directory:\n" +
        `  ${cyan(program.name())} ${green("<project-directory>")}\n` +
        "For example:\n" +
        `  ${cyan(program.name())} ${green("my-xmlui-app")}\n\n` +
        `Run ${cyan(`${program.name()} --help`)} to see all options.`
    );
    process.exit(1);
  }

  const resolvedProjectPath = path.resolve(projectPath);
  const projectName = path.basename(resolvedProjectPath);

  const { valid, problems } = validateNpmName(projectName);
  if (!valid) {
    console.error(`Could not create a project called ${red(`"${projectName}"`)} because of npm naming restrictions:`);

    problems!.forEach((p) => console.error(`    ${red(bold("*"))} ${p}`));
    process.exit(1);
  }

  /**
   * Verify the project dir is empty or doesn't exist
   */
  const root = path.resolve(resolvedProjectPath);
  const appName = path.basename(root);
  const folderExists = fs.existsSync(root);

  if (folderExists && !isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  if (program.useGit === undefined) {
      const { useGit } = await prompts(
          {
            type: 'toggle',
            name: 'useGit',
            message: `Would you like to initialize a git repository?`,
            initial: false,
            active: 'Yes',
            inactive: 'No',
          },
          {
            /**
             * User inputs Ctrl+C or Ctrl+D to exit the prompt. We should close the
             * process and not write to the file system.
             */
            onCancel: () => {
              console.error('Exiting.')
              process.exit(1)
            },
          }
      )
      /**
       * Depending on the prompt response, set the appropriate program flags.
       */
      program.useGit = Boolean(useGit)
  }
    
  await createApp({
    appPath: resolvedProjectPath,
    packageManager,
    useGit: !!program.useGit
  });
}

const update = checkForUpdate(packageJson).catch(() => null);

async function notifyUpdate(): Promise<void> {
  try {
    const res = await update;
    if (res?.latest) {
      const updateMessage = "npm i -g create-xmlui-app";

      console.log(
        yellow(bold("A new version of `create-xmlui-app` is available!")) +
          "\n" +
          "You can update by running: " +
          cyan(updateMessage) +
          "\n"
      );
    }
    process.exit();
  } catch {
    // ignore error
  }
}

run()
  .then(notifyUpdate)
  .catch(async (reason) => {
    console.log();
    console.log("Aborting installation.");
    if (reason.command) {
      console.log(`  ${cyan(reason.command)} has failed.`);
    } else {
      console.log(red("Unexpected error. Please report it as a bug:") + "\n", reason);
    }
    console.log();

    await notifyUpdate();

    process.exit(1);
  });
