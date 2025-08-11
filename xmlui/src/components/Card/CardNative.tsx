import { type CSSProperties, type ForwardedRef, type ReactNode, forwardRef } from "react";
import classnames from "classnames";

import styles from "./Card.module.scss";

import { Avatar } from "../Avatar/AvatarNative";
import { LinkNative } from "../Link/LinkNative";
import type { HeadingProps } from "../Heading/HeadingNative";
import { Heading } from "../Heading/HeadingNative";
import { Stack } from "../Stack/StackNative";
import { Text } from "../Text/TextNative";

type Props = {
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  linkTo?: string;
  avatarUrl?: string;
  showAvatar?: boolean;
  avatarSize?: string;
  orientation?: string;
  onClick?: any;
};

export const defaultProps: Pick<Props, "orientation" | "showAvatar"> = {
  orientation: "vertical",
  showAvatar: false,
};

export const Card = forwardRef(function Card(
  {
    children,
    orientation = defaultProps.orientation,
    style,
    className,
    title,
    subtitle,
    linkTo,
    avatarUrl,
    showAvatar = !!avatarUrl || defaultProps.showAvatar,
    avatarSize,
    onClick,
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const titleProps: Partial<HeadingProps> = {
    level: "h2",
    maxLines: 1
  };
  return (
    <div
      ref={forwardedRef}
      className={classnames(
        styles.wrapper,
        {
          [styles.isClickable]: !!onClick,
          [styles.vertical]: orientation === "vertical",
          [styles.horizontal]: orientation === "horizontal",
        },
        className,
      )}
      style={style}
      onClick={onClick}
    >
      {[title, subtitle, avatarUrl, showAvatar].some(Boolean) && (
        <div className={styles.avatarWrapper}>
          {showAvatar && <Avatar url={avatarUrl} name={title} size={avatarSize} />}
          <div className={styles.titleWrapper}>
            {linkTo ? (
              title ? (
                <LinkNative to={linkTo + ""}>
                  <Heading {...titleProps} >{title}</Heading>
                </LinkNative>
              ) : null
            ) : title ? (
              <Heading {...titleProps}>{title}</Heading>
            ) : null}
            {subtitle !== undefined && (
              <>
                <Text variant="secondary">{subtitle}</Text>
              </>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
});
