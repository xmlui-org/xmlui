import styles from "./Card.module.scss";
import classnames from "@components-core/utils/classnames";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import type { CSSProperties, ReactNode } from "react";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import { desc } from "@components-core/descriptorHelper";
import { Avatar } from "@components/Avatar/Avatar";
import { LocalLink } from "@components/Link/Link";
import type { HeadingProps } from "@components/Heading/Heading";
import { Heading } from "@components/Heading/Heading";
import { Stack } from "@components/Stack/Stack";
import { Text } from "@components/Text/Text";

// =====================================================================================================================
// React Card component implementation

type Props = {
  style?: CSSProperties;
  children?: ReactNode;
  title?: string;
  subTitle?: string;
  linkTo?: string;
  avatarUrl?: string;
  showAvatar?: boolean;
  onClick?: any;
};

export function Card({
  children,
  style,
  title,
  subTitle,
  linkTo,
  avatarUrl,
  showAvatar = !!avatarUrl || false,
  onClick,
}: Props) {
  const titleProps: Partial<HeadingProps> = {
    level: "h2",
    layout: { marginTop: 0, marginBottom: "4px" },
  };
  return (
    <div className={classnames(styles.wrapper, { [styles.isClickable]: !!onClick })} style={style} onClick={onClick}>
      {[title, subTitle, avatarUrl, showAvatar].some(Boolean) && (
        <Stack orientation="horizontal" verticalAlignment="center" layout={{ gap: "1rem" }}>
          {showAvatar && <Avatar url={avatarUrl} name={title} />}
          <Stack orientation="vertical">
            {linkTo ? (
              <LocalLink to={linkTo + ""}>
                <Heading {...titleProps}>{title}</Heading>
              </LocalLink>
            ) : (
              <Heading {...titleProps}>{title}</Heading>
            )}
            <Text variant="small">{subTitle}</Text>
          </Stack>
        </Stack>
      )}
      {children}
    </div>
  );
}

// =====================================================================================================================
// XMLUI Card component definition

/**
 * The \`Card\` component is a container for cohesive elements, often rendered visually as a card.
 */
export interface CardComponentDef extends ComponentDef<"Card"> {
  props: {
    /** @descriptionRef */
    title?: string;
    /** @descriptionRef */
    subTitle?: string;
    /** @descriptionRef */
    linkTo?: string;
    /** @descriptionRef */
    avatarUrl?: string;
    /** @descriptionRef */
    showAvatar?: boolean;
  };
  events: {
    /** @descriptionRef */
    click: string;
  };
}

const metadata: ComponentDescriptor<CardComponentDef> = {
  displayName: "Card",
  description: "A component displaying its children in a card",
  props: {
    avatarUrl: desc("The URL of the avatar to display"),
    showAvatar: desc("Indicates whether the avatar should be displayed"),
    title: desc("A prestyled title"),
    subTitle: desc("A prestyled subtitle"),
    linkTo: desc("Optional link for the title"),
    
  },
  events: {
    click: desc("The card is clicked"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "padding-horizontal-Card": "$space-4",
    "padding-vertical-Card": "$space-4",
    "padding-Card": "$padding-vertical-Card $padding-horizontal-Card",
    "color-border-Card": "$color-border",
    "thickness-border-Card": "1px",
    "style-border-Card": "solid",
    "border-Card": "$thickness-border-Card $style-border-Card $color-border-Card",
    "radius-Cars": "$radius",
    "shadow-Card": "none",
    light: {
      "color-bg-Card": "white",
    },
    dark: {
      "color-bg-Card": "$color-surface-900",
    },
  },
};

export const cardComponentRenderer = createComponentRenderer<CardComponentDef>(
  "Card",
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    return (
      <Card
        style={layoutCss}
        title={extractValue.asOptionalString(node.props.title)}
        linkTo={extractValue.asOptionalString(node.props.linkTo)}
        subTitle={extractValue.asOptionalString(node.props.subTitle)}
        avatarUrl={extractValue.asOptionalString(node.props.avatarUrl)}
        showAvatar={extractValue.asOptionalBoolean(node.props.showAvatar)}
      >
        {renderChild(node.children, {
          // Since the card is a flex container, it's children should behave the same as in a stack
          // (e.g. starsizing works in this case)
          type: "Stack",
          orientation: "vertical",
        })}
      </Card>
    );
  },
  metadata
);
