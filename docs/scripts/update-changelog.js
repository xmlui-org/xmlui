#!/usr/bin/env node

const { Octokit } = require("@octokit/rest");
const { createOAuthAppAuth } = require("@octokit/auth-oauth-app");
const fs = require("fs").promises;
const path = require("path");

// Parse CLI arguments
const args = process.argv.slice(2);
const outputFileIndex = args.indexOf("--output");
const outputFile =
  outputFileIndex !== -1 && args[outputFileIndex + 1] ? args[outputFileIndex + 1] : null;

const OWNER = process.env.GITHUB_REPOSITORY?.split("/")[0] || "xmlui-org";
const REPO = process.env.GITHUB_REPOSITORY?.split("/")[1] || "xmlui";
const XMLUI_STANDALONE_PATTERN = /xmlui-\d+\.\d+\.\d+\w*\.js/;

function initializeOctokit() {
  if (process.env.GITHUB_TOKEN) {
    console.error("Using GitHub token authentication...");
    return new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  } else {
    console.error(
      "No GitHub token provided. To access GitHub API, please set the GITHUB_TOKEN environment variable (it can be your Personal Access Token as well).",
    );
    return null;
  }
}

async function getXmluiReleases() {
  try {
    const releaseStr = await fs.readFile(path.join(__dirname, "..", "releases.json"));
    const releases = JSON.parse(releaseStr);
    // temporarily disabled, in favor of the 2 lines above but will be enabled when I'm done with the rest of the work
    // const octokit = initializeOctokit();
    // const { data: releases } = await octokit.rest.repos.listReleases({
    //   owner: OWNER,
    //   repo: REPO,
    // });

    const xmluiReleases = releases.filter((release) => release.tag_name.startsWith("xmlui@"));

    const availableVersions = [];

    for (const release of xmluiReleases) {
      const xmluiStandaloneAsset = release.assets.find((asset) =>
        XMLUI_STANDALONE_PATTERN.test(asset.name),
      );

      if (xmluiStandaloneAsset) {
        availableVersions.push({
          tag_name: release.tag_name,
          body: release.body,
          assets: [
            {
              name: xmluiStandaloneAsset.name,
              browser_download_url: xmluiStandaloneAsset.browser_download_url,
            },
          ],
        });
      }
    }

    return availableVersions;
  } catch (error) {
    console.error("Error fetching xmlui releases:", error.message);
    if (error.status === 401) {
      console.error("Authentication failed. Please check your GitHub token or OAuth credentials.");
    } else if (error.status === 403) {
      console.error("Rate limit exceeded or insufficient permissions.");
    }
    return [];
  }
}

async function writeReleases() {
  try {
    console.error("Fetching releases from GitHub API...");

    const releases = await getXmluiReleases();

    const downloadsData = releases;

    console.error(`Found ${releases.length} xmlui releases`);

    if (outputFile === null || args.includes("--stdout")) {
      console.log(JSON.stringify(downloadsData, null, 2));
    } else {
      // Ensure output directory exists
      const outputDir = path.dirname(outputFile);
      await fs.mkdir(outputDir, { recursive: true });

      // Write to file
      await fs.writeFile(outputFile, JSON.stringify(downloadsData, null, 2), "utf8");
      console.error(`Successfully updated ${outputFile}`);
    }
  } catch (error) {
    console.error("Error updating downloads.json:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  writeReleases();
}
