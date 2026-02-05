import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import classnames from "classnames";

import { useAppContext } from "../../components-core/AppContext";
import { LinkNative } from "../Link/LinkNative";
import { Text } from "../Text/TextNative";
import { Heading } from "../Heading/HeadingNative";
import { Image } from "../Image/ImageNative";
import { Markdown } from "../Markdown/MarkdownNative";
import { TableOfContents } from "../TableOfContents/TableOfContentsNative";
import { Tabs } from "../Tabs/TabsNative";
import { TabItemComponent } from "../Tabs/TabItemNative";
import { FlowLayout, FlowItemWrapper } from "../FlowLayout/FlowLayoutNative";
import styles from "./Blog.module.scss";

type BlogPost = {
  title: string;
  slug: string;
  description: string;
  author: string;
  date: string;
  image?: string;
  tags?: string[];
  draft?: boolean;
};

type BlogConfig = true | { layout?: "basic" | "featuredWithTabs" };

function formatDate(dateStr: string, format?: string): string {
  if (typeof globalThis !== "undefined" && typeof (globalThis as any).formatDate === "function") {
    return (globalThis as any).formatDate(dateStr, format);
  }
  const d = new Date(dateStr);
  if (format === "d MMM yyyy") {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  return d.toLocaleDateString();
}

function getBlurb(md: string | undefined, maxLen = 200): string {
  if (!md) return "";
  if (typeof globalThis !== "undefined" && typeof (globalThis as any).getBlurb === "function") {
    return (globalThis as any).getBlurb(md, maxLen);
  }
  const lines = md.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t && !t.startsWith("#") && !t.startsWith("```")) return t.slice(0, maxLen);
  }
  return "";
}

const gap = "1rem";
const blogBasePath = "/blog";

type Props = {
  className?: string;
  style?: CSSProperties;
};

export function Blog({ className, style }: Props) {
  const { slug } = useParams<{ slug?: string }>();
  const { appGlobals, mediaSize } = useAppContext();

  const posts = (appGlobals?.posts as BlogPost[] | undefined) || [];
  const blogConfig = appGlobals?.blog as BlogConfig | undefined;
  const prefetchedContent = (appGlobals?.prefetchedContent as Record<string, string> | undefined) || {};

  const sortedPosts = useMemo(
    () =>
      posts
        .filter((p) => !p.draft)
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
    [posts],
  );

  const allTags = useMemo(
    () =>
      [...new Set(sortedPosts.flatMap((p) => p.tags || []))].sort(),
    [sortedPosts],
  );

  const layout = useMemo(() => {
    if (!blogConfig) return null;
    if (blogConfig === true) return "basic";
    return blogConfig.layout || "basic";
  }, [blogConfig]);

  if (!blogConfig || !layout) {
    return null;
  }

  if (slug) {
    const post = sortedPosts.find((p) => p.slug === slug);
    if (!post) return null;
    return (
      <BlogPostView
        post={post}
        prefetchedContent={prefetchedContent}
        blogBasePath={blogBasePath}
        formatDate={formatDate}
        className={className}
        style={style}
        mediaSize={mediaSize}
      />
    );
  }

  if (layout === "featuredWithTabs") {
    return (
      <BlogListViewFeatured
        sortedPosts={sortedPosts}
        allTags={allTags}
        prefetchedContent={prefetchedContent}
        blogBasePath={blogBasePath}
        formatDate={formatDate}
        getBlurb={getBlurb}
        className={className}
        style={style}
      />
    );
  }

  return (
    <BlogListViewBasic
      sortedPosts={sortedPosts}
      prefetchedContent={prefetchedContent}
      blogBasePath={blogBasePath}
      formatDate={formatDate}
      getBlurb={getBlurb}
      className={className}
      style={style}
    />
  );
}

