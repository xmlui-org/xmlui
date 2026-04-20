import { createMetadata, parseScssVar, wrapComponent, type ComponentMetadata } from "xmlui";
import styles from "./Breadcrumbs.module.scss";
import { Breadcrumbs, defaultProps } from "./BreadcrumbsNative";

const COMP = "Breadcrumbs";

export const BreadcrumbsMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description:
    "Breadcrumb navigation rendered from the current route's `linkInfo` " +
    "(label and `pathSegments`).",
  props: {
    useDefault: {
      description:
        "When true, shows a static `Documentation > Learn XMLUI > Introduction` " +
        "trail. Use this on landing pages where no route-specific `linkInfo` is available.",
      valueType: "boolean",
      defaultValue: defaultProps.useDefault,
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

export const breadcrumbsRenderer = wrapComponent(COMP, Breadcrumbs, BreadcrumbsMd, {
  booleans: ["useDefault"],
});
