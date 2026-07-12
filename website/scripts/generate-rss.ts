import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface BlogPost {
  key: string;
  title: string;
  slug: string;
  author: string;
  date: string;
}

function extractFrontmatter(content: string): Record<string, string> {
  const frontmatter: Record<string, string> = {};
  const lines = content.split('\n');
  let inFrontmatter = false;

  for (const line of lines) {
    if (line.trim() === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
        continue;
      } else {
        break;
      }
    }

    if (inFrontmatter && line.includes(':')) {
      const colonIndex = line.indexOf(':');
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }

      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

function extractBlogPosts(): BlogPost[] {
  const blogDir = path.join(__dirname, '../content/blog');
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
  const blogPosts: BlogPost[] = [];

  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatter = extractFrontmatter(content);

    if (frontmatter.title && frontmatter.slug && frontmatter.author && frontmatter.date) {
      blogPosts.push({
        key: frontmatter.slug,
        title: frontmatter.title,
        slug: frontmatter.slug,
        author: frontmatter.author,
        date: frontmatter.date
      });
    }
  }

  return blogPosts;
}

function getPostDescription(slug: string): string {
  try {
    const postPath = path.join(__dirname, '../content/blog', `${slug}.md`);
    const content = fs.readFileSync(postPath, 'utf8');

    let plainText = content
      .replace(/^---[\s\S]*?---\n/, '')
      .replace(/^#+\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (plainText.length > 250) {
      return plainText.substring(0, 250).trim() + '...';
    }

    return plainText;
  } catch {
    return 'Blog post content not available.';
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toUTCString();
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateRSS(blogPosts: BlogPost[]): string {
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

  blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const post of blogPosts) {
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
  }

  rss += `
  </channel>
</rss>`;

  return rss;
}

function main() {
  try {
    console.log('Generating RSS feed...');

    const blogPosts = extractBlogPosts();
    console.log(`Found ${blogPosts.length} blog post(s)`);

    if (blogPosts.length === 0) {
      console.warn('No blog posts found, creating empty RSS feed');
    } else {
      for (const post of blogPosts) {
        console.log(`  - "${post.title}" by ${post.author} (${post.date})`);
      }
    }

    const rssContent = generateRSS(blogPosts);
    const outputPath = path.join(__dirname, '../public/feed.rss');

    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, rssContent);
    console.log(`RSS feed generated successfully: ${outputPath}`);
    console.log(`Feed will be available at: https://docs.xmlui.org/feed.rss`);
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    process.exit(1);
  }
}

main();
