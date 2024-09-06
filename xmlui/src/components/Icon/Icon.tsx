import {type CSSProperties, forwardRef} from "react";
import type React from "react";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { createComponentRenderer } from "@components-core/renderers";
import styles from "./Icon.module.scss";
import { useCustomSvgIconRenderer, useIconRegistry } from "@components/IconRegistryContext";
import classnames from "@components-core/utils/classnames";
import { useResourceUrl, useTheme } from "@components-core/theming/ThemeContext";
import { parseScssVar } from "@components-core/theming/themeVars";
import { desc } from "@components-core/descriptorHelper";

export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
  children?: React.ReactNode;
  color?: string;
  title?: string;
  size?: string;
  isInline?: boolean;
  fallback?: string | React.ReactNode;
  layout?: CSSProperties;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Icon = forwardRef(function Icon({ name, fallback, layout, className, ...restProps }: IconBaseProps, ref) {
  const lowerCaseIconName = name?.toLowerCase();
  const iconRegistry = useIconRegistry();
  const customIconUrl = useCustomIconUrl(name);
  const computedSize = typeof restProps?.size === "string" ? mapSizeToIconPack(restProps.size) : restProps?.size;
  let iconRenderer = iconRegistry.lookupIconRenderer(lowerCaseIconName || "");
  if (!iconRenderer && typeof fallback === "string") {
    iconRenderer = iconRegistry.lookupIconRenderer(fallback);
  }
  const renderIcon = iconRenderer?.renderer;

  const width = computedSize || restProps.width;
  const height = computedSize || restProps.height;
  const computedProps = {
    // className is needed to apply a default color to the icon, thus other component classes can override this one
    className: classnames(styles.base, className),
    ...restProps,
    size: computedSize,
    width: width,
    height: height,
    style: {
      ...layout,
      "--icon-width": width,
      "--icon-height": height,
    },
  };

  // ---
  if (customIconUrl) {
    return (
        <CustomIcon {...computedProps} url={customIconUrl} name={name} />
    );
  }
  return renderIcon ? renderIcon(computedProps) : null;
});

function CustomIcon(props: IconBaseProps & { size?: string; url: string }) {
  const { url, width, height, name, style, className } = props;

  const resourceUrl = useResourceUrl(url);
  const isSvgIcon = resourceUrl?.toLowerCase()?.endsWith(".svg");
  const customSvgIconRenderer = useCustomSvgIconRenderer(resourceUrl);

  if (resourceUrl && isSvgIcon) {
    const renderedIcon = customSvgIconRenderer?.({ style, className });
    if (!renderedIcon) {
      //to prevent layout shift
      return <span style={style} className={className} />;
    }
    return renderedIcon;
  }

  return <img src={resourceUrl} style={{ width, height, ...style }} alt={name} />;
}

function useCustomIconUrl(iconName?: string) {
  const { getResourceUrl } = useTheme();
  if (!iconName) {
    return iconName;
  }
  return getResourceUrl(`resource:icon.${iconName}`);
}

function mapSizeToIconPack(size: string) {
  return (
    {
      xs: "0.75em",
      sm: "1em",
      md: "1.5rem",
      lg: "2em",
    }[size] || size
  );
}

export default Icon;

const IconSizeKeys = ["xs", "sm", "md", "lg"] as const;
type IconSize = (typeof IconSizeKeys)[number];
const isIconSize = (str: any): str is IconSize => IconSizeKeys.indexOf(str) !== -1;

// ============================================================================
// XMLUI Icon definition

/** 
 * This component is the representation of an icon.
 * It is a small visual element, which is used to graphically represent functions, features,
 * or types of content within a user interface.
 */
export interface IconComponentDef extends ComponentDef<"Icon"> {
  props: {
    /** 
     * This string property specifies the name of the icon to display.
     * All icons have unique names and identifying the name is case-sensitive.
     * The engine looks up the icon in its [registry]() and determines which icon is associated with the name that the component will show.
     * Nothing is displayed if the icon name is not found in the registry.
     * @descriptionRef
     */
    name: string;
    /** 
     * This property defines the size of the \`Icon\`.
     * Note that setting the \`height\` and/or the \`width\` of the component will override this property.
     * @descriptionRef
     */
    size?: string;
    /** 
     * This optional property provides a way to handle situations when the provided [icon name](#name) is not found in the registry.
     * Works the same way as the [\`name\`](#name) property.
     * @descriptionRef
     */
    fallback?: string | ComponentDef;
  };
}

const metadata: ComponentDescriptor<IconComponentDef> = {
  displayName: "Icon",
  description: "Represent a button component that can be used to trigger a use action",
  props: {
    name: desc("Name (and ID) of the icon to display"),
    size: desc(
      "Set the size of the icon which comes from a set of predefined sizes - applied to our icon pack elements"
    ),
    fallback: desc(
      "Fallback icon if the original is unavailable - can only be an icon from our icon pack, otherwise error are abound"
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "size-Icon": "1.25em",
  },
};

export const iconComponentRenderer = createComponentRenderer<IconComponentDef>(
  "Icon",
  ({ node, extractValue, renderChild, layoutCss }) => {
    return (
      <Icon
        name={extractValue.asOptionalString(node.props.name)}
        size={extractValue(node.props.size)}
        layout={layoutCss}
        fallback={
          node.props.fallback ?? typeof node.props.fallback === "string"
            ? extractValue(node.props.fallback)
            : renderChild(node.props.fallback)
        }
      />
    );
  },
  metadata
);
