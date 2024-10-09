import styles from "./Card.module.scss";
import classnames from "@components-core/utils/classnames";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { Avatar } from "@components/Avatar/AvatarNative";
import { LocalLink } from "@components/Link/LinkNative";
import type { HeadingProps } from "@components/Heading/HeadingNative";
import { Heading } from "@components/Heading/HeadingNative";
import { Stack } from "@components/Stack/StackNative";
import { Text } from "@components/Text/TextNative";

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

export const Card = forwardRef(function Card(
  {
    children,
    style,
    title,
    subTitle,
    linkTo,
    avatarUrl,
    showAvatar = !!avatarUrl || false,
    onClick,
  }: Props,
  ref,
) {
  const titleProps: Partial<HeadingProps> = {
    level: "h2",
    layout: { marginTop: 0, marginBottom: "4px" },
  };
  return (
    <div
      ref={ref as any}
      className={classnames(styles.wrapper, {
        [styles.isClickable]: !!onClick,
      })}
      style={style}
      onClick={onClick}
    >
      {[title, subTitle, avatarUrl, showAvatar].some(Boolean) && (
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
            {subTitle && <Text variant="small">{subTitle}</Text>}
          </Stack>
        </Stack>
      )}
      {children}
    </div>
  );
});
