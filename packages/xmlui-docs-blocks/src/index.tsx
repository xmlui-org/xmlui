export { shikiHighlighter, highlight } from "./highlighter";
export {
  markdownToPlainText,
  buildContentFromRuntime,
  buildTreeFromPathsAndMeta,
} from "./contentUtils";
export type { TreeNode, MetaJson } from "./contentUtils";

import { basicLayoutRenderer } from "./layouts/BasicLayout";
import { featuredWithTabsLayoutRenderer } from "./layouts/FeaturedWithTabsLayout";
import { overviewCardRenderer } from "./docs/OverviewCard";
import { breadcrumbsRenderer } from "./docs/Breadcrumbs";
import { separatorRenderer } from "./docs/Separator";
import { linkButtonRenderer } from "./docs/LinkButton";
import { documentLinksRenderer } from "./docs/DocumentLinks";
import { documentPageRenderer } from "./docs/DocumentPage";
import { documentPageNoTOCRenderer } from "./docs/DocumentPageNoTOC";
import { tbdRenderer } from "./docs/TBD";
import { sectionHeaderRenderer } from "./docs/SectionHeader";
import { overviewRenderer } from "./docs/Overview";
import { twoColumnCodeRenderer } from "./docs/TwoColumnCode";
import { pageNotFoundRenderer } from "./docs/PageNotFound";

export default {
  namespace: "XMLUIExtensions",
  components: [
    basicLayoutRenderer,
    featuredWithTabsLayoutRenderer,
    overviewCardRenderer,
    breadcrumbsRenderer,
    separatorRenderer,
    linkButtonRenderer,
    documentLinksRenderer,
    documentPageRenderer,
    documentPageNoTOCRenderer,
    tbdRenderer,
    sectionHeaderRenderer,
    overviewRenderer,
    twoColumnCodeRenderer,
    pageNotFoundRenderer,
  ],
};
