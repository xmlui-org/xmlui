import { createMetadata, parseScssVar, wrapComponent, type ComponentMetadata } from "xmlui";
import styles from "./Breadcrumbs.module.scss";
import { Breadcrumbs } from "./BreadcrumbsNative";

const COMP = "Breadcrumbs";

export const BreadcrumbsMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description:
    "Breadcrumb navigation rendered from the current route's `linkInfo` " +
    "(label and `pathSegments`).",
  props: {
    defaultItems: {
      description:
        "Explicit list of breadcrumb items `{ label, to? }`. When provided and " +
        "non-empty, these items are rendered instead of deriving the trail from " +
        "the current route's `linkInfo`. The last item is rendered as the current " +
        "(non-link) page.",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`gap-${COMP}`]: "$space-2",
    [`color-${COMP}`]: "$textColor-secondary",
    [`color-${COMP}--hover`]: "$textColor-primary",
    [`color-${COMP}--current`]: "$textColor-primary",
    [`fontWeight-${COMP}--current`]: "$fontWeight-bold",
  },
});

export const breadcrumbsRenderer = wrapComponent(COMP, Breadcrumbs, BreadcrumbsMd);
