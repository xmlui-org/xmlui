import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import { Blog } from "./BlogNative";

const COMP = "Blog";

export const BlogMd = createMetadata({
  status: "stable",
  description:
    "`Blog` renders blog list or a single post based on the current route and " +
    "appGlobals.blog / appGlobals.posts. When appGlobals.blog is set (e.g. true or { layout: \"basic\" } or { layout: \"featuredWithTabs\" }), " +
    "it shows the list view; when the route has a slug (e.g. /blog/:slug), it shows the post. " +
    "Requires appGlobals.posts to be set.",
  props: {},
});

export const blogComponentRenderer = createComponentRenderer(
  COMP,
  BlogMd,
  ({ className }) => {
    return <Blog className={className} />;
  },
);
