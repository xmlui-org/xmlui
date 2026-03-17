import styles from "./Heading.module.scss";

import React, { type CSSProperties } from "react";
import { type ComponentDef } from "../../abstractions/ComponentDefs";
import type { RenderChildFn } from "../../abstractions/RendererDefs";
import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Heading, defaultProps } from "./HeadingNative";
import { resolveAndCleanProps } from "../../components-core/utils/extractParam";
import type { HeadingLevel } from "./abstractions";
import { d, createMetadata } from "../metadata-helpers";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { countAncestorLayouts } from "../../abstractions/layout-context-utils";

const COMP = "Heading";

/**
 * Normalizes the level value to a valid HeadingLevel (h1-h6).
 * Accepts: 1-6, "1"-"6", "h1"-"h6", "H1"-"H6"
 * Returns "h1" for any invalid value.
 */
function normalizeHeadingLevel(value: any): HeadingLevel {
  if (value === null || value === undefined) {
    return "h1";
  }
  
  // Handle numeric values (1-6)
  if (typeof value === "number") {
    if (value >= 1 && value <= 6) {
      return `h${value}` as HeadingLevel;
    }
    return "h1";
  }
  
  // Handle string values
  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    
    // Handle "h1"-"h6" (case insensitive)
    if (/^h[1-6]$/.test(trimmed)) {
      return trimmed as HeadingLevel;
    }
    
    // Handle "1"-"6"
    if (/^[1-6]$/.test(trimmed)) {
      return `h${trimmed}` as HeadingLevel;
    }
  }
  
  // Default fallback
  return "h1";
}


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
  hasOverflow: {
    signature: "hasOverflow()",
    description: "Returns true when the displayed text overflows the bounds of this heading component.",
  },
};

