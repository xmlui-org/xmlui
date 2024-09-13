import type { CSSProperties } from "react";
import styles from "./Heading.module.scss";
import { createComponentRendererNew } from "@components-core/renderers";
import { ComponentDefNew, createMetadata, d } from "@abstractions/ComponentDefs";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import type { NonCssLayoutProps, ValueExtractor } from "@abstractions/RendererDefs";
import { Heading, HeadingLevel } from "./HeadingNative";

const COMP = "Heading";

const VALUE_DESC = d(
  `This property determines the text displayed in the heading. \`${COMP}\` also accepts nested ` +
    `text instead of specifying the \`value\`. If both \`value\` and a nested text are used, ` +
    `the \`value\` will be displayed.`,
);
const MAX_LINES_DESC = d(
  `This property determines the maximum number of lines the component can wrap to. If there is ` +
    `not enough space for all of the text, the component wraps the text up to as many ` +
    `lines as specified.`,
);
const ELLIPSES_DESC = d(
  `This property indicates whether ellipses should be displayed (\`true\`) when the heading ` +
    `text is cropped or not (\`false\`).`,
);
const PRESERVE_DESC = d(
  `This property indicates whether linebreaks should be preserved when ` + `displaying text.`,
);
const LEVEL_DESC = (level: number) => `Represents a heading level ${level} text`;

export const HeadingMd = createMetadata({
  description: "Represents a heading text",
  props: {
    value: VALUE_DESC,
    level: d(`This property sets the visual significance (level) of the heading.`),
    maxLines: MAX_LINES_DESC,
    ellipses: ELLIPSES_DESC,
    preserveLinebreaks: PRESERVE_DESC,
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`font-family-${COMP}`]: "$font-family",
    [`color-text-${COMP}`]: "inherit",
    [`font-weight-${COMP}`]: "$font-weight-bold",
    [`letter-spacing-${COMP} `]: "0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

function createHeadingMd(level: number) {
  return createMetadata({
    description: LEVEL_DESC(level),
    props: {
      value: VALUE_DESC,
      maxLines: MAX_LINES_DESC,
    },
    themeVars: parseScssVar(styles.themeVars),
    defaultThemeVars: {
      // letter-spacing
      [`font-size-H${level}`]: "$font-size-large",
      [`line-height-H${level}`]: "$line-height-loose",
      [`margin-top-H${level}`]: "$space-3",
      [`margin-bottom-H${level}`]: "$space-6",
      light: {
        // --- No light-specific theme vars
      },
      dark: {
        // --- No dark-specific theme vars
      },
    },
  });
}

const H1 = "H1";
export const H1Md = createMetadata({
  description: LEVEL_DESC(1),
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // letter-spacing
    [`font-size-${H1}`]: "$font-size-large",
    [`line-height-${H1}`]: "$line-height-loose",
    [`margin-top-${H1}`]: "$space-3",
    [`margin-bottom-${H1}`]: "$space-6",
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
  description: LEVEL_DESC(2),
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // letter-spacing
    [`font-size-${H2}`]: "$font-size-medium",
    [`line-height-${H2}`]: "$line-height-snug",
    [`margin-top-${H2}`]: "$space-2",
    [`margin-bottom-${H2}`]: "$space-4",
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
  description: LEVEL_DESC(3),
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // letter-spacing
    [`font-size-${H3}`]: "$font-size-normal",
    [`line-height-${H3}`]: "$line-height-normal",
    [`margin-top-${H3}`]: "$space-1_5",
    [`margin-bottom-${H3}`]: "$space-3",
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
  description: LEVEL_DESC(4),
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // letter-spacing
    [`font-size-${H4}`]: "$font-size-small",
    [`line-height-${H4}`]: "$line-height-snug",
    [`margin-top-${H4}`]: "$space-1",
    [`margin-bottom-${H4}`]: "$space-2",
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
  description: LEVEL_DESC(5),
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // letter-spacing
    [`font-size-${H5}`]: "$font-size-smaller",
    [`line-height-${H5}`]: "$line-height-tight",
    [`margin-top-${H5}`]: "$space-0_5",
    [`margin-bottom-${H5}`]: "$space-1",
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
  description: LEVEL_DESC(6),
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // letter-spacing
    [`font-size-${H6}`]: "$font-size-tiny",
    [`line-height-${H6}`]: "$line-height-none",
    [`margin-top-${H6}`]: "$space-0",
    [`margin-bottom-${H6}`]: "$space-0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

type HeadingComponentDef = ComponentDefNew<typeof HeadingMd>;

type RenderHeadingPars = {
  node: HeadingComponentDef;
  extractValue: ValueExtractor;
  layoutCss: CSSProperties;
  layoutNonCss: NonCssLayoutProps;
  renderChild: RenderChildFn;
  level: string;
};

function renderHeading({ node, extractValue, layoutCss, level, renderChild }: RenderHeadingPars) {
  return (
    <Heading
      uid={node.uid}
      level={(extractValue.asOptionalString(level) ?? "h1") as HeadingLevel}
      maxLines={extractValue.asOptionalNumber(node.props.maxLines)}
      preserveLinebreaks={extractValue.asOptionalBoolean(node.props.preserveLinebreaks, false)}
      ellipses={extractValue.asOptionalBoolean(node.props.ellipses, true)}
      layout={layoutCss}
    >
      {extractValue.asDisplayText(node.props.value) || renderChild(node.children)}
    </Heading>
  );
}

export const headingComponentRenderer = createComponentRendererNew(
  COMP,
  HeadingMd,
  ({ node, extractValue, layoutCss, layoutNonCss, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      layoutCss,
      layoutNonCss,
      level: node.props.level,
      renderChild,
    });
  },
);

export const h1ComponentRenderer = createComponentRendererNew(
  H1,
  H1Md,
  ({ node, extractValue, layoutCss, layoutNonCss, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      layoutCss,
      layoutNonCss,
      level: "h1",
      renderChild,
    } as any);
  },
);

export const h2ComponentRenderer = createComponentRendererNew(
  H2,
  H2Md,
  ({ node, extractValue, layoutCss, layoutNonCss, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      layoutCss,
      layoutNonCss,
      level: "h2",
      renderChild,
    } as any);
  },
);

export const h3ComponentRenderer = createComponentRendererNew(
  H3,
  H3Md,
  ({ node, extractValue, layoutCss, layoutNonCss, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      layoutCss,
      layoutNonCss,
      level: "h3",
      renderChild,
    } as any);
  },
);

export const h4ComponentRenderer = createComponentRendererNew(
  H4,
  H4Md,
  ({ node, extractValue, layoutCss, layoutNonCss, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      layoutCss,
      layoutNonCss,
      level: "h4",
      renderChild,
    } as any);
  },
);

export const h5ComponentRenderer = createComponentRendererNew(
  H5,
  H5Md,
  ({ node, extractValue, layoutCss, layoutNonCss, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      layoutCss,
      layoutNonCss,
      level: "h5",
      renderChild,
    } as any);
  },
);

export const h6ComponentRenderer = createComponentRendererNew(
  H6,
  H6Md,
  ({ node, extractValue, layoutCss, layoutNonCss, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      layoutCss,
      layoutNonCss,
      level: "h6",
      renderChild,
    } as any);
  },
);
