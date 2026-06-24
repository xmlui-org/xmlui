#!/usr/bin/env node

import { build } from "./build";
import { preview } from "./preview";
import { start } from "./start";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

process.on("unhandledRejection", (err) => {
  throw err;
});

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

interface BuildArgs {
  flatDist?: boolean;
  prod?: boolean;
  buildMode?: string;
  withMock?: boolean;
  withHostingMetaFiles?: boolean;
  withRelativeRoot?: boolean;
}

interface PreviewArgs {
  port?: number;
  proxy?: string;
}

interface StartArgs {
  port?: number;
  proxy?: string;
}

async function run() {
  await yargs(hideBin(process.argv))
    .command<BuildArgs>(
      "build",
      "Build the project",
      (yargs) => {
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
      },
      async (argv) => {
        const {
          flatDist,
          prod,
          buildMode,
          withMock,
          withHostingMetaFiles,
          withRelativeRoot,
        } = argv;

        await build({
          buildMode: getStringArg(buildMode, prod ? "CONFIG_ONLY" : undefined),
          withMock: getBoolArg(withMock, prod ? false : undefined),
          withHostingMetaFiles: getBoolArg(
            withHostingMetaFiles,
            prod ? false : undefined,
          ),
          withRelativeRoot: getBoolArg(
            withRelativeRoot,
            prod ? true : undefined,
          ),
          flatDist: getBoolArg(flatDist, prod ? true : undefined),
        });
      },
    )
    .command<PreviewArgs>(
      "preview",
      "Preview build",
      (yargs) => {
        return yargs
          .option("port", {
            type: "number",
            description: "Port number",
          })
          .option("proxy", {
            type: "string",
            description: "Proxy target (e.g. /api->http://localhost:3000)",
          });
      },
      async (argv) => {
        const { port, proxy } = argv;
        await preview({ port, proxy });
      },
    )
    .command<StartArgs>(
      "start",
      "Start development server",
      (yargs) => {
        return yargs
          .option("port", {
            type: "number",
            description: "Port number",
          })
          .option("proxy", {
            type: "string",
            description: "Proxy target (e.g. /api->http://localhost:3000)",
          });
      },
      async (argv) => {
        const { port, proxy } = argv;
        await start({ port, proxy });
      },
    )
    .strict()
    .demandCommand(1, "You need to provide a command")
    .help()
    .parse();
}

run().catch((e) => {
  console.error("There was an error");
  console.error(e);
  process.exit(1);
});
