#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");

async function downloadFile(url) {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer", // fontos: bináris fájlhoz
      maxRedirects: 5,              // biztos ami biztos, követi a redirecteket
    });
    return response.data;
  } catch (error) {
    throw new Error(`Hiba a letöltés során: ${error.message}`);
  }
}

(async () => {
  try {
    const rootDir = path.resolve(__dirname, "..");
    const releasesPath = path.join(rootDir, "dist", "resources", "files", "releases.json");
    const buildPublicDir = path.join(rootDir, "dist/resources/files/for-download/xmlui");

    const releasesRaw = await fs.readFile(releasesPath, "utf8");
    const releases = JSON.parse(releasesRaw);

    if (!Array.isArray(releases) || releases.length === 0) {
      throw new Error("Nincsenek release-ek a releases.json fájlban.");
    }

    const latest = releases[0]?.assets?.[0];
    if (!latest) {
      throw new Error("Nem található elérhető asset a legfrissebb release-ben.");
    }

    const { browser_download_url } = latest;
    if (!browser_download_url) {
      throw new Error("Hiányzik a 'browser_download_url' mező.");
    }

    const filename = "xmlui-standalone.umd.js";
    const outputPath = path.join(buildPublicDir, filename);

    console.log(`🔽 Letöltés: ${browser_download_url}`);
    const fileBuffer = await downloadFile(browser_download_url);

    await fs.mkdir(buildPublicDir, { recursive: true });
    await fs.writeFile(outputPath, fileBuffer);

    console.log(`✅ Fájl elmentve: ${outputPath}`);
  } catch (err) {
    console.error("❌ Hiba:", err.message);
    process.exit(1);
  }
})();
