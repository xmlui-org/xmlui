#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const { sortByVersion, XMLUI_STANDALONE_PATTERN } = require("./utils.js");

const getLatestAssetUrl = async () => {
  try {
    const per_page = 100;
    const max_releases = 100;

    const url = `https://api.github.com/repos/xmlui-org/xmlui/releases?per_page=${per_page}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    /** @type {Array<any>} */
    const releases = await res.json();

    const xmluiReleases = releases
      .filter((r) => r?.tag_name?.startsWith("xmlui@"))
      .sort(sortByVersion);

    const releasesToProcess = xmluiReleases.slice(0, max_releases);

    for (const release of releasesToProcess) {
      const xmluiStandaloneAsset = (release.assets || []).find((asset) =>
        XMLUI_STANDALONE_PATTERN.test(asset.name),
      );
      return xmluiStandaloneAsset.browser_download_url;
    }
    throw new Error("No matching standalone asset found in the latest releases");
  } catch (e) {
    console.error("Error fetching latest release", e);
    throw e;
  }
};

async function downloadFile(url) {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      maxRedirects: 5,
    });
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
}

(async () => {
  try {
    const rootDir = path.resolve(__dirname, "..");
    const buildPublicDir = path.join(rootDir, "/public/resources/files/for-download/xmlui");
    const browser_download_url = await getLatestAssetUrl();

    if (!browser_download_url) {
      throw new Error("Missing browser_download_url");
    }

    const filename = "xmlui-standalone.umd.js";
    const outputPath = path.join(buildPublicDir, filename);

    const fileBuffer = await downloadFile(browser_download_url);

    await fs.mkdir(buildPublicDir, { recursive: true });
    await fs.writeFile(outputPath, fileBuffer);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();
