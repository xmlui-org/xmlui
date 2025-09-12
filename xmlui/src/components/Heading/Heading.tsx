import type { CSSProperties } from "react";

import styles from "./Heading.module.scss";

import { type ComponentDef } from "../../abstractions/ComponentDefs";
import type { RenderChildFn } from "../../abstractions/RendererDefs";
import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Heading, defaultProps } from "./HeadingNative";
import { resolveAndCleanProps } from "../../components-core/utils/extractParam";
import type { HeadingLevel } from "./abstractions";
import { d, createMetadata } from "../metadata-helpers";

const COMP = "Heading";

const VALUE_DESC = d(
  `This property determines the text displayed in the heading. \`${COMP}\` also accepts nested ` +
    `text instead of specifying the \`value\`. If both \`value\` and a nested text are used, ` +
    `the \`value\` will be displayed.`,
);
const MAX_LINES_DESC = d(
  "This optional property determines the maximum number of lines the component can wrap to. " +
    "If there is not enough space for all of the text, the component wraps the text up to as many " +
    "lines as specified. If the value is not specified, there is no limit on the number of " +
    "displayed lines.",
);
const ELLIPSES_DESC = {
  description:
    `This property indicates whether ellipses should be displayed (\`true\`) when the heading ` +
    `text is cropped or not (\`false\`).`,
  type: "boolean",
  defaultValue: defaultProps.ellipses,
};
const PRESERVE_DESC = d(
  `This property indicates whether linebreaks should be preserved when ` + `displaying text.`,
  undefined,
  "boolean",
  defaultProps.preserveLinebreaks,
);
const LEVEL_DESC = (level: number) => `Represents a heading level ${level} text`;
const OMIT_FROM_TOC_DESC = {
  description: "If true, this heading will be excluded from the table of contents.",
  type: "boolean",
  defaultValue: defaultProps.omitFromToc,
};
const SHOW_ANCHOR_DESC = {
  description:
    "This property indicates whether an anchor link should be displayed next to the heading. " +
    "If set to `true`, an anchor link will be displayed on hover next to the heading.",
  type: "boolean",
  defaultValue: defaultProps.showAnchor,
};
const APIS_DESC = {
  scrollIntoView: {
    signature: "scrollIntoView()",
    description: "Scrolls the heading into view.",
  },
};

