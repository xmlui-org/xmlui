#!/usr/bin/env node

import { build } from "./build";
import { start } from "./start";
import { preview } from "./preview";
import { argv } from "yargs";
import AdmZip from "adm-zip";
import { buildLib } from "./build-lib";

process.on("unhandledRejection", (err) => {
  throw err;
});
const args = process.argv.slice(2);

const scriptIndex = args.findIndex((x) => x === "build" || x === "eject" || x === "start" || x === "test");
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];

async function zipDirectory(sourceDir: string, outPath: string = sourceDir) {
  const zip = new AdmZip();
  zip.addLocalFolder(sourceDir);
  await zip.writeZipPromise(outPath);
  console.log(`Zip file created: ${outPath}`);
}

async function zipDist({target = "ui.zip", source="dist"}: {target?: string, source?: string}) {
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

switch (script) {
  case "build": {
    const { flatDist, prod, buildMode, withMock, withHostingMetaFiles, withRelativeRoot } =
      argv as any;

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
    const { watch, mode } = argv as any;
    buildLib({watchMode: getBoolArg(watch, false), mode: getStringArg(mode, "")});
    break;
  }
  case "start": {
    const { port, withMock, proxy } = argv as any;
    start({ port, withMock: getBoolArg(withMock), proxy });
    break;
  }
  case "preview": {
    const { proxy } = argv as any;
    preview({proxy});
    break;
  }
  case "zip-dist": {
    const { target, source } = argv as any;
    zipDist({target, source});
    break;
  }
  default: {
    console.log('Unknown script "' + script + '".');
    console.log("Perhaps you need to update xmlui?");
  }
}
