import type { CSSProperties, ReactNode } from "react";
import styles from "./Heading.module.scss";
import classnames from "@components-core/utils/classnames";
import { createComponentRenderer } from "@components-core/renderers";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import { getMaxLinesStyle } from "@components-core/utils/css-utils";
import type { NonCssLayoutProps, ValueExtractor } from "@abstractions/RendererDefs";

// =====================================================================================================================
// React Heading, H1,..., H6 component implementation

const VALUE_DESC = "The text to display in the component - can be empty";
const LINE_CLAMP_DESC = "Limits the number of lines the component can use";
const PRESERVE_DESC = "Allow preserving linebreak information?"
const NO_ELLIPSIS_DESC = "Indicates if ellipsis should be hidden from the end of the text";
const LEVEL_DESC = (level: number) => `Represents a heading level ${level} text`;

const HeadingLevelKeys = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
type HeadingLevel = typeof HeadingLevelKeys[number];

export type HeadingProps = {
  uid?: string;
  level?: HeadingLevel;
  children: ReactNode;
  sx?: CSSProperties;
  layout?: CSSProperties;
  maxLines?: number;
  preserveLinebreaks?: boolean;
  ellipses?: boolean;
  title?: string;
  className?: string;
};

export const Heading = ({
  uid,
  level = "h1",
  children,
  sx,
  layout,
  title,
  maxLines = 0,
  preserveLinebreaks,  
  ellipses = true,
  className,
}: HeadingProps) => {
  const Element = level?.toLowerCase() as HeadingLevel;
  return (
    <Element
      id={uid}
      title={title}
      style={{ ...sx, ...layout, ...getMaxLinesStyle(maxLines) }}
      className={classnames(styles.heading, styles[Element], className || "", {
        [styles.truncateOverflow]: maxLines > 0,
        [styles.preserveLinebreaks]: preserveLinebreaks,
        [styles.noEllipsis]: !ellipses,
      })}
    >
      {children}
    </Element>
  );
};

// =====================================================================================================================
// XMLUI Heading, H1,..., H6 component definition

/** 
 * The \`Heading\` component displays titles and section headers.
 * 
 * > **Note**: \`Heading\` follows the basic rules of the HTML heading elements (\`<h1>\`, ..., \`<h6>\`).
 * 
 * For the shorthand versions see their reference page: [H1](./H1), [H2](./H2), [H3](./H3), [H4](./H4), [H5](./H5), [H6](./H6).
 */
export interface HeadingComponentDef extends ComponentDef<"Heading"> {
  props: {
    /** 
     * This property determines the text displayed in the heading. 
     * \`Heading\` also accepts nested text instead of specifying the `value`.
     * If both \`value\` and a nested text are used, the \`value\` will be displayed.
     * @descriptionRef
     */
    value: string;
    /** 
     * This property sets the visual significance (level) of the heading.
     * @descriptionRef
     */
    level: HeadingLevel;
    /** 
     * This property determines the maximum number of lines the component can wrap to.
     * If there is not enough space for all of the text,
     * the component wraps the text up to as many lines as specified.
     * @descriptionRef */
    maxLines?: number;
    /** 
     * This property indicates whether linebreaks should be preserved when displaying text.
     * @descriptionRef
     */
    preserveLinebreaks?: boolean;
    /** 
     * This property indicates whether ellipses should be displayed (\`true\`)
     * when the heading text is cropped or not (\`false\`).
     * The default value is \`true\`.
     * @descriptionRef
     * */
    ellipses?: boolean;
  };
}

/** @specialized */
export type H1ComponentDef = Omit<HeadingComponentDef, "type"> & { type: "H1" };
/** @specialized */
export type H2ComponentDef = Omit<HeadingComponentDef, "type"> & { type: "H2" };
/** @specialized */
export type H3ComponentDef = Omit<HeadingComponentDef, "type"> & { type: "H3" };
/** @specialized */
export type H4ComponentDef = Omit<HeadingComponentDef, "type"> & { type: "H4" };
/** @specialized */
export type H5ComponentDef = Omit<HeadingComponentDef, "type"> & { type: "H5" };
/** @specialized */
export type H6ComponentDef = Omit<HeadingComponentDef, "type"> & { type: "H6" };

