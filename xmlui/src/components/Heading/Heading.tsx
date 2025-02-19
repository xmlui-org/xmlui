import type { CSSProperties } from "react";

import styles from "./Heading.module.scss";

import { type ComponentDef, createMetadata, d } from "../../abstractions/ComponentDefs";
import type { RenderChildFn } from "../../abstractions/RendererDefs";
import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Heading, type HeadingLevel } from "./HeadingNative";
import { resolveAndCleanProps } from "../../components-core/utils/extractParam";

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
    [`color-text-${COMP}`]: "$color-text-primary",
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

const H1 = "H1";
export const H1Md = createMetadata({
  description: LEVEL_DESC(1),
  specializedFrom: COMP,
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // letter-spacing
    [`font-size-${H1}`]: "$font-size-large",
    [`margin-top-${H1}`]: "0",
    [`margin-bottom-${H1}`]: "0",
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
  specializedFrom: COMP,
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // letter-spacing
    [`font-size-${H2}`]: "$font-size-medium",
    [`margin-top-${H2}`]: "0",
    [`margin-bottom-${H2}`]: "0",
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
  specializedFrom: COMP,
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // letter-spacing
    [`font-size-${H3}`]: "$font-size-normal",
    [`margin-top-${H3}`]: "0",
    [`margin-bottom-${H3}`]: "0",
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
  specializedFrom: COMP,
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // letter-spacing
    [`font-size-${H4}`]: "$font-size-small",
    [`margin-top-${H4}`]: "0",
    [`margin-bottom-${H4}`]: "0",
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
  specializedFrom: COMP,
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // letter-spacing
    [`font-size-${H5}`]: "$font-size-smaller",
    [`margin-top-${H5}`]: "0",
    [`margin-bottom-${H5}`]: "0",
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
  specializedFrom: COMP,
  props: {
    value: VALUE_DESC,
    maxLines: MAX_LINES_DESC,
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // letter-spacing
    [`font-size-${H6}`]: "$font-size-tiny",
    [`margin-top-${H6}`]: "0",
    [`margin-bottom-${H6}`]: "0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

type HeadingComponentDef = ComponentDef<typeof HeadingMd>;

type RenderHeadingPars = {
  node: HeadingComponentDef;
  extractValue: ValueExtractor;
  layoutCss: CSSProperties;
  renderChild: RenderChildFn;
  level: string;
};

function renderHeading({ node, extractValue, layoutCss, level, renderChild }: RenderHeadingPars) {
  const { maxLines, preserveLinebreaks, ellipses, ...restProps } = node.props;
  return (
    <Heading
      uid={node.uid}
      level={(extractValue.asOptionalString(level) ?? "h1") as HeadingLevel}
      maxLines={extractValue.asOptionalNumber(maxLines)}
      preserveLinebreaks={extractValue.asOptionalBoolean(preserveLinebreaks, false)}
      ellipses={extractValue.asOptionalBoolean(ellipses, true)}
      style={layoutCss}
      {...resolveAndCleanProps(restProps, extractValue, layoutCss)}
    >
      {extractValue.asDisplayText(node.props.value) || renderChild(node.children)}
    </Heading>
  );
}

export const headingComponentRenderer = createComponentRenderer(
  COMP,
  HeadingMd,
  ({ node, extractValue, layoutCss, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      layoutCss,
      level: node.props.level,
      renderChild,
    });
  },
);

export const h1ComponentRenderer = createComponentRenderer(
  H1,
  H1Md,
  ({ node, extractValue, layoutCss, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      layoutCss,
      level: "h1",
      renderChild,
    } as any);
  },
);

export const h2ComponentRenderer = createComponentRenderer(
  H2,
  H2Md,
  ({ node, extractValue, layoutCss, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      layoutCss,
      level: "h2",
      renderChild,
    } as any);
  },
);

export const h3ComponentRenderer = createComponentRenderer(
  H3,
  H3Md,
  ({ node, extractValue, layoutCss, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      layoutCss,
      level: "h3",
      renderChild,
    } as any);
  },
);

export const h4ComponentRenderer = createComponentRenderer(
  H4,
  H4Md,
  ({ node, extractValue, layoutCss, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      layoutCss,
      level: "h4",
      renderChild,
    } as any);
  },
);

export const h5ComponentRenderer = createComponentRenderer(
  H5,
  H5Md,
  ({ node, extractValue, layoutCss, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      layoutCss,
      level: "h5",
      renderChild,
    } as any);
  },
);

export const h6ComponentRenderer = createComponentRenderer(
  H6,
  H6Md,
  ({ node, extractValue, layoutCss, renderChild }) => {
    return renderHeading({
      node,
      extractValue,
      layoutCss,
      level: "h6",
      renderChild,
    } as any);
  },
);
