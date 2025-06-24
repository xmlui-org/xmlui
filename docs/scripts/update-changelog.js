#!/usr/bin/env node

const { Octokit } = require("@octokit/rest");
const fs = require("fs").promises;
const path = require("path");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const OWNER = process.env.GITHUB_REPOSITORY?.split("/")[0] || "xmlui-org";
const REPO = process.env.GITHUB_REPOSITORY?.split("/")[1] || "xmlui";
const XMLUI_STANDALONE_PATTERN = /xmlui-\d+\.\d+\.\d+\w*\.js/;
const DOWNLOADS_FILE = path.join(
  __dirname,
  "..",
  "docs",
  "public",
  "resources",
  "files",
  "downloads",
  "downloads.json",
);

async function getXmluiReleases() {
  try {
    const { data: releases } = await octokit.rest.repos.listReleases({
      owner: OWNER,
      repo: REPO,
    });

    // Filter for xmlui releases (not vscode extension releases)
    const xmluiReleases = releases.filter((release) => release.tag_name.startsWith("xmlui@"));

    const availableVersions = [];

    for (const release of xmluiReleases) {
      const version = release.tag_name.replace("xmlui@", "");

      // Parse changelog from release body
      const changelogs = parseReleaseBody(release.body || "");

      // Find the standalone JS file in assets
      const jsAsset = release.assets.find((asset) => XMLUI_STANDALONE_PATTERN.test(asset.name));

      if (jsAsset) {
        availableVersions.push({
          version,
          changelogs,
          fileName: jsAsset.name,
          fileSize: formatFileSize(jsAsset.size),
        });
      }
    }

    return availableVersions;
  } catch (error) {
    console.error("Error fetching xmlui releases:", error);
    return [];
  }
}

async function updateDownloadsJson() {
  try {
    console.log("Fetching releases from GitHub API...");

    const availableVersions = await getXmluiReleases();

    const downloadsData = availableVersions;

    console.log(`Found ${availableVersions.length} xmlui releases`);

    // Write to downloads.json
    // await fs.writeFile(DOWNLOADS_FILE, JSON.stringify(downloadsData, null, 2), "utf8");
    console.log(JSON.stringify(downloadsData, null, 2));

    console.log("Successfully updated downloads.json");
  } catch (error) {
    console.error("Error updating downloads.json:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  updateDownloadsJson();
}
