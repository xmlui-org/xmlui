import type { CSSProperties, Ref } from "react";
import { forwardRef } from "react";
import classnames from "@components-core/utils/classnames";

import styles from "./Avatar.module.scss";

import type { ComponentDescriptor, IsValidFunction, PropertyValueType } from "@abstractions/ComponentDescriptorDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import { sizeNames } from "@components/abstractions";
import { CollectedDeclarations } from "@abstractions/scripting/ScriptingSourceTree";
import { DefaultThemeVars } from "@components/ViewComponentRegistryContext";
import { ComponentDefNew, AvatarMetadataNew } from "./AvatarMd";

// =====================================================================================================================
// React Avatar component implementation

type Props = {
  size?: string;
  url?: string;
  name?: string;
  style?: CSSProperties;
} & Pick<React.HTMLAttributes<HTMLDivElement>, "onClick">;

export const Avatar = forwardRef(function Avatar(
  { size = "sm", url, name, style, onClick, ...rest }: Props,
  ref: Ref<any>,
) {
  let abbrev = null;
  if (!url && !!name) {
    abbrev = name
      .trim()
      .split(" ")
      .filter((word) => !!word.trim().length)
      .map((word) => word[0].toUpperCase())
      .slice(0, 3);
  }
  return (
    <div
      {...rest}
      ref={ref}
      className={classnames(styles.container, {
        [styles.xs]: size === "xs",
        [styles.sm]: size === "sm",
        [styles.md]: size === "md",
        [styles.lg]: size === "lg",
        [styles.clickable]: !!onClick,
      })}
      style={{ backgroundImage: url ? `url(${url})` : "none", ...style }}
      onClick={onClick}
    >
      {abbrev}
    </div>
  );
});

// =====================================================================================================================
// XMLUI Avatar component definition

type ComponentFieldMetadata = {
  // The markdown description to explain the property in the inspector view
  readonly description: string;
};

type ComponentPropertyMetadata = ComponentFieldMetadata & {
  // The markdown description to explain the property in the inspector view
  readonly description: string;

  // The value type of the property
  readonly valueType?: PropertyValueType;

  // What are the available values of this property?
  readonly availableValues?: any[];

  // The default property value (if there is any)
  defaultValue?: any;

  // The function that tests if the current property value is valid
  isValid?: IsValidFunction<any>;
};

type ComponentEventMetadata = ComponentFieldMetadata;

type ComponentContextVarMetadata = ComponentFieldMetadata;

type ComponentApiMetadata = ComponentFieldMetadata;

// =====================================================================================================================
// Experiment with types

type AvatarComponentDef = ComponentDefNew<"Avatar", typeof AvatarMetadataNew>;

/**
 * This function defines the renderer for the Avatar component.
 */
export const avatarComponentRenderer = createComponentRenderer<AvatarComponentDef>(
  "Avatar",
  ({ node, extractValue, lookupEventHandler, layoutCss, extractResourceUrl }) => {
    return (
      <Avatar
        size={node.props?.size}
        url={extractResourceUrl(node.props.url)}
        name={extractValue(node.props.name)}
        style={layoutCss}
        onClick={lookupEventHandler("click")}
      />
    );
  },
  AvatarMetadataNew,
);
