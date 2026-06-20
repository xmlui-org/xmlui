import { wrapComponent } from "../../runtime/rendering/adapter";
import {
  collectComponentThemeDefaults,
  extractScssThemeVars,
  mergeThemeVariableLayers,
} from "../../styling/theme";
import { useThemeVariables } from "../../runtime/rendering/theme";
import { componentMetadataToContract } from "../../component-core/metadata/contract";
import {
  createMetadata,
  dComponent,
} from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { Heading, normalizeHeadingLevel } from "./HeadingReact";
import headingStylesSource from "./Heading.module.scss?xmlui-theme-vars";
import { defaultProps } from "./Heading.defaults";

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
  },
});

export const H1Md = createMetadata({
  status: "stable",
  description: "Represents a heading level 1 text.",
  specializedFrom: COMP,
  props: sharedHeadingProps,
  apis,
  contextVars,
  themeVars: extractScssThemeVars(headingStylesSource),
  defaultThemeVars: {
    "fontSize-H1": "$fontSize-2xl",
    "lineHeight-H1": "$lineHeight-tight",
    "marginTop-H1": "0",
    "marginBottom-H1": "0",
    "fontSize-H1-markdown": "$fontSize-2xl",
    "marginTop-H1-markdown": "0",
    "marginBottom-H1-markdown": "$space-6",
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

export const headingContract = componentMetadataToContract(HeadingMd, {
  name: "Heading",
  includeLayoutProps: true,
});
export const h1Contract = componentMetadataToContract(H1Md, {
  name: "H1",
  includeLayoutProps: true,
});
export const h2Contract = componentMetadataToContract(H2Md, {
  name: "H2",
  includeLayoutProps: true,
});
export const h3Contract = componentMetadataToContract(H3Md, {
  name: "H3",
  includeLayoutProps: true,
});
export const h4Contract = componentMetadataToContract(H4Md, {
  name: "H4",
  includeLayoutProps: true,
});
export const h5Contract = componentMetadataToContract(H5Md, {
  name: "H5",
  includeLayoutProps: true,
});
export const h6Contract = componentMetadataToContract(H6Md, {
  name: "H6",
  includeLayoutProps: true,
});

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
    props: sharedHeadingProps,
    apis,
    contextVars,
    themeVars: extractScssThemeVars(headingStylesSource),
    defaultThemeVars: {
      [`fontSize-${name}`]: `$fontSize-${shortcutSize(name)}`,
      [`lineHeight-${name}`]: "$lineHeight-tight",
      [`marginTop-${name}`]: "0",
      [`marginBottom-${name}`]: "0",
      [`fontSize-${name}-markdown`]: `$fontSize-${shortcutSize(name)}`,
      [`marginTop-${name}-markdown`]: "0",
      [`marginBottom-${name}-markdown`]: "$space-6",
    },
  });
}

function shortcutSize(name: string): string {
  return ({
    H2: "xl",
    H3: "lg",
    H4: "md",
    H5: "sm",
    H6: "xs",
  } as Record<string, string>)[name] ?? "md";
}

function createHeadingRenderer(name: string, metadata: ComponentMetadata, fixedLevel?: string) {
  return wrapComponent({
    name,
    metadata,
    renderer: ({ adapter }) => {
      const themeVariables = useThemeVariables();
      const mergedThemeVariables = mergeThemeVariableLayers([
        collectComponentThemeDefaults(HeadingMd),
        collectComponentThemeDefaults(metadata),
        themeVariables,
      ]);
      const hasValue = Object.prototype.hasOwnProperty.call(adapter.node.props, "value");
      const value = adapter.prop("value");
      const children = hasValue ? displayText(value) : adapter.renderChildren();
      const level = fixedLevel ?? normalizeHeadingLevel(adapter.prop("level", defaultProps.level));

      return (
        <Heading
          {...adapter.rootAttrs()}
          id={adapter.stringProp("id")}
          level={level}
          maxLines={adapter.numberProp("maxLines", defaultProps.maxLines)}
          preserveLinebreaks={adapter.booleanProp("preserveLinebreaks", defaultProps.preserveLinebreaks)}
          ellipses={adapter.booleanProp("ellipses", defaultProps.ellipses)}
          omitFromToc={adapter.booleanProp("omitFromToc", defaultProps.omitFromToc)}
          showAnchor={adapter.booleanProp("showAnchor", defaultProps.showAnchor)}
          themeVariables={mergedThemeVariables}
          registerApi={adapter.registerApi}
        >
          {children}
        </Heading>
      );
    },
  });
}

function displayText(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}
