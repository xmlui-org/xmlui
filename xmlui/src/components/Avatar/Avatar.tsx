import type { CSSProperties, Ref } from "react";
import { forwardRef } from "react";
import classnames from "@components-core/utils/classnames";

import styles from "./Avatar.module.scss";

import type { ComponentDef } from "@abstractions/ComponentDefs";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";

// =====================================================================================================================
// React Avatar component implementation

type Props = {
  size?: AvatarSize;
  url?: string;
  name?: string;
  style?: CSSProperties;
} & Pick<React.HTMLAttributes<HTMLDivElement>, "onClick">;

export const Avatar = forwardRef(function Avatar(
  { size = "sm", url, name, style, onClick, ...rest }: Props,
  ref: Ref<any>
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

/** 
 * The \`Avatar\` component represents a user, group (or other entity's) avatar with a small image or initials.
 */
export interface AvatarComponentDef extends ComponentDef<"Avatar"> {
  props: {
    /** 
     * @descriptionRef
     * @defaultValue \`sm\`
     */
    size?: AvatarSize;
    /** @descriptionRef */
    name?: string;
    /** @descriptionRef */
    url?: string;
  };
  events: {
    /** @descriptionRef */
    click?: string;
  };
}

const AvatarSizeKeys = ["xs", "sm", "md", "lg"] as const;
type AvatarSize = (typeof AvatarSizeKeys)[number];

const metadata: ComponentDescriptor<AvatarComponentDef> = {
  displayName: "Avatar",
  description: "Display an avatar associated with an entity",
  props: {
    size: desc("Size of the avatar (xs, sm, md, or lg)"),
    name: desc("Name to extract the first letters of words as avatar text"),
    url: desc("Url of the avatar image"),
  },
  events: {
    click: desc("Triggers when the avatar is clicked"),
  },

  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "radius-Avatar": "4px",
    "thickness-border-Avatar": "0px",
    "style-border-Avatar": "solid",
    "border-Avatar": "$thickness-border-Avatar $style-border-Avatar $color-border-Avatar",
    "shadow-Avatar": "inset 0 0 0 1px rgba(4,32,69,0.1)",
    "color-text-Avatar": "$color-text-secondary",
    "font-weight-Avatar": "$font-weight-bold",
    light: {
      "color-bg-Avatar": "$color-surface-100",
      "color-border-Avatar": "$color-surface-400A80",
    },
    dark: {
      "color-bg-Avatar": "$color-surface-800",
      "color-border-Avatar": "$color-surface-700",
    },
  },
};

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
      />
    );
  },
  metadata
);
