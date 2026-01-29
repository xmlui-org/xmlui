import { type CSSProperties, type ForwardedRef, type ReactNode, forwardRef, useRef, useEffect, useMemo } from "react";
import classnames from "classnames";
import { composeRefs } from "@radix-ui/react-compose-refs";

import styles from "./Card.module.scss";
import { capitalizeFirstLetter } from "../../components-core/utils/misc";

import { Avatar } from "../Avatar/AvatarNative";
import { LinkNative } from "../Link/LinkNative";
import type { HeadingProps } from "../Heading/HeadingNative";
import { Heading } from "../Heading/HeadingNative";
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
  horizontalAlignment?: string;
  verticalAlignment?: string;
  onClick?: any;
  onContextMenu?: any;
  registerComponentApi?: (api: any) => void;
};

export const defaultProps: Pick<Props, "orientation" | "showAvatar"> = {
  orientation: "vertical",
  showAvatar: false,
};

export const Card = forwardRef(function Card(
  {
    children,
    orientation = defaultProps.orientation,
    horizontalAlignment,
    verticalAlignment,
    style,
    className,
    title,
    subtitle,
    linkTo,
    avatarUrl,
    showAvatar = !!avatarUrl || defaultProps.showAvatar,
    avatarSize,
    onClick,
    onContextMenu,
    registerComponentApi,
    ...rest
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleProps: Partial<HeadingProps> = {
    level: "h2",
    maxLines: 1,
  };

  // Create our own alignment classes using Card's styles
  const alignmentClasses = useMemo(() => {
    const horizontal = horizontalAlignment && styles[`alignItems${capitalizeFirstLetter(horizontalAlignment)}`];
    const vertical = verticalAlignment && styles[`justifyItems${capitalizeFirstLetter(verticalAlignment)}`];
    
    return orientation === "horizontal"
      ? {
          horizontal: horizontalAlignment && styles[`justifyItems${capitalizeFirstLetter(horizontalAlignment)}`],
          vertical: verticalAlignment && styles[`alignItems${capitalizeFirstLetter(verticalAlignment)}`],
        }
      : {
          horizontal,
          vertical,
        };
  }, [orientation, horizontalAlignment, verticalAlignment]);

  // Register API methods
  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi({
        scrollToTop: (behavior: ScrollBehavior = 'instant') => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: 0,
              behavior
            });
          }
        },
        scrollToBottom: (behavior: ScrollBehavior = 'instant') => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: containerRef.current.scrollHeight,
              behavior
            });
          }
        },
        scrollToStart: (behavior: ScrollBehavior = 'instant') => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              left: 0,
              behavior
            });
          }
        },
        scrollToEnd: (behavior: ScrollBehavior = 'instant') => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              left: containerRef.current.scrollWidth,
              behavior
            });
          }
        },
      });
    }
  }, [registerComponentApi]);

  return (
    <div
      {...rest}
      ref={composeRefs(containerRef, forwardedRef)}
      className={classnames(
        styles.wrapper,
        {
          [styles.isClickable]: !!onClick,
          [styles.vertical]: orientation === "vertical",
          [styles.horizontal]: orientation === "horizontal",
        },
        alignmentClasses.horizontal,
        alignmentClasses.vertical,
        className,
      )}
      style={style}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {[title, subtitle, avatarUrl, showAvatar].some(Boolean) && (
        <div className={styles.avatarWrapper}>
          {showAvatar && <Avatar url={avatarUrl} name={title} size={avatarSize} />}
          <div className={styles.titleWrapper}>
            {linkTo ? (
              title ? (
                <LinkNative to={linkTo + ""}>
                  <Heading {...titleProps}>{title}</Heading>
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
