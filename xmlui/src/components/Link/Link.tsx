import type { CSSProperties, MouseEvent } from "react";
import React from "react";

import { createMetadata, dEnabled, dLabel } from "../../component-core/metadata/helpers";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import {
  collectComponentThemeDefaults,
  extractScssThemeVars,
} from "../../styling/theme";
import { defaultProps } from "./Link.defaults";
import { LinkNative } from "./LinkReact";

const COMP = "Link";

const alignmentOptionValues = [
  "start",
  "center",
  "end",
  "stretch",
  "baseline",
] as const;

const linkStylesSource = `
$padding-Link: createThemeVar("padding-Link");
$paddingHorizontal-Link: createThemeVar("paddingHorizontal-Link");
$paddingVertical-Link: createThemeVar("paddingVertical-Link");
$paddingLeft-Link: createThemeVar("paddingLeft-Link");
$paddingRight-Link: createThemeVar("paddingRight-Link");
$paddingTop-Link: createThemeVar("paddingTop-Link");
$paddingBottom-Link: createThemeVar("paddingBottom-Link");
$padding-icon-Link: createThemeVar("padding-icon-Link");
$paddingHorizontal-icon-Link: createThemeVar("paddingHorizontal-icon-Link");
$paddingVertical-icon-Link: createThemeVar("paddingVertical-icon-Link");
$paddingLeft-icon-Link: createThemeVar("paddingLeft-icon-Link");
$paddingRight-icon-Link: createThemeVar("paddingRight-icon-Link");
$paddingTop-icon-Link: createThemeVar("paddingTop-icon-Link");
$paddingBottom-icon-Link: createThemeVar("paddingBottom-icon-Link");
$border-Link: createThemeVar("border-Link");
$borderHorizontal-Link: createThemeVar("borderHorizontal-Link");
$borderVertical-Link: createThemeVar("borderVertical-Link");
$borderLeft-Link: createThemeVar("borderLeft-Link");
$borderRight-Link: createThemeVar("borderRight-Link");
$borderTop-Link: createThemeVar("borderTop-Link");
$borderBottom-Link: createThemeVar("borderBottom-Link");
$borderWidth-Link: createThemeVar("borderWidth-Link");
$borderHorizontalWidth-Link: createThemeVar("borderHorizontalWidth-Link");
$borderVerticalWidth-Link: createThemeVar("borderVerticalWidth-Link");
$borderLeftWidth-Link: createThemeVar("borderLeftWidth-Link");
$borderRightWidth-Link: createThemeVar("borderRightWidth-Link");
$borderTopWidth-Link: createThemeVar("borderTopWidth-Link");
$borderBottomWidth-Link: createThemeVar("borderBottomWidth-Link");
$borderStyle-Link: createThemeVar("borderStyle-Link");
$borderHorizontalStyle-Link: createThemeVar("borderHorizontalStyle-Link");
$borderVerticalStyle-Link: createThemeVar("borderVerticalStyle-Link");
$borderLeftStyle-Link: createThemeVar("borderLeftStyle-Link");
$borderRightStyle-Link: createThemeVar("borderRightStyle-Link");
$borderTopStyle-Link: createThemeVar("borderTopStyle-Link");
$borderBottomStyle-Link: createThemeVar("borderBottomStyle-Link");
$borderColor-Link: createThemeVar("borderColor-Link");
$borderHorizontalColor-Link: createThemeVar("borderHorizontalColor-Link");
$borderVerticalColor-Link: createThemeVar("borderVerticalColor-Link");
$borderLeftColor-Link: createThemeVar("borderLeftColor-Link");
$borderRightColor-Link: createThemeVar("borderRightColor-Link");
$borderTopColor-Link: createThemeVar("borderTopColor-Link");
$borderBottomColor-Link: createThemeVar("borderBottomColor-Link");
$fontFamily-Link: createThemeVar("fontFamily-Link");
$fontSize-Link: createThemeVar("fontSize-Link");
$fontWeight-Link: createThemeVar("fontWeight-Link");
$fontStyle-Link: createThemeVar("fontStyle-Link");
$backgroundColor-Link: createThemeVar("backgroundColor-Link");
$textColor-Link: createThemeVar("textColor-Link");
$textColor-Link--active: createThemeVar("textColor-Link--active");
$textColor-Link--hover: createThemeVar("textColor-Link--hover");
$textColor-Link--hover--active: createThemeVar("textColor-Link--hover--active");
$fontWeight-Link--active: createThemeVar("fontWeight-Link--active");
$gap-icon-Link: createThemeVar("gap-icon-Link");
$textUnderlineOffset-Link: createThemeVar("textUnderlineOffset-Link");
$textDecorationLine-Link: createThemeVar("textDecorationLine-Link");
$textDecorationColor-Link: createThemeVar("textDecorationColor-Link");
$textDecorationColor-Link--hover: createThemeVar("textDecorationColor-Link--hover");
$textDecorationColor-Link--active: createThemeVar("textDecorationColor-Link--active");
$textDecorationStyle-Link: createThemeVar("textDecorationStyle-Link");
$textDecorationThickness-Link: createThemeVar("textDecorationThickness-Link");
$outlineWidth-Link--focus: createThemeVar("outlineWidth-Link--focus");
$outlineColor-Link--focus: createThemeVar("outlineColor-Link--focus");
$outlineStyle-Link--focus: createThemeVar("outlineStyle-Link--focus");
$outlineOffset-Link--focus: createThemeVar("outlineOffset-Link--focus");
`;

