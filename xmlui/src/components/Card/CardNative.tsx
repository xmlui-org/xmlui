import styles from "./Card.module.scss";
import classnames from "@components-core/utils/classnames";
import { CSSProperties, ForwardedRef, ReactNode } from "react";
import { forwardRef } from "react";
import { Avatar } from "@components/Avatar/AvatarNative";
import { LocalLink } from "@components/Link/LinkNative";
import type { HeadingProps } from "@components/Heading/HeadingNative";
import { Heading } from "@components/Heading/HeadingNative";
import { Stack } from "@components/Stack/StackNative";
import { Text } from "@components/Text/TextNative";

export const DEFAULT_ORIENTATION = "vertical";

type Props = {
  style?: CSSProperties;
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  linkTo?: string;
  avatarUrl?: string;
  showAvatar?: boolean;
  orientation?: string;
  onClick?: any;
};

export const Card = forwardRef(function Card(
  {
    children,
    orientation = DEFAULT_ORIENTATION,
    style,
    title,
    subtitle,
    linkTo,
    avatarUrl,
    showAvatar = !!avatarUrl || false,
    onClick,
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const titleProps: Partial<HeadingProps> = {
    level: "h2",
  };
  return (
    <div
      ref={forwardedRef}
      className={classnames(styles.wrapper, {
        [styles.isClickable]: !!onClick,
        [styles.vertical]: orientation === "vertical",
        [styles.horizontal]: orientation === "horizontal",
      })}
      style={style}
      onClick={onClick}
    >
      {[title, subtitle, avatarUrl, showAvatar].some(Boolean) && (
        <Stack orientation="horizontal" verticalAlignment="center" layout={{ gap: "1rem" }}>
          {showAvatar && <Avatar url={avatarUrl} name={title} />}
          <Stack orientation="vertical">
            {linkTo ? (
              title ? (
                <LocalLink to={linkTo + ""}>
                  <Heading {...titleProps}>{title}</Heading>
                </LocalLink>
              ) : null
            ) : title ? (
              <Heading {...titleProps}>{title}</Heading>
            ) : null}
            {subtitle !== undefined && <Text variant="small">{subtitle}</Text>}
          </Stack>
        </Stack>
      )}
      {children}
    </div>
  );
});
