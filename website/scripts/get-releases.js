#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const { exit } = require("process");
const { sortByVersion, XMLUI_STANDALONE_PATTERN } = require("./utils.js");

const MD_HEADING_PATTERN = /^#{1,6} \S/;
const MD_LIST_COMMIT_SHA_PATTERN = /^-\s*[a-f0-9]{6,40}:\s*/;

const DEF_MAX_RELEASES_STR = "10";
if (require.main === module) {
  main();
}

function processEnvVars() {
  const owner = process.env.GITHUB_REPOSITORY?.split("/")[0] || "xmlui-org";
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || "xmlui";
  const maxReleases = process.env.DOCS_XMLUI_MAX_RELEASES_LENGTH;
  return {
    owner,
    repo,
    maxReleases,
  };
}

function processOptions(args) {
  handleHelpOption(args);
  const envVars = processEnvVars();

  const writeToStdout = args.includes("--stdout");

  const outputFile = getOptionValue(args, "--output");

  const maxReleasesStr =
    getOptionValue(args, "--maxReleases") ?? envVars.maxReleases ?? DEF_MAX_RELEASES_STR;
  const maxReleasesParse = parseInt(maxReleasesStr);
  const maxReleases = Number.isNaN(maxReleasesParse)
    ? parseInt(DEF_MAX_RELEASES_STR)
    : maxReleasesParse;

  return {
    ...envVars,
    outputFile,
    writeToStdout,
    maxReleases,
  };
}

async function getXmluiReleases(options) {
  try {
    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit();
    console.error("Fetching releases from GitHub API...");
    const { data: releases } = await octokit.rest.repos.listReleases({
      owner: options.owner,
      repo: options.repo,
    });

    const xmluiReleases = releases.filter((release) => release.tag_name.startsWith("xmlui@"));

    xmluiReleases.sort(sortByVersion);
    const releasesToProcess = xmluiReleases.slice(0, options.maxReleases);

    const availableVersions = [];

    for (const release of releasesToProcess) {
      const xmluiStandaloneAsset = release.assets.find((asset) =>
        XMLUI_STANDALONE_PATTERN.test(asset.name),
      );
      const changes = release.body ? parseBodyIntoChanges(release.body) : [];

      if (xmluiStandaloneAsset) {
        availableVersions.push({
          tag_name: release.tag_name,
          published_at: release.published_at,
          changes: changes,
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
    if (error.status === 403) {
      console.error("Rate limit exceeded or insufficient permissions.");
    }
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options = processOptions(args);
  const outputFile = options.outputFile;

  try {
    const releases = await getXmluiReleases(options);

    console.error(`Got ${releases.length} xmlui releases`);
    if (releases === null) {
      console.error("Failed to fetch xmlui releases. Exiting with code 1.");
      process.exit(1);
    }
    if (outputFile === null || options.writeToStdout) {
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

function getOptionValue(args, optionName) {
  const optionIndex = args.indexOf(optionName);
  if (optionIndex === -1) return null;
  const value = args[optionIndex + 1];
  if (value === undefined) return null;
  if (value.startsWith("--")) return null;
  return value;
}

function handleHelpOption(args) {
  if (args.includes("--help") || args.includes("-h")) {
    const helpMessage = `
  Fetches xmlui release information from GitHub and outputs it in JSON format.

  Usage:
    ./get-releases.js [options]

  Options:
    --output <file>    Specify the path to the output JSON file.
                       If this option is not provided the output will be directed to standard output.
    --stdout           Force the JSON output to standard output.
    --maxReleases      Specify the maximum number of xmlui releases to include.
                       Defaults to ${DEF_MAX_RELEASES_STR}.
    --help, -h         Display this help message and exit.

  Environment Variables:
    GITHUB_REPOSITORY               Optional. The 'owner/repo' string.
                                    Defaults to "xmlui-org/xmlui".
    DOCS_XMLUI_MAX_RELEASES_LENGTH  Optional. The maximum number of xmlui releases to include.
                                    Can be overridden by the --maxReleases command line option.
                                    Defaults to ${DEF_MAX_RELEASES_STR}.
  `;
    console.log(helpMessage.trimStart().trimEnd());
    process.exit(0);
  }
}

/**
 * Parse markdown body into individual changes with commit SHA and description
 * @param {string} body
 * @returns {Array<{description: string, commit_sha: string}>}
 */
function parseBodyIntoChanges(body) {
  const changes = [];
  const lines = body.split("\n");

  for (const line of lines) {
    // Skip markdown headings
    if (MD_HEADING_PATTERN.test(line)) {
      continue;
    }

    // Process list items that may contain commit SHA
    if (line.startsWith("- ")) {
      const match = line.match(MD_LIST_COMMIT_SHA_PATTERN);
      if (match) {
        // Extract commit SHA and description
        const commitSha = match[0].match(/[a-f0-9]{6,40}/)[0];
        const description = line.replace(MD_LIST_COMMIT_SHA_PATTERN, "").trim();
        changes.push({
          description: description,
          commit_sha: commitSha,
        });
      } else {
        // List item without commit SHA
        const description = line.substring(2).trim(); // Remove "- " prefix
        if (description) {
          changes.push({
            description: description,
            commit_sha: null, // No commit SHA available
          });
        }
      }
    }
  }

  return changes;
}
