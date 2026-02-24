import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { discoverPaths } from "./discover-urls-coppied-from-ssg.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = "https://docs.xmlui.org";

// Generate sitemap XML
function generateSitemap(urls) {
  const today = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const url of urls) {
    const fullUrl = url === "/" ? SITE_URL : `${SITE_URL}${url}`;
    xml += `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${today}</lastmod>
  </url>
`;
  }

  xml += `</urlset>
`;
  return xml;
}

async function main() {
  try {
    console.log("Generating sitemap...");

    // Collect all URLs via discoverPaths()
    const urls = await discoverPaths();
    const sortedUrls = urls.sort().filter((p) => p !== "/404");

    console.log(`Found ${sortedUrls.length} URLs`);

    const sitemapContent = generateSitemap(sortedUrls);
    const outputPath = path.join(__dirname, "../public/sitemap.xml");

    fs.writeFileSync(outputPath, sitemapContent);
    console.log(`Sitemap generated: ${outputPath}`);
    console.log(`Will be available at: ${SITE_URL}/sitemap.xml`);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    process.exit(1);
  }
}

main();

export { generateSitemap };