export const HeadingMd = createMetadata({
  status: "stable",
  description:
    "`Heading` displays hierarchical text headings with semantic importance levels " +
    "from H1 to H6, following HTML heading standards. It provides text overflow " +
    "handling, anchor link generation, and integrates with " +
    "[`TableOfContents`](/docs/reference/components/TableOfContents).",
  props: {
    value: VALUE_DESC,
    level: {
      description: 
        "This property sets the visual significance (level) of the heading. " +
        "Accepts multiple formats: `h1`-`h6`, `H1`-`H6`, or `1`-`6`." +
        "Invalid values default to `h1`.",
      availableValues: [
        "h1", "h2", "h3", "h4", "h5", "h6",
        "H1", "H2", "H3", "H4", "H5", "H6",
        "1", "2", "3", "4", "5", "6",
      ],
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
    [`textColor-${COMP}`]: "$textColor",
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

type ThemedHeadingProps = React.ComponentProps<typeof Heading> & { className?: string };
export const ThemedHeading = React.forwardRef<HTMLHeadingElement, ThemedHeadingProps>(
  function ThemedHeading({ className, ...props }: ThemedHeadingProps, ref) {
    const themeClass = useComponentThemeClass(HeadingMd);
    return <Heading {...props} className={`${themeClass}${className ? ` ${className}` : ""}`} ref={ref} />;
  },
);

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
    [`fontSize-${H1}`]: "$fontSize-2xl",
    [`lineHeight-${H1}`]: "$lineHeight-tight",
    [`marginTop-${H1}`]: "0",
    [`marginBottom-${H1}`]: "$space-6",
    [`fontSize-${H1}-markdown`]: "$fontSize-2xl",
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
    [`fontSize-${H2}`]: "$fontSize-xl",
    [`lineHeight-${H2}`]: "$lineHeight-tight",
    [`marginTop-${H2}`]: "0",
    [`marginBottom-${H2}`]: "$space-4",
    [`fontSize-${H2}-markdown`]: "$fontSize-xl",
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
    [`fontSize-${H3}`]: "$fontSize-lg",
    [`lineHeight-${H3}`]: "$lineHeight-tight",
    [`marginTop-${H3}`]: "0",
    [`marginBottom-${H3}`]: "$space-3",
    [`fontSize-${H3}-markdown`]: "$fontSize-lg",
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
    [`fontSize-${H4}`]: "$fontSize-base",
    [`lineHeight-${H4}`]: "$lineHeight-tight",
    [`marginTop-${H4}`]: "0",
    [`marginBottom-${H4}`]: "$space-2",
    [`fontSize-${H4}-markdown`]: "$fontSize-base",
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
    [`fontSize-${H5}`]: "$fontSize-sm",
    [`lineHeight-${H5}`]: "$lineHeight-tight",
    [`marginTop-${H5}`]: "0",
    [`marginBottom-${H5}`]: "$space-1",
    [`fontSize-${H5}-markdown`]: "$fontSize-sm",
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
    [`fontSize-${H6}`]: "$fontSize-xs",
    [`lineHeight-${H6}`]: "$lineHeight-tight",
    [`marginTop-${H6}`]: "0",
    [`marginBottom-${H6}`]: "$space-1",
    [`fontSize-${H6}-markdown`]: "$fontSize-xs",
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

// Font-size CSS variables for H1→H6 in descending order.
// Using per-heading variables (not raw scale tokens) so theme overrides
// on e.g. fontSize-H2 are respected when H1 is demoted inside a Card.
const HEADING_FONT_SIZES = [
  "var(--xmlui-fontSize-H1)", // 0 — H1 baseline
  "var(--xmlui-fontSize-H2)", // 1
  "var(--xmlui-fontSize-H3)", // 2
  "var(--xmlui-fontSize-H4)", // 3
  "var(--xmlui-fontSize-H5)", // 4
  "var(--xmlui-fontSize-H6)", // 5
];

/**
 * Returns the CSS font-size value for a heading at `baseIndex` demoted by
 * `cardDepth` nesting levels, or `undefined` when no shift is needed.
 */
function headingFontSizeAtCardDepth(
  baseIndex: number,
  cardDepth: number,
): string | undefined {
  if (cardDepth === 0) return undefined;
  const shifted = Math.min(baseIndex + cardDepth, HEADING_FONT_SIZES.length - 1);
  return HEADING_FONT_SIZES[shifted];
}

type HeadingComponentDef = ComponentDef<typeof HeadingMd>;

type RenderHeadingProps = {
  node: HeadingComponentDef;
  extractValue: ValueExtractor;
  classes?: Record<string, string>;
  level: string;
  renderChild: RenderChildFn;
  registerComponentApi?: (api: any) => void;
  sx?: CSSProperties;
};

function renderHeading({
  node,
  extractValue,
  classes,
  level,
  renderChild,
  registerComponentApi,
  sx,
}: RenderHeadingProps) {
  const { maxLines, preserveLinebreaks, ellipses, showAnchor, ...restProps } = node.props;
  delete restProps.level; // Remove level from restProps as it is handled separately
  const showAnchorValue = extractValue.asOptionalBoolean(node.props?.showAnchor);
  
  // Extract and normalize the level value
  const extractedLevel = extractValue(level);
  const normalizedLevel = normalizeHeadingLevel(extractedLevel);
  
  return (
    <Heading
      uid={node.uid}
      level={normalizedLevel}
      maxLines={extractValue.asOptionalNumber(maxLines)}
      preserveLinebreaks={extractValue.asOptionalBoolean(preserveLinebreaks, false)}
      ellipses={extractValue.asOptionalBoolean(ellipses, true)}
      showAnchor={showAnchorValue}
      classes={classes}
      omitFromToc={extractValue.asOptionalBoolean(node.props?.omitFromToc)}
      registerComponentApi={registerComponentApi}
      sx={sx}
      {...resolveAndCleanProps(restProps, extractValue)}
    >
      {extractValue.asDisplayText(node.props.value) || renderChild(node.children)}
    </Heading>
  );
}

export const headingComponentRenderer = createComponentRenderer(
  COMP,
  HeadingMd,
  ({ node, extractValue, classes, renderChild, registerComponentApi }) => {
    return renderHeading({
      node: node as HeadingComponentDef,
      extractValue,
      classes,
      level: node.props.level,
      renderChild,
      registerComponentApi,
    });
  },
);

export const h1ComponentRenderer = createComponentRenderer(
  H1,
  H1Md,
  ({ node, extractValue, classes, renderChild, registerComponentApi, layoutContext }) => {
    const cardDepth = countAncestorLayouts(layoutContext, (ctx) => ctx.host === "Card");
    const fontSize = headingFontSizeAtCardDepth(0, cardDepth);
    const sx: CSSProperties | undefined = cardDepth > 0
      ? { marginTop: 0, marginBottom: 0, ...(fontSize && { fontSize }) }
      : undefined;
    return renderHeading({
      node, extractValue, classes, level: "h1", renderChild, registerComponentApi, sx,
    } as any);
  },
);

export const h2ComponentRenderer = createComponentRenderer(
  H2,
  H2Md,
  ({ node, extractValue, classes, renderChild, registerComponentApi, layoutContext }) => {
    const cardDepth = countAncestorLayouts(layoutContext, (ctx) => ctx.host === "Card");
    const fontSize = headingFontSizeAtCardDepth(1, cardDepth);
    const sx: CSSProperties | undefined = cardDepth > 0
      ? { marginTop: 0, marginBottom: 0, ...(fontSize && { fontSize }) }
      : undefined;
    return renderHeading({
      node, extractValue, classes, level: "h2", renderChild, registerComponentApi, sx,
    } as any);
  },
);

export const h3ComponentRenderer = createComponentRenderer(
  H3,
  H3Md,
  ({ node, extractValue, classes, renderChild, registerComponentApi, layoutContext }) => {
    const cardDepth = countAncestorLayouts(layoutContext, (ctx) => ctx.host === "Card");
    const fontSize = headingFontSizeAtCardDepth(2, cardDepth);
    const sx: CSSProperties | undefined = cardDepth > 0
      ? { marginTop: 0, marginBottom: 0, ...(fontSize && { fontSize }) }
      : undefined;
    return renderHeading({
      node, extractValue, classes, level: "h3", renderChild, registerComponentApi, sx,
    } as any);
  },
);

export const h4ComponentRenderer = createComponentRenderer(
  H4,
  H4Md,
  ({ node, extractValue, classes, renderChild, registerComponentApi, layoutContext }) => {
    const cardDepth = countAncestorLayouts(layoutContext, (ctx) => ctx.host === "Card");
    const fontSize = headingFontSizeAtCardDepth(3, cardDepth);
    const sx: CSSProperties | undefined = cardDepth > 0
      ? { marginTop: 0, marginBottom: 0, ...(fontSize && { fontSize }) }
      : undefined;
    return renderHeading({
      node, extractValue, classes, level: "h4", renderChild, registerComponentApi, sx,
    } as any);
  },
);

export const h5ComponentRenderer = createComponentRenderer(
  H5,
  H5Md,
  ({ node, extractValue, classes, renderChild, registerComponentApi, layoutContext }) => {
    const cardDepth = countAncestorLayouts(layoutContext, (ctx) => ctx.host === "Card");
    const fontSize = headingFontSizeAtCardDepth(4, cardDepth);
    const sx: CSSProperties | undefined = cardDepth > 0
      ? { marginTop: 0, marginBottom: 0, ...(fontSize && { fontSize }) }
      : undefined;
    return renderHeading({
      node, extractValue, classes, level: "h5", renderChild, registerComponentApi, sx,
    } as any);
  },
);

export const h6ComponentRenderer = createComponentRenderer(
  H6,
  H6Md,
  ({ node, extractValue, classes, renderChild, registerComponentApi, layoutContext }) => {
    const cardDepth = countAncestorLayouts(layoutContext, (ctx) => ctx.host === "Card");
    // H6 is already the smallest size — no fontSize shift possible, only margin suppression
    const sx: CSSProperties | undefined = cardDepth > 0
      ? { marginTop: 0, marginBottom: 0 }
      : undefined;
    return renderHeading({
      node, extractValue, classes, level: "h6", renderChild, registerComponentApi, sx,
    } as any);
  },
);