export const HeadingMd = createMetadata({
  status: "stable",
  description:
    "`Heading` displays hierarchical text headings with semantic importance levels " +
    "from H1 to H6, following HTML heading standards. It provides text overflow " +
    "handling, anchor link generation, and integrates with " +
    "[TableOfContents](/components/TableOfContents).",
  props: {
    value: VALUE_DESC,
    level: {
      description: "This property sets the visual significance (level) of the heading.",
      availableValues: ["h1", "h2", "h3", "h4", "h5", "h6"],
      defaultValue: defaultProps.level,
    },
    maxLines: MAX_LINES_DESC,
    ellipses: ELLIPSES_DESC,
    preserveLinebreaks: PRESERVE_DESC,
    omitFromToc: OMIT_FROM_TOC_DESC,
    showAnchor: SHOW_ANCHOR_DESC,
  },
  apis: APIS_DESC,
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`textColor-${COMP}`]: "inherit",
    [`fontWeight-${COMP}`]: "$fontWeight-bold",
    [`letterSpacing-${COMP} `]: "0",
    [`color-anchor-${COMP} `]: "$color-surface-400",
    [`gap-anchor-${COMP} `]: "$space-2",
    [`textDecorationLine-anchor-${COMP} `]: "underline",

    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

const H1 = "H1";
export const H1Md = createMetadata({
  status: "stable",
  description: LEVEL_DESC(1),
  specializedFrom: COMP,
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
    ellipses: ELLIPSES_DESC,
    preserveLinebreaks: PRESERVE_DESC,
    omitFromToc: OMIT_FROM_TOC_DESC,
    showAnchor: SHOW_ANCHOR_DESC,
  },
  apis: APIS_DESC,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`fontSize-${H1}`]: "$fontSize-large",
    [`marginTop-${H1}`]: "0",
    [`marginBottom-${H1}`]: "0",
    [`fontSize-${H1}-markdown`]: "$fontSize-large",
    [`marginTop-${H1}-markdown`]: "0",
    [`marginBottom-${H1}-markdown`]: "$space-6",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

const H2 = "H2";
export const H2Md = createMetadata({
  status: "stable",
  description: LEVEL_DESC(2),
  specializedFrom: COMP,
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
    ellipses: ELLIPSES_DESC,
    preserveLinebreaks: PRESERVE_DESC,
    omitFromToc: OMIT_FROM_TOC_DESC,
    showAnchor: SHOW_ANCHOR_DESC,
  },
  apis: APIS_DESC,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`fontSize-${H2}`]: "$fontSize-medium",
    [`marginTop-${H2}`]: "0",
    [`marginBottom-${H2}`]: "0",
    [`marginTop-${H2}-markdown`]: "$space-10",
    [`marginBottom-${H2}-markdown`]: "$space-3",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

const H3 = "H3";
export const H3Md = createMetadata({
  status: "stable",
  description: LEVEL_DESC(3),
  specializedFrom: COMP,
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
    ellipses: ELLIPSES_DESC,
    preserveLinebreaks: PRESERVE_DESC,
    omitFromToc: OMIT_FROM_TOC_DESC,
    showAnchor: SHOW_ANCHOR_DESC,
  },
  apis: APIS_DESC,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`fontSize-${H3}`]: "$fontSize-normal",
    [`marginTop-${H3}`]: "0",
    [`marginBottom-${H3}`]: "0",
    [`marginTop-${H3}-markdown`]: "$space-6",
    [`marginBottom-${H3}-markdown`]: "$space-2",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

const H4 = "H4";
export const H4Md = createMetadata({
  status: "stable",
  description: LEVEL_DESC(4),
  specializedFrom: COMP,
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
    omitFromToc: OMIT_FROM_TOC_DESC,
    ellipses: ELLIPSES_DESC,
    preserveLinebreaks: PRESERVE_DESC,
    showAnchor: SHOW_ANCHOR_DESC,
  },
  apis: APIS_DESC,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`fontSize-${H4}`]: "$fontSize-small",
    [`marginTop-${H4}`]: "0",
    [`marginBottom-${H4}`]: "0",
    [`marginTop-${H4}-markdown`]: "$space-5",
    [`marginBottom-${H4}-markdown`]: "$space-1",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

const H5 = "H5";
export const H5Md = createMetadata({
  status: "stable",
  description: LEVEL_DESC(5),
  specializedFrom: COMP,
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
    omitFromToc: OMIT_FROM_TOC_DESC,
    ellipses: ELLIPSES_DESC,
    preserveLinebreaks: PRESERVE_DESC,
    showAnchor: SHOW_ANCHOR_DESC,
  },
  apis: APIS_DESC,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`fontSize-${H5}`]: "$fontSize-smaller",
    [`marginTop-${H5}`]: "0",
    [`marginBottom-${H5}`]: "0",
    [`marginTop-${H5}-markdown`]: "0",
    [`marginBottom-${H5}-markdown`]: "$space-0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

const H6 = "H6";
export const H6Md = createMetadata({
  status: "stable",
  description: LEVEL_DESC(6),
  specializedFrom: COMP,
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
    omitFromToc: OMIT_FROM_TOC_DESC,
    ellipses: ELLIPSES_DESC,
    preserveLinebreaks: PRESERVE_DESC,
    showAnchor: SHOW_ANCHOR_DESC,
  },
  apis: APIS_DESC,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`fontSize-${H6}`]: "$fontSize-tiny",
    [`marginTop-${H6}`]: "0",
    [`marginBottom-${H6}`]: "0",
    [`marginTop-${H6}-markdown`]: "0",
    [`marginBottom-${H6}-markdown`]: "$space-0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

type HeadingComponentDef = ComponentDef<typeof HeadingMd>;

type RenderHeadingProps = {
  node: HeadingComponentDef;
  extractValue: ValueExtractor;
  className?: string;
  level: string;
  showAnchor?: boolean;
  renderChild: RenderChildFn;
};

function renderHeading({
  node,
  extractValue,
  className,
  level,
  showAnchor,
  renderChild,
}: RenderHeadingProps) {
  const { maxLines, preserveLinebreaks, ellipses, ...restProps } = node.props;
  delete restProps.level; // Remove level from restProps as it is handled separately
  return (
    <Heading
      uid={node.uid}
      level={(extractValue.asOptionalString(level) ?? "h1") as HeadingLevel}
      maxLines={extractValue.asOptionalNumber(maxLines)}
      preserveLinebreaks={extractValue.asOptionalBoolean(preserveLinebreaks, false)}
      ellipses={extractValue.asOptionalBoolean(ellipses, true)}
      showAnchor={extractValue.asOptionalBoolean(showAnchor)}
      className={className}
      omitFromToc={extractValue.asOptionalBoolean(node.props?.omitFromToc)}
      {...resolveAndCleanProps(restProps, extractValue)}
    >
      {extractValue.asDisplayText(node.props.value) || renderChild(node.children)}
    </Heading>
  );
}

export const headingComponentRenderer = createComponentRenderer(
  COMP,
  HeadingMd,
  ({ node, extractValue, className, renderChild }) => {
    return renderHeading({
      node: node as HeadingComponentDef,
      extractValue,
      className,
      level: node.props.level,
      renderChild,
    });
  },
);

export const h1ComponentRenderer = createComponentRenderer(
  H1,
  H1Md,
  ({ node, extractValue, className, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      className,
      level: "h1",
      renderChild,
    } as any);
  },
);

export const h2ComponentRenderer = createComponentRenderer(
  H2,
  H2Md,
  ({ node, extractValue, className, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      className,
      level: "h2",
      renderChild,
    } as any);
  },
);

export const h3ComponentRenderer = createComponentRenderer(
  H3,
  H3Md,
  ({ node, extractValue, className, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      className,
      level: "h3",
      renderChild,
    } as any);
  },
);

export const h4ComponentRenderer = createComponentRenderer(
  H4,
  H4Md,
  ({ node, extractValue, className, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      className,
      level: "h4",
      renderChild,
    } as any);
  },
);

export const h5ComponentRenderer = createComponentRenderer(
  H5,
  H5Md,
  ({ node, extractValue, className, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      className,
      level: "h5",
      renderChild,
    } as any);
  },
);

export const h6ComponentRenderer = createComponentRenderer(
  H6,
  H6Md,
  ({ node, extractValue, className, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      className,
      level: "h6",
      renderChild,
    } as any);
  },
);
