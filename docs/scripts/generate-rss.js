const fs = require('fs');
const path = require('path');

// Extract blog titles from Main.xmlui
function extractBlogTitles(content) {
  try {
    // Find the blogTitles variable definition - extract content between outer braces
    const blogTitlesMatch = content.match(/var\.blogTitles="\s*\{\s*(\{[^}]*\})\s*\}"/);
    if (blogTitlesMatch) {
      const blogTitlesJson = blogTitlesMatch[1];
      // Convert XMLUI object syntax to JSON
      const jsonString = blogTitlesJson
        .replace(/(\w+):\s*'([^']*)'/g, '"$1": "$2"') // Convert 'key': 'value' to "key": "value"
        .replace(/(\w+):\s*"([^"]*)"/g, '"$1": "$2"'); // Convert 'key': "value" to "key": "value"
      return JSON.parse(jsonString);
    }
    return {};
  } catch (error) {
    console.error('Error extracting blog titles:', error.message);
    return {};
  }
}

// Resolve blog title references in a string
function resolveBlogTitles(str, blogTitles) {
  return str.replace(/\{blogTitles\.(\w+)\}/g, (match, varName) => {
    return blogTitles[varName] || match;
  });
}

// Read blog post content and extract first 250 characters
function getPostDescription(url) {
  try {
    // Convert /blog/1.md to public/blog/1.md
    const publicPath = url.replace('/blog/', 'public/blog/');
    const postPath = path.join(__dirname, '..', publicPath);
    const content = fs.readFileSync(postPath, 'utf8');

    // Strip markdown formatting (basic cleanup)
    let plainText = content
      .replace(/^#+\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Remove links, keep text
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '') // Remove images
      .replace(/`([^`]*)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Take first 250 characters, add ellipsis if truncated
    if (plainText.length > 250) {
      return plainText.substring(0, 250) + '...';
    }

    return plainText;
  } catch (error) {
    console.warn(`Warning: Could not read post content for ${url}:`, error.message);
    return '';
  }
}

// Read Main.xmlui and extract blog post metadata
function extractBlogPosts() {
  const mainXmluiPath = path.join(__dirname, '../src/Main.xmlui');
  const content = fs.readFileSync(mainXmluiPath, 'utf8');

  const blogTitles = extractBlogTitles(content);
  const blogPosts = [];

  // Find all BlogPage components with their props
  const blogPageRegex = /<BlogPage\s+([^>]*)\s*\/>/g;
  let match;

  while ((match = blogPageRegex.exec(content)) !== null) {
    const props = match[1];

    // Extract props using regex
    const titleMatch = props.match(/title="([^"]*)"/);
    const authorMatch = props.match(/author="([^"]*)"/);
    const dateMatch = props.match(/date="([^"]*)"/);
    const urlMatch = props.match(/url="([^"]*)"/);

    if (titleMatch && authorMatch && dateMatch && urlMatch) {
      blogPosts.push({
        title: resolveBlogTitles(titleMatch[1], blogTitles),
        author: authorMatch[1],
        date: dateMatch[1],
        url: urlMatch[1]
      });
    }
  }

  return blogPosts;
}

// Convert date string to RFC 822 format for RSS
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toUTCString();
}

// Generate RSS XML
function generateRSS(blogPosts) {
  const now = new Date().toUTCString();

  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>XMLUI Blog</title>
    <link>https://docs.xmlui.org/blog</link>
    <description>Latest updates, tutorials, and insights for XMLUI - the declarative UI framework. Stay informed about new features, best practices, and community highlights.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
`;

  // Sort posts by date (newest first)
  blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

      blogPosts.forEach(post => {
      const pubDate = formatDate(post.date);
      // Extract the blog post number from the URL and create the proper blog URL
      const blogNumber = post.url.match(/\/blog\/(\d+)\.md/)?.[1] || '1';
      const postUrl = `https://docs.xmlui.org/blog-${blogNumber}`;

      // Get the actual post description
      const description = getPostDescription(post.url);

      rss += `
      <item>
        <title>${escapeXml(post.title)}</title>
        <link>${postUrl}</link>
        <description>${escapeXml(description)}</description>
        <pubDate>${pubDate}</pubDate>
        <author>${escapeXml(post.author)}</author>
      </item>`;
    });

  rss += `
  </channel>
</rss>`;

  return rss;
}

// Escape XML special characters
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Main execution
function main() {
  try {
    console.log('Generating RSS feed...');

    const blogPosts = extractBlogPosts();
    console.log(`Found ${blogPosts.length} blog posts`);

    const rssContent = generateRSS(blogPosts);
    const outputPath = path.join(__dirname, '../public/feed.rss');

    fs.writeFileSync(outputPath, rssContent);
    console.log(`RSS feed generated at: ${outputPath}`);

  } catch (error) {
    console.error('Error generating RSS feed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { extractBlogPosts, generateRSS };