export const LinkMd = createMetadata({
  status: "stable",
  description:
    "`Link` creates clickable navigation elements for internal app routes or external URLs.",
  allowArbitraryProps: true,
  parts: {
    icon: {
      description: "The icon within the Link component.",
    },
  },
  props: {
    to: {
      description: "This property defines the URL of the link.",
      valueType: "any",
    },
    enabled: dEnabled(defaultProps.enabled),
    active: {
      description: "Indicates whether this link is active.",
      valueType: "boolean",
      defaultValue: defaultProps.active,
    },
    noIndicator: {
      description: "Indicates whether this link should hide its visual indicator.",
      valueType: "boolean",
      defaultValue: defaultProps.noIndicator,
    },
    target: {
      description: "This property specifies where to open the link.",
      valueType: "string",
    },
    label: dLabel(),
    icon: {
      description: "This property allows you to add an optional icon to the link.",
      valueType: "icon",
    },
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
      description: "This property determines the maximum number of lines the component can wrap to.",
      valueType: "number",
    },
    preserveLinebreaks: {
      description: "This property indicates if linebreaks should be preserved when displaying text.",
      valueType: "boolean",
      defaultValue: defaultProps.preserveLinebreaks,
    },
    ellipses: {
      description: "This property indicates whether ellipses should be displayed when text is cropped.",
      valueType: "boolean",
      defaultValue: defaultProps.ellipses,
    },
    breakMode: {
      description: "This property controls how text breaks into multiple lines.",
      valueType: "string",
      defaultValue: "normal",
      availableValues: ["normal", "word", "anywhere", "keep", "hyphenate"],
    },
    overflowMode: {
      description: "This property controls how text overflow is handled.",
      valueType: "string",
      availableValues: ["none", "ellipsis", "scroll", "flow"],
    },
    tooltip: {
      description: "The text to display in the tooltip.",
      valueType: "string",
    },
    tooltipMarkdown: {
      description: "The markdown text to display in the tooltip.",
      valueType: "string",
    },
    animation: {
      description: "The animation definition.",
      valueType: "any",
    },
    variant: {
      description: "The variant value to apply.",
      valueType: "string",
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
    contextMenu: {
      description: "This event is triggered when the link is right-clicked.",
      signature: "contextMenu(event: MouseEvent): void",
      parameters: {
        event: "The mouse event that triggered the context menu.",
      },
    },
  },
  themeVars: extractScssThemeVars(linkStylesSource),
  themeVarDescriptions: {
    [`gap-icon-${COMP}`]: "This property defines the size of the gap between the icon and the label.",
  },
  defaultThemeVars: {
    [`border-${COMP}`]: "0px solid $borderColor",
    [`borderWidth-${COMP}`]: "0px",
    [`borderStyle-${COMP}`]: "solid",
    [`borderColor-${COMP}`]: "$borderColor",
    [`textColor-${COMP}`]: "$color-primary-500",
    [`textDecorationColor-${COMP}`]: `$textColor-${COMP}`,
    [`textColor-${COMP}--hover`]: `$color-primary-400`,
    [`textDecorationColor-${COMP}--hover`]: `$textColor-${COMP}--hover`,
    [`textColor-${COMP}--active`]: "$color-primary-400",
    [`textDecorationColor-${COMP}--active`]: `$textColor-${COMP}--active`,
    [`textColor-${COMP}--hover--active`]: `$textColor-${COMP}--active`,
    [`textUnderlineOffset-${COMP}`]: "$space-1",
    [`textDecorationLine-${COMP}`]: "underline",
    [`textDecorationStyle-${COMP}`]: "solid",
    [`textDecorationThickness-${COMP}`]: "auto",
    [`outlineColor-${COMP}--focus`]: "$outlineColor--focus",
    [`outlineWidth-${COMP}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${COMP}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${COMP}--focus`]: "$outlineOffset--focus",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`fontSize-${COMP}`]: "inherit",
    [`fontWeight-${COMP}`]: "inherit",
    [`fontStyle-${COMP}`]: "inherit",
    [`backgroundColor-${COMP}`]: "transparent",
    [`fontWeight-${COMP}--active`]: "$fontWeight-bold",
    [`gap-icon-${COMP}`]: "$gap-tight",
    [`padding-${COMP}`]: "0",
    [`padding-icon-${COMP}`]: "$space-0_5",
  },
});

type ThemedLinkNativeProps = React.ComponentPropsWithoutRef<typeof LinkNative>;

export const ThemedLinkNative = React.forwardRef<
  React.ElementRef<typeof LinkNative>,
  ThemedLinkNativeProps
>(function ThemedLinkNative({ className, ...props }, ref) {
  const themeClass = useComponentThemeClass(LinkMd);
  const navigateInternally = (event: MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => {
    props.onClick?.(event);
    if (
      typeof props.to === "string" &&
      props.to.startsWith("/") &&
      !props.to.startsWith("//") &&
      !props.target
    ) {
      event.preventDefault();
      window.history.pushState({}, "", props.to);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };
  return (
    <LinkNative
      {...props}
      className={`${themeClass}${className ? ` ${className}` : ""}`}
      onClick={navigateInternally}
      ref={ref}
    />
  );
});
