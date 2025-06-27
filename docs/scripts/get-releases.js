#!/usr/bin/env node

const { Octokit } = require("@octokit/rest");
const fs = require("fs").promises;
const path = require("path");
const { exit } = require("process");

// Parse CLI arguments
const args = process.argv.slice(2);
// Handle --help or -h flag
if (args.includes("--help") || args.includes("-h")) {
  const helpMessage = `
Fetches xmlui release information from GitHub and outputs it in JSON format.
This script relies on the GITHUB_TOKEN environment variable for authentication
when fetching data directly from the GitHub API.

Usage:
  ./get-releases.js [options]

Options:
  --output <file>    Specify the path to the output JSON file.
                     If this option is not provided the output will be directed to standard output.
  --stdout           Force the JSON output to standard output.
  --help, -h         Display this help message and exit.

Environment Variables:
  GITHUB_TOKEN        Required for fetching data from the GitHub API.
                      A GitHub Personal Access Token with 'repo' scope (or at least
                      permissions to read repository releases).
                      The script will fail if this is not set
                      and API access is attempted.
  GITHUB_REPOSITORY   Optional. The 'owner/repo' string.
                      Defaults to "xmlui-org/xmlui".
`;
  console.log(helpMessage.trimStart().trimEnd());
  process.exit(0);
}

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
      `No GitHub token provided. Skipping updating releases.
If you want to update the info about the releases, set the GITHUB_TOKEN environment variable to your Personal Access Token`,
    );
    exit(0);
  }
}

async function getXmluiReleases() {
  try {
    const octokit = initializeOctokit();
    console.error("Fetching releases from GitHub API...");
    const { data: releases } = await octokit.rest.repos.listReleases({
      owner: OWNER,
      repo: REPO,
    });

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
      console.error("Authentication failed. Please check your GitHub token");
    } else if (error.status === 403) {
      console.error("Rate limit exceeded or insufficient permissions.");
    }
    return null;
  }
}

async function writeReleases() {
  try {
    const releases = await getXmluiReleases();

    console.error(`Found ${releases.length} xmlui releases`);
    if (releases === null) {
      console.error("Failed to fetch xmlui releases. Exiting with code 1.");
      process.exit(1);
    }
    if (outputFile === null || args.includes("--stdout")) {
      console.log(JSON.stringify(releases, null, 2));
    } else {
      // Ensure output directory exists
      const outputDir = path.dirname(outputFile);
      await fs.mkdir(outputDir, { recursive: true });

      // Write to file
      await fs.writeFile(outputFile, JSON.stringify(releases, null, 2), "utf8");
      console.error(`Successfully updated ${outputFile}`);
    }
  } catch (error) {
    console.error("Error writing release info:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  writeReleases();
}
