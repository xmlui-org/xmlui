import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import AdmZip from "adm-zip";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const CORE_FILE = "xmlui-standalone.umd.js";
const CORE_PATH_IN_SAMPLES = "xmlui"
const CORE_PATH = path.join(__dirname, "../../xmlui/dist", CORE_FILE);
const SAMPLES_BASE = path.join(__dirname, "../samples");
const PUBLIC_CORE_FOLDER = path.join(__dirname, "../public/resources/files/for-download");
const ZIP_TARGET_FOLDER = path.join(__dirname, "../public/resources/files/getting-started");
const GETTING_STARTED_SAMPLE = path.join(SAMPLES_BASE, "getting-started");
const CL_TUTORIAL_SAMPLE = path.join(SAMPLES_BASE, "cl-tutorial");
const CL_TUTORIAL2_SAMPLE = path.join(SAMPLES_BASE, "cl-tutorial2");
const CL_TUTORIAL3_SAMPLE = path.join(SAMPLES_BASE, "cl-tutorial3");
const CL_TUTORIAL4_SAMPLE = path.join(SAMPLES_BASE, "cl-tutorial4");
const CL_TUTORIAL5_SAMPLE = path.join(SAMPLES_BASE, "cl-tutorial5");
const CL_TUTORIAL6_SAMPLE = path.join(SAMPLES_BASE, "cl-tutorial6");
const CL_TUTORIAL_FINAL_SAMPLE = path.join(SAMPLES_BASE, "cl-tutorial-final");

// --- Public core file
console.log("Refreshing the public core file...");
await copyCoreTo(PUBLIC_CORE_FOLDER);
console.log("Done.");

// --- Getting started sample
console.log("Refreshing the Getting Started sample...");
await copyCoreTo(GETTING_STARTED_SAMPLE);
await compressFolder(GETTING_STARTED_SAMPLE, "getting-started.zip");
console.log("Done.");

// --- CL tutorial sample
console.log("Refreshing the CL Tutorial sample...");
await copyCoreTo(CL_TUTORIAL_SAMPLE);
await compressFolder(CL_TUTORIAL_SAMPLE, "cl-tutorial.zip");
console.log("Done.");

// --- CL tutorial #2 sample
console.log("Refreshing the CL Tutorial #2 sample...");
await copyCoreTo(CL_TUTORIAL2_SAMPLE);
await compressFolder(CL_TUTORIAL2_SAMPLE, "cl-tutorial2.zip");
console.log("Done.");

// --- CL tutorial #3 sample
console.log("Refreshing the CL Tutorial #3 sample...");
await copyCoreTo(CL_TUTORIAL3_SAMPLE);
await compressFolder(CL_TUTORIAL3_SAMPLE, "cl-tutorial3.zip");
console.log("Done.");

// --- CL tutorial #4 sample
console.log("Refreshing the CL Tutorial #4 sample...");
await copyCoreTo(CL_TUTORIAL4_SAMPLE);
await compressFolder(CL_TUTORIAL4_SAMPLE, "cl-tutorial4.zip");
console.log("Done.");

// --- CL tutorial #5 sample
console.log("Refreshing the CL Tutorial #5 sample...");
await copyCoreTo(CL_TUTORIAL5_SAMPLE);
await compressFolder(CL_TUTORIAL5_SAMPLE, "cl-tutorial5.zip");
console.log("Done.");

// --- CL tutorial #6 sample
console.log("Refreshing the CL Tutorial #6 sample...");
await copyCoreTo(CL_TUTORIAL6_SAMPLE);
await compressFolder(CL_TUTORIAL6_SAMPLE, "cl-tutorial6.zip");
console.log("Done.");

// --- CL tutorial final sample
console.log("Refreshing the CL Tutorial final sample...");
await copyCoreTo(CL_TUTORIAL_FINAL_SAMPLE);
await compressFolder(CL_TUTORIAL_FINAL_SAMPLE, "cl-tutorial-final.zip");
console.log("Done.");

async function copyCoreTo(dest) {
  const destFile = path.join(dest, CORE_PATH_IN_SAMPLES, CORE_FILE);
  try {
    await fs.promises.copyFile(CORE_PATH, destFile);
  } catch (err) {
    console.error("Error copying core file:", err);
  }
}

async function compressFolder(sourceDir, targetFile) {
  const targetPath = path.join(ZIP_TARGET_FOLDER, targetFile);
  const zip = new AdmZip();
  zip.addLocalFolder(sourceDir);
  zip.writeZip(targetPath);
}