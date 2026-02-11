import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import { Blog } from "./BlogNative";

const COMP = "Blog";

export const BlogMd = createMetadata({
  status: "stable",
  description:
    "`Blog` renders blog list or a single post based on the current route and appGlobals.blog. " +
    "appGlobals.blog must be an object with required `posts` (array of post objects). " +
    "Layout behavior comes from `getLayoutConfig`: `layout` (\"basic\" | \"featuredWithTabs\", default \"basic\"), " +
    "`tableOfContents` (boolean, toggles TOC on post pages), and `tags` (boolean, hides/shows tags; default true). " +
    "When the route has a slug (e.g. /blog/:slug), it shows the post; otherwise the list view.",
  props: {},
});

export const blogComponentRenderer = createComponentRenderer(
  COMP,
  BlogMd,
  ({ className }) => {
    return <Blog className={className} />;
  },
);
