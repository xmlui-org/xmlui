import {
  type CSSProperties,
  type ForwardedRef,
  type MouseEventHandler,
  type ReactNode,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import classnames from "classnames";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { PART_AVATAR, PART_SUBTITLE, PART_TITLE } from "../../components-core/parts";
import { Part } from "../Part/Part";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";

import styles from "./Card.module.scss";
import { capitalizeFirstLetter } from "../../components-core/utils/misc";

import { ThemedAvatar as Avatar } from "../Avatar/Avatar";
import { ThemedLinkNative as LinkNative } from "../Link/Link";
import type { HeadingProps } from "../Heading/HeadingNative";
import { ThemedHeading as Heading } from "../Heading/Heading";
import { ThemedText as Text } from "../Text/Text";

type Props = {
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
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
  onClick?: MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: MouseEventHandler<HTMLDivElement>;
  onContextMenu?: MouseEventHandler<HTMLDivElement>;
  registerComponentApi?: RegisterComponentApiFn;
};

const TITLE_HEADING_PROPS: Partial<HeadingProps> = {
  level: "h2",
  maxLines: 1,
};

export const defaultProps: Pick<Props, "orientation" | "showAvatar"> = {
  orientation: "vertical",
  showAvatar: false,
};

export const Card = memo(forwardRef(function Card(
  {
    children,
    orientation = defaultProps.orientation,
    horizontalAlignment,
    verticalAlignment,
    style,
    className,
    classes,
    title,
    subtitle,
    linkTo,
    avatarUrl,
    showAvatar = !!avatarUrl || defaultProps.showAvatar,
    avatarSize,
    onClick,
    onDoubleClick,
    onContextMenu,
    registerComponentApi,
    ...rest
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(forwardedRef, containerRef);

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

  const scrollToTop = useCallback((behavior: ScrollBehavior = "instant") => {
    containerRef.current?.scrollTo({ top: 0, behavior });
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "instant") => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior });
    }
  }, []);

  const scrollToStart = useCallback((behavior: ScrollBehavior = "instant") => {
    containerRef.current?.scrollTo({ left: 0, behavior });
  }, []);

  const scrollToEnd = useCallback((behavior: ScrollBehavior = "instant") => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: containerRef.current.scrollWidth, behavior });
    }
  }, []);

  useEffect(() => {
    registerComponentApi?.({ scrollToTop, scrollToBottom, scrollToStart, scrollToEnd });
  }, [registerComponentApi, scrollToTop, scrollToBottom, scrollToStart, scrollToEnd]);

  return (
    <div
      {...rest}
      ref={composedRef}
      className={classnames(
        styles.wrapper,
        {
          [styles.isClickable]: !!onClick || !!onDoubleClick,
          [styles.vertical]: orientation === "vertical",
          [styles.horizontal]: orientation === "horizontal",
        },
        alignmentClasses.horizontal,
        alignmentClasses.vertical,
        classes?.[COMPONENT_PART_KEY],
        className,
      )}
      style={style}
      onClick={(event) => {
        // Prevent onClick from firing on the second click of a double-click,
        // which ensures onDoubleClick fires cleanly without triggering onClick twice.
        if (event.detail >= 2) return;
        onClick?.(event);
      }}
      onDoubleClick={(event) => {
        // Prevent browser text selection on double-click
        event.preventDefault();
        onDoubleClick?.(event);
      }}
      onContextMenu={onContextMenu}
    >
      {[title, subtitle, avatarUrl, showAvatar].some(Boolean) && (
        <div className={styles.avatarWrapper}>
          {showAvatar && (
            <Part partId={PART_AVATAR}>
              <Avatar url={avatarUrl} name={title} size={avatarSize} />
            </Part>
          )}
          <div className={styles.titleWrapper}>
            {title && (
              <Part partId={PART_TITLE}>
                {linkTo ? (
                  <LinkNative to={linkTo + ""}>
                    <Heading {...TITLE_HEADING_PROPS}>{title}</Heading>
                  </LinkNative>
                ) : (
                  <Heading {...TITLE_HEADING_PROPS}>{title}</Heading>
                )}
              </Part>
            )}
            {subtitle !== undefined && (
              <Part partId={PART_SUBTITLE}>
                <Text variant="secondary">{subtitle}</Text>
              </Part>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}));