const headingMetadata: ComponentDescriptor<HeadingComponentDef> = {
  displayName: "Heading",
  description: "Represents a heading text",
  props: {
    value: desc(VALUE_DESC),
    level: desc("The heading level as described in HTML, indicates the heading size and importance"),
    maxLines: desc(LINE_CLAMP_DESC),
    ellipses: desc(NO_ELLIPSIS_DESC),
    preserveLinebreaks: desc(PRESERVE_DESC),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "font-family-Heading": "$font-family",
    "color-text-Heading": "inherit",
    "font-weight-Heading": "$font-weight-bold",
    "letter-spacing-Heading": "0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
};

const h1Metadata: ComponentDescriptor<H1ComponentDef> = {
  displayName: "H1",
  description: LEVEL_DESC(1),
  props: {
    value: desc(VALUE_DESC),
    maxLines: desc(LINE_CLAMP_DESC),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // letter-spacing
    "font-size-H1": "$font-size-large",
    "line-height-H1": "$line-height-loose",
    "margin-top-H1": "$space-3",
    "margin-bottom-H1": "$space-6",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
};

const h2Metadata: ComponentDescriptor<H2ComponentDef> = {
  displayName: "H2",
  description: LEVEL_DESC(2),
  props: {
    value: desc(VALUE_DESC),
    maxLines: desc(LINE_CLAMP_DESC),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "font-size-H2": "$font-size-medium",
    "line-height-H2": "$line-height-relaxed",
    "margin-top-H2": "$space-2",
    "margin-bottom-H2": "$space-4",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
};

const h3Metadata: ComponentDescriptor<H3ComponentDef> = {
  displayName: "H3",
  description: LEVEL_DESC(3),
  props: {
    value: desc(VALUE_DESC),
    maxLines: desc(LINE_CLAMP_DESC),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "font-size-H3": "$font-size-normal",
    "line-height-H3": "$line-height-normal",
    "margin-top-H3": "$space-1_5",
    "margin-bottom-H3": "$space-3",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
};

const h4Metadata: ComponentDescriptor<H4ComponentDef> = {
  displayName: "H4",
  description: LEVEL_DESC(4),
  props: {
    value: desc(VALUE_DESC),
    maxLines: desc(LINE_CLAMP_DESC),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "font-size-H4": "$font-size-small",
    "line-height-H4": "$line-height-snug",
    "margin-top-H4": "$space-1",
    "margin-bottom-H4": "$space-2",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
};

const h5Metadata: ComponentDescriptor<H5ComponentDef> = {
  displayName: "H5",
  description: LEVEL_DESC(5),
  props: {
    value: desc(VALUE_DESC),
    maxLines: desc(LINE_CLAMP_DESC),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "font-size-H5": "$font-size-smaller",
    "line-height-H5": "$line-height-tight",
    "margin-top-H5": "$space-0_5",
    "margin-bottom-H5": "$space-1",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
};

const h6Metadata: ComponentDescriptor<H6ComponentDef> = {
  displayName: "H6",
  description: LEVEL_DESC(6),
  props: {
    value: desc(VALUE_DESC),
    maxLines: desc(LINE_CLAMP_DESC),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "font-size-H6": "$font-size-tiny",
    "line-height-H6": "$line-height-none",
    "margin-top-H6": "$space-0",
    "margin-bottom-H6": "$space-0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
};

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
      ellipses={extractValue.asOptionalBoolean(node.props.ellipses, false)}
      layout={layoutCss}
    >
      {extractValue.asDisplayText(node.props.value) || renderChild(node.children)}
    </Heading>
  );
}

export const headingComponentRenderer = createComponentRenderer<HeadingComponentDef>(
  "Heading",
  ({ node, extractValue, layoutCss, layoutNonCss, renderChild }) => {
    return renderHeading({ node, extractValue, layoutCss, layoutNonCss, level: node.props.level, renderChild });
  },
  headingMetadata
);

export const h1ComponentRenderer = createComponentRenderer<H1ComponentDef>(
  "H1",
  ({ node, extractValue, layoutCss, layoutNonCss, renderChild }) => {
    return renderHeading({ node, extractValue, layoutCss, layoutNonCss, level: "h1", renderChild } as any);
  },
  h1Metadata
);

export const h2ComponentRenderer = createComponentRenderer<H2ComponentDef>(
  "H2",
  ({ node, extractValue, layoutCss, layoutNonCss, renderChild }) => {
    return renderHeading({ node, extractValue, layoutCss, layoutNonCss, level: "h2", renderChild } as any);
  },
  h2Metadata
);

export const h3ComponentRenderer = createComponentRenderer<H3ComponentDef>(
  "H3",
  ({ node, extractValue, layoutCss, layoutNonCss, renderChild }) => {
    return renderHeading({ node, extractValue, layoutCss, layoutNonCss, level: "h3", renderChild } as any);
  },
  h3Metadata
);

export const h4ComponentRenderer = createComponentRenderer<H4ComponentDef>(
  "H4",
  ({ node, extractValue, layoutCss, layoutNonCss, renderChild }) => {
    return renderHeading({ node, extractValue, layoutCss, layoutNonCss, level: "h4", renderChild } as any);
  },
  h4Metadata
);

export const h5ComponentRenderer = createComponentRenderer<H5ComponentDef>(
  "H5",
  ({ node, extractValue, layoutCss, layoutNonCss, renderChild }) => {
    return renderHeading({ node, extractValue, layoutCss, layoutNonCss, level: "h5", renderChild } as any);
  },
  h5Metadata
);

export const h6ComponentRenderer = createComponentRenderer<H6ComponentDef>(
  "H6",
  ({ node, extractValue, layoutCss, layoutNonCss, renderChild }) => {
    return renderHeading({ node, extractValue, layoutCss, layoutNonCss, level: "h6", renderChild } as any);
  },
  h6Metadata
);
