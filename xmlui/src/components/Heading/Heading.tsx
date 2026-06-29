import type { CSSProperties, ReactNode } from "react";

import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { COMPONENT_PART_KEY } from "../../styling";
import {
  createMetadata,
  dComponent,
} from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { Heading } from "./HeadingReact";
import headingStylesSource from "./Heading.module.scss?xmlui-theme-vars";
import { defaultProps } from "./Heading.defaults";
import { headingLevels, type HeadingLevel } from "./abstractions";

const COMP = "Heading";

const valueDescription = {
  description: "`Heading` accepts nested text or a `value` prop. `value` wins when both are present.",
  valueType: "string" as const,
};

const sharedHeadingProps = {
  id: {
    description: "Defines a component instance identifier used for references and APIs.",
    valueType: "string" as const,
  },
  level: {
    description: "Accepted by shortcut heading components for compatibility but ignored by fixed-level shortcuts.",
    valueType: "string" as const,
  },
  value: valueDescription,
  maxLines: {
    description: "Maximum displayed line count before truncation.",
    valueType: "number" as const,
    defaultValue: defaultProps.maxLines,
  },
  ellipses: {
    description: "Displays ellipses when truncated.",
    valueType: "boolean" as const,
    defaultValue: defaultProps.ellipses,
  },
  preserveLinebreaks: {
    description: "Preserves line breaks when displaying heading text.",
    valueType: "boolean" as const,
    defaultValue: defaultProps.preserveLinebreaks,
  },
  omitFromToc: {
    description: "Excludes this heading from table-of-contents collection.",
    valueType: "boolean" as const,
    defaultValue: defaultProps.omitFromToc,
  },
  showAnchor: {
    description: "Displays an anchor link next to the heading.",
    valueType: "boolean" as const,
    defaultValue: defaultProps.showAnchor,
  },
  anchorId: {
    description: "Sets the generated anchor id for this heading.",
    valueType: "string" as const,
  },
  anchorTemplate: dComponent("Optional template for the heading anchor."),
  testId: {
    description: "Adds a test identifier to the rendered heading.",
    valueType: "string" as const,
  },
};

const apis = {
  scrollIntoView: {
    signature: "scrollIntoView()",
    description: "Scrolls the heading into view.",
  },
  hasOverflow: {
    signature: "hasOverflow()",
    description: "Returns true when the heading text overflows its bounds.",
  },
};

const contextVars = {
  $anchorId: { description: "The generated id of the heading anchor." },
  $anchorHref: { description: "The href of the heading anchor." },
};

export const HeadingMd = createMetadata({
  status: "stable",
  description: "`Heading` displays hierarchical text headings from H1 to H6.",
  allowArbitraryProps: true,
  props: {
    ...sharedHeadingProps,
    level: {
      description: "Sets the heading level.",
      valueType: "string",
      availableValues: ["h1", "h2", "h3", "h4", "h5", "h6", "1", "2", "3", "4", "5", "6"],
      defaultValue: defaultProps.level,
    },
  },
  apis,
  contextVars,
  themeVars: extractScssThemeVars(headingStylesSource),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`textColor-${COMP}`]: "$textColor",
    [`fontWeight-${COMP}`]: "$fontWeight-bold",
    [`color-anchor-${COMP}`]: "$color-surface-400",
    [`gap-anchor-${COMP}`]: "$space-2",
    [`textDecorationLine-anchor-${COMP}`]: "underline",
    ...levelDefaultThemeVars("H1"),
    ...levelDefaultThemeVars("H2"),
    ...levelDefaultThemeVars("H3"),
    ...levelDefaultThemeVars("H4"),
    ...levelDefaultThemeVars("H5"),
    ...levelDefaultThemeVars("H6"),
  },
});

export const H1Md = createMetadata({
  status: "stable",
  description: "Represents a heading level 1 text.",
  specializedFrom: COMP,
  allowArbitraryProps: true,
  props: sharedHeadingProps,
  apis,
  contextVars,
  themeVars: extractScssThemeVars(headingStylesSource),
  defaultThemeVars: {
    ...levelDefaultThemeVars("H1"),
  },
});

const shortcutMetadata: Record<string, ComponentMetadata> = {
  H2: createHeadingShortcutMetadata("H2", "Represents a heading level 2 text."),
  H3: createHeadingShortcutMetadata("H3", "Represents a heading level 3 text."),
  H4: createHeadingShortcutMetadata("H4", "Represents a heading level 4 text."),
  H5: createHeadingShortcutMetadata("H5", "Represents a heading level 5 text."),
  H6: createHeadingShortcutMetadata("H6", "Represents a heading level 6 text."),
};

export const H2Md = shortcutMetadata.H2;
export const H3Md = shortcutMetadata.H3;
export const H4Md = shortcutMetadata.H4;
export const H5Md = shortcutMetadata.H5;
export const H6Md = shortcutMetadata.H6;

export const headingRenderer = createHeadingRenderer("Heading", HeadingMd);
export const h1Renderer = createHeadingRenderer("H1", H1Md, "h1");
export const h2Renderer = createHeadingRenderer("H2", H2Md, "h2");
export const h3Renderer = createHeadingRenderer("H3", H3Md, "h3");
export const h4Renderer = createHeadingRenderer("H4", H4Md, "h4");
export const h5Renderer = createHeadingRenderer("H5", H5Md, "h5");
export const h6Renderer = createHeadingRenderer("H6", H6Md, "h6");