function BlogPostView({
  post,
  prefetchedContent,
  blogBasePath,
  formatDate: fmt,
  className,
  style,
  mediaSize,
}: {
  post: BlogPost;
  prefetchedContent: Record<string, string>;
  blogBasePath: string;
  formatDate: (d: string, f?: string) => string;
  className?: string;
  style?: CSSProperties;
  mediaSize: { sizeIndex: number };
}) {
  const markdownContent = prefetchedContent[`/blog/${post.slug}.md`];
  const showToc = mediaSize.sizeIndex > 3;

  return (
    <div className={classnames("xmlui-blog-post", className)} style={{ display: "flex", flexDirection: "column", gap, marginTop: gap, ...style }}>
      <LinkNative to={blogBasePath}>← Go to all posts</LinkNative>
      <div style={{ display: "flex", flexDirection: "row", gap: "1.25rem", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {post.tags && post.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 13,
                      padding: "2px 6px",
                      borderRadius: 4,
                      backgroundColor: "var(--xmlui-color-surface-100, #f0f0f0)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <Heading level="h1" showAnchor={false} style={{ fontSize: 32 }}>
              {post.title}
            </Heading>
            <Text variant="description" style={{ fontSize: 24 }} maxLines={4} ellipses>
              {post.description}
            </Text>
          </div>
          <Text variant="info">
            {post.author} • {fmt(post.date, "d MMM yyyy")}
          </Text>
          {post.image && (
            <Image src={`/blog/images/${post.image}`} alt="" />
          )}
          {markdownContent != null && (
            <Markdown showHeadingAnchors>{markdownContent}</Markdown>
          )}
        </div>
        {showToc && (
          <div style={{ width: "16rem", flexShrink: 0 }}>
            <TableOfContents
              scrollStyle="whenScrolling"
              showScrollerFade
              omitH1
              maxHeadingLevel={3}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({
  post,
  blogBasePath,
  formatDate: fmt,
  getBlurb: blurbFn,
  prefetchedContent,
  compact,
}: {
  post: BlogPost;
  blogBasePath: string;
  formatDate: (d: string, f?: string) => string;
  getBlurb: (md: string | undefined, max?: number) => string;
  prefetchedContent: Record<string, string>;
  compact?: boolean;
}) {
  const blurb = blurbFn(prefetchedContent[`/blog/${post.slug}.md`]);
  return (
    <LinkNative to={`${blogBasePath}/${post.slug}`} active>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: compact ? "0.5rem" : "0.75rem",
          height: "100%",
          minHeight: 0,
          width: "100%",
          padding: compact ? "1rem" : "1.75rem",
          borderRadius: 8,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Text variant="info">
            {post.author} • {fmt(post.date, "d MMM yyyy")}
          </Text>
          <Heading level="h2" showAnchor={false} style={{ fontSize: compact ? 18 : 24 }}>
            {post.title}
          </Heading>
          <Text variant="description" maxLines={4} ellipses>
            {post.description}
          </Text>
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 12,
                    padding: "2px 6px",
                    borderRadius: 4,
                    backgroundColor: "var(--xmlui-color-surface-100, #f0f0f0)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {!compact && blurb && (
          <Text variant="blurb" maxLines={4} ellipses>
            {blurb}
          </Text>
        )}
        <div style={{ marginTop: "auto" }}>
          <LinkNative to={`${blogBasePath}/${post.slug}`}>Read more →</LinkNative>
        </div>
      </div>
    </LinkNative>
  );
}

function BlogListViewBasic({
  sortedPosts,
  prefetchedContent,
  blogBasePath,
  formatDate,
  getBlurb,
  className,
  style,
}: {
  sortedPosts: BlogPost[];
  prefetchedContent: Record<string, string>;
  blogBasePath: string;
  formatDate: (d: string, f?: string) => string;
  getBlurb: (md: string | undefined, max?: number) => string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={classnames("xmlui-blog-list-basic", className)} style={{ marginTop: gap, ...style }}>
      <Heading level="h1" showAnchor={false} style={{ textAlign: "center", fontSize: 42 }}>
        Blog
      </Heading>
      <FlowLayout columnGap={gap} rowGap="1.5rem" style={{ marginTop: gap }}>
        {sortedPosts.map((post) => (
          <FlowItemWrapper key={post.slug} width="100%">
            <PostCard
              post={post}
              blogBasePath={blogBasePath}
              formatDate={formatDate}
              getBlurb={getBlurb}
              prefetchedContent={prefetchedContent}
            />
          </FlowItemWrapper>
        ))}
      </FlowLayout>
    </div>
  );
}

function BlogListViewFeatured({
  sortedPosts,
  allTags,
  prefetchedContent,
  blogBasePath,
  formatDate,
  getBlurb,
  className,
  style,
}: {
  sortedPosts: BlogPost[];
  allTags: string[];
  prefetchedContent: Record<string, string>;
  blogBasePath: string;
  formatDate: (d: string, f?: string) => string;
  getBlurb: (md: string | undefined, max?: number) => string;
  className?: string;
  style?: CSSProperties;
}) {
  const latestPost = sortedPosts[0];
  const postsByTag = (tag: string) =>
    sortedPosts.filter((p) => p.tags && p.tags.includes(tag));

  return (
    <div className={classnames("xmlui-blog-list-featured", className)} style={{ marginTop: gap, display: "flex", flexDirection: "column", gap: "2rem", ...style }}>
      <Heading level="h1" showAnchor={false} style={{ textAlign: "center", fontSize: 42 }}>
        Blog
      </Heading>

      {latestPost && (
        <div
          className={styles.featuredPost}
          style={{
            padding: "1.75rem",
            borderRadius: 8,
            backgroundColor: "var(--xmlui-backgroundColor-Card, #fff)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {latestPost.image && (
            <Image src={`/blog/images/${latestPost.image}`} alt="" style={{ width: "100%" }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Text variant="info">
              {latestPost.author} • {formatDate(latestPost.date, "d MMM yyyy")}
            </Text>
            <Heading level="h2" showAnchor={false} style={{ fontSize: 24 }}>
              {latestPost.title}
            </Heading>
            <Text variant="description">
              {latestPost.description}
            </Text>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <LinkNative to={`${blogBasePath}/${latestPost.slug}`}>Read more →</LinkNative>
          </div>
        </div>
      )}

      <div className={styles.sectionAllPosts}>
        <Heading level="h2" showAnchor={false} style={{ fontSize: "1.25rem" }}>
          All blog posts
        </Heading>

        <Tabs>
          <TabItemComponent label="All posts">
            <div className={styles.postsGrid}>
              {sortedPosts.map((post) => (
                <div key={post.slug} className={styles.postsGridItem}>
                  <PostCard
                    post={post}
                    blogBasePath={blogBasePath}
                    formatDate={formatDate}
                    getBlurb={getBlurb}
                    prefetchedContent={prefetchedContent}
                    compact
                  />
                </div>
              ))}
            </div>
          </TabItemComponent>
          {allTags.map((tag) => (
            <TabItemComponent key={tag} label={tag}>
              <div className={styles.postsGrid}>
                {postsByTag(tag).map((post) => (
                  <div key={post.slug} className={styles.postsGridItem}>
                    <PostCard
                      post={post}
                      blogBasePath={blogBasePath}
                      formatDate={formatDate}
                      getBlurb={getBlurb}
                      prefetchedContent={prefetchedContent}
                      compact
                    />
                  </div>
                ))}
              </div>
            </TabItemComponent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
