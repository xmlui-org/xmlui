import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import classnames from "classnames";

import { useAppContext } from "../../components-core/AppContext";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { ThemedLinkNative as LinkNative } from "../Link/Link";
import { ThemedText as Text } from "../Text/Text";
import { ThemedHeading as Heading } from "../Heading/Heading";
import { ThemedImage as Image } from "../Image/Image";
import { Markdown } from "../Markdown/MarkdownNative";
import { TableOfContents } from "../TableOfContents/TableOfContentsNative";
import { Tabs } from "../Tabs/TabsNative";
import { TabItemComponent } from "../Tabs/TabItemNative";
import { ThemedFlowLayout as FlowLayout, FlowItemWrapper } from "../FlowLayout/FlowLayout";
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

type BlogConfig = {
  posts: BlogPost[];
};

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

const blogBasePath = "/blog";

type Props = {
  className?: string;
  style?: CSSProperties;
};

export function Blog({ className, style }: Props) {
  const { slug } = useParams<{ slug?: string }>();
  const { appGlobals, mediaSize } = useAppContext();
  const { getThemeVar } = useTheme();

  const blogConfig = appGlobals?.blog as BlogConfig | undefined;
  const prefetchedContent = (appGlobals?.prefetchedContent as Record<string, string> | undefined) || {};

  const layout = (getThemeVar("layout") as "basic" | "featuredWithTabs" | undefined) ?? "basic";
  const tableOfContentsEnabled = getThemeVar("tableOfContents") !== "false";
  const showTagsEnabled = getThemeVar("tags") !== "false";

  const sortedPosts = useMemo(
    () =>
      (Array.isArray(blogConfig?.posts) ? blogConfig.posts : [])
        .filter((p) => !p.draft)
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
    [blogConfig?.posts],
  );

  const allTags = useMemo(
    () =>
      [...new Set(sortedPosts.flatMap((p) => p.tags || []))].sort(),
    [sortedPosts],
  );

  if (!blogConfig || !Array.isArray(blogConfig.posts) || blogConfig.posts.length === 0) {
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
        showToc={tableOfContentsEnabled && mediaSize.sizeIndex > 3}
        showTags={showTagsEnabled}
      />
    );
  }

  if (layout === "featuredWithTabs") {
    return (
      <BlogListViewFeatured
        sortedPosts={sortedPosts}
        allTags={allTags}
        showTags={showTagsEnabled}
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
      showTags={showTagsEnabled}
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
  showToc,
  showTags = true,
}: {
  post: BlogPost;
  prefetchedContent: Record<string, string>;
  blogBasePath: string;
  formatDate: (d: string, f?: string) => string;
  className?: string;
  style?: CSSProperties;
  showToc: boolean;
  showTags?: boolean;
}) {
  const markdownContent = prefetchedContent[`/blog/${post.slug}.md`];

  return (
    <div className={classnames("xmlui-blog-post", styles.postRoot, className)} style={style}>
      <LinkNative to={blogBasePath}>← Go to all posts</LinkNative>
      <div className={styles.postRow}>
        <div
          className={classnames(styles.postContent, !showToc && styles.postContentNoToc)}
        >
          <div className={styles.postMeta}>
            {showTags && post.tags && post.tags.length > 0 && (
              <div className={styles.postTagsRow}>
                {post.tags.map((tag) => (
                  <span key={tag} className={styles.postTag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <Heading level="h1" showAnchor={false} className={styles.postTitle}>
              {post.title}
            </Heading>
            <Text variant="description" className={styles.postDescriptionLarge} maxLines={4} ellipses>
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
          <div className={styles.postTocSidebar}>
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
  showTags = true,
}: {
  post: BlogPost;
  blogBasePath: string;
  formatDate: (d: string, f?: string) => string;
  getBlurb: (md: string | undefined, max?: number) => string;
  prefetchedContent: Record<string, string>;
  compact?: boolean;
  showTags?: boolean;
}) {
  const blurb = blurbFn(prefetchedContent[`/blog/${post.slug}.md`]);
  return (
    <LinkNative to={`${blogBasePath}/${post.slug}`} active>
      <div
        className={classnames(styles.postCard, compact && styles.postCardCompact)}
      >
        <div className={styles.postCardInner}>
          <Text variant="info">
            {post.author} • {fmt(post.date, "d MMM yyyy")}
          </Text>
          <Heading level="h2" showAnchor={false} className={styles.postCardTitle}>
            {post.title}
          </Heading>
          <Text variant="description" maxLines={4} ellipses>
            {post.description}
          </Text>
          {showTags && post.tags && post.tags.length > 0 && (
            <div className={styles.postTagsRow}>
              {post.tags.map((tag) => (
                <span key={tag} className={styles.postCardTag}>
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
        <div className={styles.postCardReadMore}>
          <LinkNative to={`${blogBasePath}/${post.slug}`}>Read more →</LinkNative>
        </div>
      </div>
    </LinkNative>
  );
}

function FeaturedStylePostItem({
  post,
  blogBasePath,
  formatDate: fmt,
  getBlurb: blurbFn,
  prefetchedContent,
  showTags = true,
}: {
  post: BlogPost;
  blogBasePath: string;
  formatDate: (d: string, f?: string) => string;
  getBlurb: (md: string | undefined, max?: number) => string;
  prefetchedContent: Record<string, string>;
  showTags?: boolean;
}) {
  const blurb = blurbFn(prefetchedContent[`/blog/${post.slug}.md`]);
  return (
    <LinkNative to={`${blogBasePath}/${post.slug}`} active>
      <div className={styles.featuredStylePost}>
        <div className={styles.featuredStylePostInner}>
          <Text variant="info">
            {post.author} • {fmt(post.date, "d MMM yyyy")}
          </Text>
          <Heading level="h2" showAnchor={false} className={styles.featuredStylePostTitle}>
            {post.title}
          </Heading>
          {showTags && post.tags && post.tags.length > 0 && (
            <div className={styles.postTagsRow}>
              {post.tags.map((tag) => (
                <span key={tag} className={styles.postCardTag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {blurb && (
          <Text variant="blurb" maxLines={4} ellipses>
            {blurb}
          </Text>
        )}
        <div className={styles.featuredPostReadMore}>
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
  showTags,
  className,
  style,
}: {
  sortedPosts: BlogPost[];
  prefetchedContent: Record<string, string>;
  blogBasePath: string;
  formatDate: (d: string, f?: string) => string;
  getBlurb: (md: string | undefined, max?: number) => string;
  showTags: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={classnames("xmlui-blog-list-basic", styles.listBasicRoot, className)} style={style}>
      <Heading level="h1" showAnchor={false} className={styles.listTitle}>
        Blog
      </Heading>
      <FlowLayout columnGap="1rem" rowGap="1.5rem" className={styles.listBasicFlow}>
        {sortedPosts.map((post) => (
          <FlowItemWrapper key={post.slug} width="100%">
            <PostCard
              post={post}
              blogBasePath={blogBasePath}
              formatDate={formatDate}
              getBlurb={getBlurb}
              prefetchedContent={prefetchedContent}
              showTags={showTags}
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
  showTags = true,
  prefetchedContent,
  blogBasePath,
  formatDate,
  getBlurb,
  className,
  style,
}: {
  sortedPosts: BlogPost[];
  allTags: string[];
  showTags?: boolean;
  prefetchedContent: Record<string, string>;
  blogBasePath: string;
  formatDate: (d: string, f?: string) => string;
  getBlurb: (md: string | undefined, max?: number) => string;
  className?: string;
  style?: CSSProperties;
}) {
  const latestPost = useMemo(
    () =>
      sortedPosts.length === 0
        ? undefined
        : sortedPosts.reduce((latest, p) =>
            Date.parse(p.date) > Date.parse(latest.date) ? p : latest,
          ),
    [sortedPosts],
  );
  const latestPostBlurb = latestPost ? getBlurb(prefetchedContent[`/blog/${latestPost.slug}.md`]) : "";
  const postsByTag = (tag: string) =>
    sortedPosts.filter((p) => p.tags && p.tags.includes(tag));

  return (
    <div className={classnames("xmlui-blog-list-featured", styles.listFeaturedRoot, className)} style={style}>
      <Heading level="h1" showAnchor={false} className={styles.listTitle}>
        Blog
      </Heading>

      {latestPost && (
        <LinkNative to={`${blogBasePath}/${latestPost.slug}`} active>
          <div className={styles.featuredPost}>
            <div className={styles.featuredPostInner}>
              <Text variant="info">
                {latestPost.author} • {formatDate(latestPost.date, "d MMM yyyy")}
              </Text>
              <Heading level="h2" showAnchor={false} className={styles.featuredPostTitle}>
                {latestPost.title}
              </Heading>
              <Text variant="description">
                {latestPost.description}
              </Text>
              {showTags && latestPost.tags && latestPost.tags.length > 0 && (
                <div className={styles.postTagsRow}>
                  {latestPost.tags.map((tag) => (
                    <span key={tag} className={styles.postCardTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {latestPostBlurb && (
              <Text variant="blurb" maxLines={4} ellipses>
                {latestPostBlurb}
              </Text>
            )}
            <div className={styles.featuredPostReadMore}>
              Read more →
            </div>
          </div>
        </LinkNative>
      )}

      <div className={styles.sectionAllPosts}>
        <Heading level="h2" showAnchor={false} className={styles.sectionAllPostsHeading}>
          All blog posts
        </Heading>

        <Tabs className={styles.blogTabs}>
          <TabItemComponent label="All posts">
            <div className={styles.postsGrid}>
              {sortedPosts.map((post) => (
                <div key={post.slug} className={styles.postsGridItem}>
                  <FeaturedStylePostItem
                    post={post}
                    blogBasePath={blogBasePath}
                    formatDate={formatDate}
                    getBlurb={getBlurb}
                    prefetchedContent={prefetchedContent}
                    showTags={showTags}
                  />
                </div>
              ))}
            </div>
          </TabItemComponent>
          {showTags &&
            allTags.map((tag) => (
              <TabItemComponent key={tag} label={tag}>
                <div className={styles.postsGrid}>
                  {postsByTag(tag).map((post) => (
                    <div key={post.slug} className={styles.postsGridItem}>
                      <FeaturedStylePostItem
                        post={post}
                        blogBasePath={blogBasePath}
                        formatDate={formatDate}
                        getBlurb={getBlurb}
                        prefetchedContent={prefetchedContent}
                        showTags={showTags}
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
