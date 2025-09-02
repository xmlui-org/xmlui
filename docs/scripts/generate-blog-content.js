const fs = require('fs');
const path = require('path');

// Extract blog posts data from Main.xmlui's var.posts definition
function extractBlogPosts() {
  const mainXmluiPath = path.join(__dirname, '../src/Main.xmlui');
  const content = fs.readFileSync(mainXmluiPath, 'utf8');

  try {
    // Find the var.posts definition - extract content between backticks
    const postsMatch = content.match(/var\.posts\s*=\s*`\{\{([^`]*)\}\}`/s);
    if (!postsMatch) {
      console.warn('No var.posts found in Main.xmlui');
      return [];
    }

    const postsContent = postsMatch[1].trim();
    const blogPosts = [];

    // Parse each post entry (p1: {...}, p2: {...}, etc.)
    const postMatches = postsContent.match(/(\w+):\s*\{([^}]*)\}/g);

    if (postMatches) {
      postMatches.forEach(postMatch => {
        const [, postKey] = postMatch.match(/(\w+):/);

        // Extract properties from the post object
        const titleMatch = postMatch.match(/title:\s*"([^"]*)"/);
        const slugMatch = postMatch.match(/slug:\s*"([^"]*)"/);
        const authorMatch = postMatch.match(/author:\s*"([^"]*)"/);
        const dateMatch = postMatch.match(/date:\s*"([^"]*)"/);

        if (titleMatch && slugMatch && authorMatch && dateMatch) {
          blogPosts.push({
            key: postKey,
            title: titleMatch[1],
            slug: slugMatch[1],
            author: authorMatch[1],
            date: dateMatch[1]
          });
        }
      });
    }

    return blogPosts;
  } catch (error) {
    console.error('Error extracting blog posts:', error.message);
    return [];
  }
}

// Read blog post content and extract description
function getPostDescription(slug) {
  try {
    const postPath = path.join(__dirname, '../public/blog', `${slug}.md`);
    const content = fs.readFileSync(postPath, 'utf8');

    // Strip markdown formatting for description
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

    // Take first 250 characters for description
    if (plainText.length > 250) {
      return plainText.substring(0, 250).trim() + '...';
    }

    return plainText;
  } catch (error) {
    console.warn(`Warning: Could not read post content for ${slug}:`, error.message);
    return 'Blog post content not available.';
  }
}

// Read blog post content for search indexing
function getPostContent(slug) {
  try {
    const postPath = path.join(__dirname, '../public/blog', `${slug}.md`);
    const content = fs.readFileSync(postPath, 'utf8');
    return content;
  } catch (error) {
    console.warn(`Warning: Could not read post content for ${slug}:`, error.message);
    return '';
  }
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
    <link>https://docs.xmlui.org</link>
    <description>Latest updates, tutorials, and insights for XMLUI - the declarative UI framework. Stay informed about new features, best practices, and community highlights.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
`;

  // Sort posts by date (newest first)
  blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  blogPosts.forEach(post => {
    const pubDate = formatDate(post.date);
    const postUrl = `https://docs.xmlui.org/${post.slug}`;
    const description = getPostDescription(post.slug);

    rss += `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>support@xmlui.org (${escapeXml(post.author)})</author>
      <guid>${postUrl}</guid>
    </item>`;
  });

  rss += `
  </channel>
</rss>`;

  return rss;
}

// Generate search data for blog posts
function generateSearchData(blogPosts) {
  const searchData = {};

  blogPosts.forEach(post => {
    const content = getPostContent(post.slug);
    if (content) {
      // Use the title from metadata, not from first line of content
      const title = post.title;
      const contentWithoutTitle = content.trim();

      // Create search entry with blog post URL
      // Format: first line is title, rest is content (matching search system expectations)
      searchData[`/blog/${post.slug}`] = `${title}\n${contentWithoutTitle}`;
    }
  });

  return searchData;
}

// Escape XML special characters
function escapeXml(text) {
  if (typeof text !== 'string') {
    text = String(text);
  }
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
    console.log('Generating blog content...');

    const blogPosts = extractBlogPosts();
    console.log(`Found ${blogPosts.length} blog post(s)`);

    if (blogPosts.length === 0) {
      console.warn('No blog posts found, creating empty RSS feed');
    } else {
      blogPosts.forEach(post => {
        console.log(`  - "${post.title}" by ${post.author} (${post.date})`);
      });
    }

    // Generate RSS feed
    const rssContent = generateRSS(blogPosts);
    const rssOutputPath = path.join(__dirname, '../public/feed.rss');

    // Generate search data
    const searchData = generateSearchData(blogPosts);
    const searchOutputPath = path.join(__dirname, '../public/blog-search-data.json');

    // Ensure the public directory exists
    const publicDir = path.dirname(rssOutputPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write RSS feed
    fs.writeFileSync(rssOutputPath, rssContent);
    console.log(`RSS feed generated successfully: ${rssOutputPath}`);
    console.log(`Feed will be available at: https://docs.xmlui.org/feed.rss`);

    // Write search data
    fs.writeFileSync(searchOutputPath, JSON.stringify(searchData, null, 2));
    console.log(`Search data generated successfully: ${searchOutputPath}`);
    console.log(`Search data contains ${Object.keys(searchData).length} blog posts`);

  } catch (error) {
    console.error('Error generating blog content:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { extractBlogPosts, generateRSS, generateSearchData, getPostDescription, getPostContent };
