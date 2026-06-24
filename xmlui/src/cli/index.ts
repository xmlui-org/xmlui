#!/usr/bin/env node

import { build } from "./build";
import { preview } from "./preview";
import { ssg } from "./ssg";
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

interface SsgArgs {
  outDir?: string;
  fallback?: string;
  debug?: boolean;
  contentDir?: string;
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
    .command<SsgArgs>(
      "ssg",
      "Generate static pages",
      (yargs) => {
        return yargs
          .option("outDir", {
            type: "string",
            default: "dist-ssg",
            description: "SSG output directory",
          })
          .option("fallback", {
            type: "string",
            default: "200",
            description:
              "Base name for the fallback HTML file served for unknown routes",
          })
          .option("debug", {
            type: "boolean",
            description: "Preserve intermediate SSR files for debugging",
            hidden: true,
          })
          .option("contentDir", {
            type: "string",
            default: "content",
            description: "Content directory for file based routing",
          });
      },
      async (argv) => {
        const { outDir, fallback, debug, contentDir } = argv;
        await ssg({
          outDir: getStringArg(outDir, "dist-ssg"),
          fallbackFile: getStringArg(fallback, "200"),
          debug: getBoolArg(debug, false),
          contentDir: getStringArg(contentDir, "content"),
        });
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
