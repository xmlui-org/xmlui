import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { sortByVersion, XMLUI_STANDALONE_PATTERN } from "./utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getLatestAssetUrl(): Promise<string> {
  const per_page = 100;
  const max_releases = 100;

  const url = `https://api.github.com/repos/xmlui-org/xmlui/releases?per_page=${per_page}`;

  const headers: Record<string, string> = {};
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const releases = (await res.json()) as any[];

  const xmluiReleases = releases
    .filter((r) => r?.tag_name?.startsWith("xmlui@"))
    .sort(sortByVersion);

  const releasesToProcess = xmluiReleases.slice(0, max_releases);

  for (const release of releasesToProcess) {
    const xmluiStandaloneAsset = (release.assets || []).find((asset: any) =>
      XMLUI_STANDALONE_PATTERN.test(asset.name),
    );
    if (xmluiStandaloneAsset) {
      return xmluiStandaloneAsset.browser_download_url;
    }
  }
  throw new Error("No matching standalone asset found in the latest releases");
}

async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
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
    console.error("Error updating xmlui-standalone.umd.js. Leaving the file as-is.");
    console.error(err);
  }
})();
