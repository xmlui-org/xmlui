const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://docs.xmlui.org';

// Extract all <Page url="..."> declarations from Main.xmlui
function extractPageUrls() {
  const mainXmluiPath = path.join(__dirname, '../src/Main.xmlui');
  const content = fs.readFileSync(mainXmluiPath, 'utf8');

  const urls = new Set();

  // Match explicit Page url values (not wildcards)
  const pageMatches = content.matchAll(/<Page\s+url="([^"]+)"/g);
  for (const match of pageMatches) {
    const url = match[1];
    // Skip wildcard routes and the 404 page
    if (url.includes('*') || url === '/404') continue;
    // Skip redirects — find if the Page contains a <Redirect> child
    const pageStart = match.index;
    const pageEnd = content.indexOf('</Page>', pageStart);
    const pageContent = content.substring(pageStart, pageEnd);
    if (pageContent.includes('<Redirect')) continue;

    urls.add(url);
  }

  return urls;
}

// Scan component .md files to generate /components/ComponentName URLs
function extractComponentUrls() {
  const urls = [];
  const componentsDir = path.join(__dirname, '../content/components');

  // Top-level components
  const files = fs.readdirSync(componentsDir);
  for (const file of files) {
    const filePath = path.join(componentsDir, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile() && file.endsWith('.md') && !file.startsWith('_')) {
      const name = file.replace('.md', '');
      urls.push(`/components/${name}`);
    }
  }

  return urls;
}

// Scan extension directories for /extensions/pkg/ComponentName URLs
function extractExtensionUrls() {
  const urls = [];
  const componentsDir = path.join(__dirname, '../content/components');

  const entries = fs.readdirSync(componentsDir);
  for (const entry of entries) {
    const entryPath = path.join(componentsDir, entry);
    const stat = fs.statSync(entryPath);
    if (stat.isDirectory() && entry.startsWith('xmlui-')) {
      const extFiles = fs.readdirSync(entryPath);
      for (const file of extFiles) {
        if (file.endsWith('.md') && !file.startsWith('_')) {
          const name = file.replace('.md', '');
          urls.push(`/extensions/${entry}/${name}`);
        }
      }
    }
  }

  return urls;
}

// Generate sitemap XML
function generateSitemap(urls) {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const url of urls) {
    const fullUrl = url === '/' ? SITE_URL : `${SITE_URL}${url}`;
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

function main() {
  try {
    console.log('Generating sitemap...');

    // Collect all URLs
    const pageUrls = extractPageUrls();
    const componentUrls = extractComponentUrls();
    const extensionUrls = extractExtensionUrls();

    // Merge all into a sorted list
    const allUrls = new Set([...pageUrls, ...componentUrls, ...extensionUrls]);
    const sortedUrls = [...allUrls].sort();

    console.log(`Found ${sortedUrls.length} URLs:`);
    console.log(`  - ${pageUrls.size} from Page declarations`);
    console.log(`  - ${componentUrls.length} component pages`);
    console.log(`  - ${extensionUrls.length} extension pages`);

    const sitemapContent = generateSitemap(sortedUrls);
    const outputPath = path.join(__dirname, '../public/sitemap.xml');

    fs.writeFileSync(outputPath, sitemapContent);
    console.log(`Sitemap generated: ${outputPath}`);
    console.log(`Will be available at: ${SITE_URL}/sitemap.xml`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { extractPageUrls, extractComponentUrls, extractExtensionUrls, generateSitemap };
