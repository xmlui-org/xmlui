import { basicLayoutRenderer } from "./layouts/BasicLayout";
import { featuredWithTabsLayoutRenderer } from "./layouts/FeaturedWithTabsLayout";

export default {
  namespace: "XMLUIExtensions",
  components: [basicLayoutRenderer, featuredWithTabsLayoutRenderer],
};