function createHeadingShortcutMetadata(name: string, description: string): ComponentMetadata {
  return createMetadata({
    status: "stable",
    description,
    specializedFrom: COMP,
    allowArbitraryProps: true,
    props: sharedHeadingProps,
    apis,
    contextVars,
    themeVars: extractScssThemeVars(headingStylesSource),
    defaultThemeVars: {
      ...levelDefaultThemeVars(name),
    },
  });
}

function levelDefaultThemeVars(name: string): Record<string, string> {
  const defaults = {
    H1: {
      fontSize: "$fontSize-2xl",
      marginTopMarkdown: "0",
      marginBottomMarkdown: "$space-6",
    },
    H2: {
      fontSize: "$fontSize-xl",
      marginTopMarkdown: "$space-10",
      marginBottomMarkdown: "$space-3",
    },
    H3: {
      fontSize: "$fontSize-lg",
      marginTopMarkdown: "$space-6",
      marginBottomMarkdown: "$space-2",
    },
    H4: {
      fontSize: "$fontSize-base",
      marginTopMarkdown: "$space-5",
      marginBottomMarkdown: "$space-1",
    },
    H5: {
      fontSize: "$fontSize-sm",
      marginTopMarkdown: "0",
      marginBottomMarkdown: "$space-0",
    },
    H6: {
      fontSize: "$fontSize-xs",
      marginTopMarkdown: "0",
      marginBottomMarkdown: "$space-0",
    },
  } as Record<string, {
    fontSize: string;
    marginTopMarkdown: string;
    marginBottomMarkdown: string;
  }>;
  const levelDefaults = defaults[name] ?? defaults.H1;
  return {
    [`fontSize-${name}`]: levelDefaults.fontSize,
    [`lineHeight-${name}`]: "$lineHeight-tight",
    [`marginTop-${name}`]: "0",
    [`marginBottom-${name}`]: "0",
    [`fontSize-${name}-markdown`]: levelDefaults.fontSize,
    [`marginTop-${name}-markdown`]: levelDefaults.marginTopMarkdown,
    [`marginBottom-${name}-markdown`]: levelDefaults.marginBottomMarkdown,
  };
}

function createHeadingRenderer(name: string, metadata: ComponentMetadata, fixedLevel?: string) {
  return wrapComponent({
    name,
    metadata,
    themeContributors: fixedLevel ? [HeadingMd] : [],
    renderer: ({ adapter }) => {
      const rootAttrs = adapter.rootAttrs();
      const rootStyle = rootAttrs.style as CSSProperties | undefined;
      const hasValue = Object.prototype.hasOwnProperty.call(adapter.node.props, "value");
      const value = adapter.prop("value");
      const children = hasValue ? displayText(value) : adapter.renderChildren();
      const level = fixedLevel ?? normalizeHeadingLevel(adapter.prop("level", defaultProps.level));
      const anchorRenderer = hasProp(adapter.node.props, "anchorTemplate")
        ? (_anchorId: string, _anchorHref: string): ReactNode => adapter.renderTemplate("anchorTemplate")
        : undefined;
      const bridgeStyle = {
        minWidth: 0,
        ...(hasProp(adapter.node.props, "width") || hasProp(adapter.node.props, "maxWidth")
          ? undefined
          : { maxWidth: "100%" }),
        ...rootStyle,
      } as CSSProperties;

      return (
        <Heading
          {...rootAttrs}
          uid={adapter.stringProp("id")}
          level={level}
          maxLines={adapter.numberProp("maxLines", defaultProps.maxLines)}
          preserveLinebreaks={adapter.booleanProp("preserveLinebreaks", defaultProps.preserveLinebreaks)}
          ellipses={adapter.booleanProp("ellipses", defaultProps.ellipses)}
          omitFromToc={adapter.booleanProp("omitFromToc", defaultProps.omitFromToc)}
          showAnchor={hasProp(adapter.node.props, "showAnchor") ? adapter.booleanProp("showAnchor") : undefined}
          classes={{ [COMPONENT_PART_KEY]: adapter.className }}
          sx={bridgeStyle}
          registerComponentApi={adapter.registerApi}
          anchorRenderer={anchorRenderer}
        >
          {children}
        </Heading>
      );
    },
  });
}

function displayText(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  let text = String(value);
  let replaced = "";
  let spaceFound = false;
  for (const char of text) {
    if (char === " " || char === "\t") {
      replaced += spaceFound ? "\xa0" : " ";
      spaceFound = true;
    } else {
      replaced += char;
      spaceFound = char === "\xa0";
    }
  }
  text = replaced;
  return text;
}

function normalizeHeadingLevel(value: unknown): HeadingLevel {
  const normalized = value === undefined || value === null
    ? defaultProps.level
    : String(value).trim().toLowerCase();
  const withPrefix = /^[1-6]$/.test(normalized) ? `h${normalized}` : normalized;
  return (headingLevels as readonly string[]).includes(withPrefix) ? withPrefix as HeadingLevel : defaultProps.level;
}

function hasProp(props: Record<string, unknown>, propName: string): boolean {
  return Object.prototype.hasOwnProperty.call(props, propName);
}
