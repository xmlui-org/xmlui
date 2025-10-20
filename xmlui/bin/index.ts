#!/usr/bin/env -S vite-node --script

import { build } from "./build";
import { start } from "./start";
import { preview } from "./preview";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import AdmZip from "adm-zip";
import { buildLib } from "./build-lib";

process.on("unhandledRejection", (err) => {
  throw err;
});

async function zipDirectory(sourceDir: string, outPath: string = sourceDir) {
  const zip = new AdmZip();
  zip.addLocalFolder(sourceDir);
  await zip.writeZipPromise(outPath);
  console.log(`Zip file created: ${outPath}`);
}

async function zipDist({
  target = "ui.zip",
  source = "dist",
}: {
  target?: string;
  source?: string;
}) {
  await zipDirectory(`${process.cwd()}/${source}`, `${process.cwd()}/${target}`);
}

function dedupeArg(arg: any) {
  if (Array.isArray(arg)) {
    return arg[arg.length - 1];
  }
  return arg;
}

function getBoolArg(arg: any, defaultValue?: boolean | undefined) {
  if (arg === undefined) {
    return defaultValue;
  }
  return dedupeArg(arg) !== "false";
}

function getStringArg(arg: any, defaultValue: string | undefined) {
  if (arg === undefined) {
    return defaultValue;
  }
  return dedupeArg(arg);
}

// Configure yargs with proper typing
interface BuildArgs {
  flatDist?: boolean;
  prod?: boolean;
  buildMode?: string;
  withMock?: boolean;
  withHostingMetaFiles?: boolean;
  withRelativeRoot?: boolean;
}

interface BuildLibArgs {
  watch?: boolean;
  mode?: string;
}

interface StartArgs {
  port?: number;
  withMock?: boolean;
  proxy?: string;
}

interface PreviewArgs {
  proxy?: string;
}

interface ZipDistArgs {
  target?: string;
  source?: string;
}

const argv = yargs(hideBin(process.argv))
  .command<BuildArgs>("build", "Build the project", (yargs) => {
    return yargs
      .option("flatDist", {
        type: "boolean",
        description: "Create flat distribution",
      })
      .option("prod", {
        type: "boolean",
        description: "Production build",
      })
      .option("buildMode", {
        type: "string",
        description: "Build mode",
      })
      .option("withMock", {
        type: "boolean",
        description: "Include mock data",
      })
      .option("withHostingMetaFiles", {
        type: "boolean",
        description: "Include hosting meta files",
      })
      .option("withRelativeRoot", {
        type: "boolean",
        description: "Use relative root",
      });
  })
  .command<BuildLibArgs>("build-lib", "Build library", (yargs) => {
    return yargs
      .option("watch", {
        type: "boolean",
        description: "Watch mode",
      })
      .option("mode", {
        type: "string",
        description: "Build mode",
      });
  })
  .command<StartArgs>("start", "Start development server", (yargs) => {
    return yargs
      .option("port", {
        type: "number",
        description: "Port number",
      })
      .option("withMock", {
        type: "boolean",
        description: "Include mock data",
      })
      .option("proxy", {
        type: "string",
        description: "Proxy target",
      });
  })
  .command<PreviewArgs>("preview", "Preview build", (yargs) => {
    return yargs.option("proxy", {
      type: "string",
      description: "Proxy target",
    });
  })
  .command<ZipDistArgs>("zip-dist", "Zip distribution", (yargs) => {
    return yargs
      .option("target", {
        type: "string",
        description: "Target zip file",
      })
      .option("source", {
        type: "string",
        description: "Source directory",
      });
  })
  .help()
  .parseSync();

const command = argv._[0] as string;

switch (command) {
  case "build": {
    const { flatDist, prod, buildMode, withMock, withHostingMetaFiles, withRelativeRoot } =
      argv as BuildArgs;

    build({
      buildMode: getStringArg(buildMode, prod ? "CONFIG_ONLY" : undefined),
      withMock: getBoolArg(withMock, prod ? false : undefined),
      withHostingMetaFiles: getBoolArg(withHostingMetaFiles, prod ? false : undefined),
      withRelativeRoot: getBoolArg(withRelativeRoot, prod ? true : undefined),
      flatDist: getBoolArg(flatDist, prod ? true : undefined),
    });
    break;
  }
  case "build-lib": {
    const { watch, mode } = argv as BuildLibArgs;
    buildLib({ watchMode: getBoolArg(watch, false), mode: getStringArg(mode, "") });
    break;
  }
  case "start": {
    const { port, withMock, proxy } = argv as StartArgs;
    console.log("hi\n\n\n");
    console.log(process.argv);
    console.log(__dirname);
    console.log("hi\n\n\n");
    start({ port, withMock: getBoolArg(withMock), proxy });
    break;
  }
  case "preview": {
    const { proxy } = argv as PreviewArgs;
    preview({ proxy });
    break;
  }
  case "zip-dist": {
    const { target, source } = argv as ZipDistArgs;
    zipDist({ target, source });
    break;
  }
  default: {
    console.log('Unknown command "' + command + '".');
    console.log("Perhaps you need to update xmlui?");
    process.exit(1);
  }
}
