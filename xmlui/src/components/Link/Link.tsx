import styles from "./Link.module.scss";

import React from "react";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, d, dEnabled, dLabel } from "../metadata-helpers";
import { LinkTargetMd, alignmentOptionValues } from "../abstractions";
import { LinkNative, defaultProps } from "./LinkNative";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { wrapComponent } from "../../components-core/wrapComponent";

const COMP = "Link";

export const LinkMd = createMetadata({
  status: "stable",
  description:
    "`Link` creates clickable navigation elements for internal app routes or " +
    "external URLs. You can use the `label` and `icon` properties for simple text " +
    "links, or embed custom components like buttons, cards, or complex layouts " +
    "for rich interactive link presentations.",
  parts: {
    icon: {
      description: "The icon within the Link component.",
    }
  },
  props: {
    to: d(
      "This property defines the URL of the link. If the value is not defined, the link cannot be activated.",
    ),
    enabled: dEnabled(),
    active: {
      description: `Indicates whether this link is active or not. If so, it will have a distinct visual appearance.`,
      type: "boolean",
      defaultValue: defaultProps.active,
    },
    noIndicator: {
      description: `Indicates whether this link should have a distinct visual appearance.`,
      type: "boolean",
      defaultValue: false,
    },
    target: {
      description:
        `This property specifies where to open the link represented by the \`${COMP}\`. This ` +
        `property accepts the following values (in accordance with the HTML standard):`,
      availableValues: LinkTargetMd,
      type: "string",
    },
    label: dLabel(),
    icon: d(
      `This property allows you to add an optional icon (specify the icon's name) to the link.`,
    ),
    horizontalAlignment: {
      description: "Manages the horizontal content alignment for child elements in the Link.",
      availableValues: alignmentOptionValues,
      valueType: "string",
      defaultValue: "start",
    },
    verticalAlignment: {
      description: "Manages the vertical content alignment for child elements in the Link.",
      availableValues: alignmentOptionValues,
      valueType: "string",
      defaultValue: "start",
    },
    maxLines: {
      description:
        "This property determines the maximum number of lines the component can wrap to. " +
        "If there is no space to display all the contents, the component displays up to as " +
        "many lines as specified in this property. When the value is not defined, there is " +
        "no limit on the displayed lines.",
      valueType: "number",
    },
    preserveLinebreaks: {
      description: `This property indicates if linebreaks should be preserved when displaying text.`,
      valueType: "boolean",
      defaultValue: defaultProps.preserveLinebreaks,
    },
    ellipses: {
      description:
        "This property indicates whether ellipses should be displayed when the text is " +
        "cropped (`true`) or not (`false`).",
      valueType: "boolean",
      defaultValue: defaultProps.ellipses,
    },
    breakMode: {
      description:
        "This property controls how text breaks into multiple lines. " +
        "`normal` uses standard word boundaries, `word` breaks long words to prevent overflow, " +
        "`anywhere` breaks at any character, `keep` prevents word breaking, " +
        "and `hyphenate` uses automatic hyphenation. When not specified, uses the default browser behavior.",
      valueType: "string",
      defaultValue: "normal",
      availableValues: [
        { value: "normal", description: "Uses standard word boundaries for breaking" },
        { value: "word", description: "Breaks long words when necessary to prevent overflow" },
        { value: "anywhere", description: "Breaks at any character if needed to fit content" },
        { value: "keep", description: "Prevents breaking within words entirely" },
        { value: "hyphenate", description: "Uses automatic hyphenation when breaking words" },
      ],
    },
    overflowMode: {
      description:
        "This property controls how text overflow is handled. " +
        "`none` prevents wrapping and shows no overflow indicator, " +
        "`ellipsis` shows ellipses when text is truncated, `scroll` forces single line with horizontal scrolling, " +
        "and `flow` allows multi-line wrapping with vertical scrolling when needed (ignores maxLines). " +
        "When not specified, uses the default text behavior.",
      valueType: "string",
      defaultValue: "not specified",
      availableValues: [
        {
          value: "none",
          description:
            "No wrapping, text stays on a single line with no overflow indicator (ignores maxLines)",
        },
        { value: "ellipsis", description: "Truncates with an ellipsis (default)" },
        {
          value: "scroll",
          description:
            "Forces single line with horizontal scrolling when content overflows (ignores maxLines)",
        },
        {
          value: "flow",
          description:
            "Allows text to wrap into multiple lines with vertical scrolling when container height is constrained (ignores maxLines)",
        },
      ],
    },
  },
  events: {
    click: {
      description: "This event is triggered when the link is clicked.",
      signature: "click(event: MouseEvent): void",
      parameters: {
        event: "The mouse event that triggered the click.",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  themeVarDescriptions: {
    [`gap-icon-${COMP}`]:
      "This property defines the size of the gap between the icon and the label.",
  },
  defaultThemeVars: {
    [`border-${COMP}`]: "0px solid $borderColor",
    [`textColor-${COMP}`]: "$color-primary-500",
    [`textDecorationColor-${COMP}`]: `textDecorationColor-${COMP}`,
    [`textColor-${COMP}--hover`]: `$color-primary-400`,
    [`textDecorationColor-${COMP}--hover`]: `textColor-${COMP}--hover`,
    [`textColor-${COMP}--active`]: "$color-primary-400",
    [`textDecorationColor-${COMP}--active`]: `textColor-${COMP}--active`,
    [`textColor-${COMP}--hover--active`]: `$textColor-${COMP}--active`,
    [`textUnderlineOffset-${COMP}`]: "$space-1",
    [`textDecorationLine-${COMP}`]: "underline",
    [`textDecorationStyle-${COMP}`]: "solid",
    [`outlineColor-${COMP}--focus`]: "$outlineColor--focus",
    [`outlineWidth-${COMP}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${COMP}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${COMP}--focus`]: "$outlineOffset--focus",
    [`fontSize-${COMP}`]: "inherit",
    [`fontWeight-${COMP}--active`]: "$fontWeight-bold",
    [`gap-icon-${COMP}`]: "$gap-tight",
    [`padding-icon-${COMP}`]: "$space-0_5",
    dark: {
      [`textColor-${COMP}`]: "$color-primary-600",
      [`textColor-${COMP}--hover`]: `$color-primary-500`,
      [`textColor-${COMP}--active`]: "$color-primary-500",
    }
  },
});

/**
 * This function defines the renderer for the Link component.
 */
type ThemedLinkNativeProps = React.ComponentProps<typeof LinkNative> & { className?: string };
export const ThemedLinkNative = React.forwardRef<HTMLDivElement, ThemedLinkNativeProps>(
  function ThemedLinkNative({ className, ...props }: ThemedLinkNativeProps, ref) {
    const themeClass = useComponentThemeClass(LinkMd);
    return <LinkNative {...props} className={`${themeClass}${className ? ` ${className}` : ""}`} ref={ref} />;
  },
);

export const localLinkComponentRenderer = wrapComponent(
  COMP,
  ThemedLinkNative,
  LinkMd,
  {
    deriveAriaLabel: (props) => props.label,
  },
);
