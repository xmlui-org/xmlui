import wget from "wget-improved";
import waitPort from "wait-port";
import fs from "fs/promises";
import * as path from "node:path";
import { discoverPaths } from "./discover-paths.js";
import vm from "node:vm";
import { scripts } from "./app/inline-scripts.js";

const baseURL = `http://localhost:3000`;
const outputPath = `build/client`;

function withoutTrailingSlash(str) {
  return str.endsWith("/") ? str.slice(0, -1) : str;
}

function withoutLeadingSlash(str) {
  return str.startsWith("/") ? str.slice(1) : str;
}

for (const script of scripts) {
  try {
    vm.runInThisContext(script);
  } catch (error) {
    console.error(
      `Error: Tried to execute inline script in non-browser environment, so that potential global functions and values would be available during static html generation. Encountered error, likely due to browser-specific APIs not being available in the script below:\n${script.substring(
        0,
        1000,
      )}`,
    );
    console.error(error);
  }
}

async function savePath(fileName) {
  let fileNameNoLeading = withoutLeadingSlash(fileName);
  let outputFileName = `${outputPath}/${fileNameNoLeading}`;
  let fullURL = `${withoutTrailingSlash(baseURL)}/${fileNameNoLeading}`;
  if (fullURL.endsWith("/")) {
    outputFileName = `${outputFileName}index.html`;
  } else {
    outputFileName = `${outputFileName}/index.html`;
  }
  const parentDir = path.dirname(outputFileName);
  await fs.mkdir(parentDir, { recursive: true });
  console.log(`Downloading ${fullURL} to ${outputFileName}`);
  let download = wget.download(fullURL, `${outputFileName}`);
  download.on("end", function () {
    console.log(`Page '${fileNameNoLeading}' built successfully`);
  });
  download.on("error", function (err) {
    console.log(`couldn't build page: '${fileNameNoLeading}'`);
    console.log(err);
  });
}

const pathsToRender = await discoverPaths();

await waitPort({
  port: 3000,
  host: "localhost",
});

try {
  pathsToRender.forEach(async (file) => {
    try {
      await savePath(file);
    } catch (error) {
      console.error(`Error saving path ${file}:`, error);
      process.exit(1);
    }
  });
} catch (error) {
  console.error(error);
}
