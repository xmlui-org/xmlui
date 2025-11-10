/**
 * Avatar2 Component Renderer - Runtime CSS Implementation
 * 
 * This is the component renderer for Avatar2, using explicit theme variable
 * registration instead of SCSS-based parseScssVar(). This demonstrates the
 * new pattern for component metadata without SCSS dependencies.
 */

import { createComponentRenderer } from "../../components-core/renderers";
import { sizeMd } from "../../components/abstractions";
import { Avatar2, defaultProps } from "./Avatar2Native";
import { createMetadata, d } from "../metadata-helpers";

const COMP = "Avatar2";

export const Avatar2Md = createMetadata({
  status: "experimental", // Mark as experimental during prototype phase
  description:
    "`Avatar2` is a prototype implementation of Avatar using runtime CSS generation. " +
    "It displays a user or entity's profile picture as a circular image, " +
    "with automatic fallback to initials when no image is provided. It's commonly " +
    "used in headers, user lists, comments, and anywhere you need to represent a " +
    "person or organization.",
  props: {
    size: {
      description: `This property defines the display size of the ${COMP}.`,
      availableValues: sizeMd,
      valueType: "string",
      defaultValue: defaultProps.size,
    },
    name: {
      description:
        `This property sets the name value the ${COMP} uses to display initials. If neither ` +
        "this property nor `url` is defined, an empty avatar is displayed.",
      valueType: "string",
    },
    url: {
      description:
        `This property specifies the URL of the image to display in the ${COMP}. ` +
        "If neither this property nor `name` is defined, an empty avatar is displayed.",
      valueType: "string",
    },
  },
  events: {
    click: d("This event is triggered when the avatar is clicked."),
  },
  // Explicitly list theme variables instead of parsing from SCSS
  // This corresponds to the variables registered via composeBorderVars + explicit createThemeVar calls
  // Format: Record<string, string> - keys are variable names, values are initial values or ""
  themeVars: {
    // Border composite variables (from composeBorderVars)
    "border-Avatar2": "",
    "borderHorizontal-Avatar2": "",
    "borderVertical-Avatar2": "",
    "borderLeft-Avatar2": "",
    "borderRight-Avatar2": "",
    "borderTop-Avatar2": "",
    "borderBottom-Avatar2": "",
    "borderWidth-Avatar2": "",
    "borderHorizontalWidth-Avatar2": "",
    "borderVerticalWidth-Avatar2": "",
    "borderLeftWidth-Avatar2": "",
    "borderRightWidth-Avatar2": "",
    "borderTopWidth-Avatar2": "",
    "borderBottomWidth-Avatar2": "",
    "borderStyle-Avatar2": "",
    "borderHorizontalStyle-Avatar2": "",
    "borderVerticalStyle-Avatar2": "",
    "borderLeftStyle-Avatar2": "",
    "borderRightStyle-Avatar2": "",
    "borderTopStyle-Avatar2": "",
    "borderBottomStyle-Avatar2": "",
    "borderColor-Avatar2": "",
    "borderHorizontalColor-Avatar2": "",
    "borderVerticalColor-Avatar2": "",
    "borderLeftColor-Avatar2": "",
    "borderRightColor-Avatar2": "",
    "borderTopColor-Avatar2": "",
    "borderBottomColor-Avatar2": "",
    "borderRadius-Avatar2": "",
    "borderStartStartRadius-Avatar2": "",
    "borderStartEndRadius-Avatar2": "",
    "borderEndStartRadius-Avatar2": "",
    "borderEndEndRadius-Avatar2": "",
    // Component-specific variables
    "backgroundColor-Avatar2": "",
    "boxShadow-Avatar2": "",
    "textColor-Avatar2": "",
    "fontWeight-Avatar2": "",
  },
  defaultThemeVars: {
    [`borderRadius-Avatar2`]: "4px",
    [`boxShadow-Avatar2`]: "inset 0 0 0 1px rgba(4,32,69,0.1)",
    [`textColor-Avatar2`]: "$textColor-secondary",
    [`fontWeight-Avatar2`]: "$fontWeight-bold",
    [`border-Avatar2`]: "0px solid $color-surface-400A80",
    [`backgroundColor-Avatar2`]: "$color-surface-100",
  },
});

export const avatar2ComponentRenderer = createComponentRenderer(
  COMP,
  Avatar2Md,
  ({ node, extractValue, lookupEventHandler, className, extractResourceUrl }) => {
    return (
      <Avatar2
        className={className}
        size={node.props?.size}
        url={node.props.url ? extractResourceUrl(node.props.url) : undefined}
        name={extractValue(node.props.name)}
        onClick={lookupEventHandler("click")}
      />
    );
  },
);
