import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useRef } from "react";

import { defaultProps } from "./Card.defaults";
import styles from "./Card.module.scss";

export type CardProps = {
  className?: string;
  style?: CSSProperties;
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
  onClick?: (event: MouseEvent<HTMLDivElement>) => void | Promise<void>;
  onDoubleClick?: (event: MouseEvent<HTMLDivElement>) => void | Promise<void>;
  onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void | Promise<void>;
  registerComponentApi?: (api: Record<string, unknown>) => void;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    children,
    orientation = defaultProps.orientation,
    horizontalAlignment,
    verticalAlignment,
    className,
    title,
    subtitle,
    linkTo,
    avatarUrl,
    showAvatar = Boolean(avatarUrl) || defaultProps.showAvatar,
    avatarSize,
    onClick,
    onDoubleClick,
    onContextMenu,
    registerComponentApi,
    ...rest
  },
  ref,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const normalizedOrientation = orientation === "horizontal" ? "horizontal" : "vertical";

  const scrollToTop = useCallback((behavior: ScrollBehavior = "instant") => {
    innerRef.current?.scrollTo({ top: 0, behavior });
  }, []);
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "instant") => {
    innerRef.current?.scrollTo({ top: innerRef.current.scrollHeight, behavior });
  }, []);
  const scrollToStart = useCallback((behavior: ScrollBehavior = "instant") => {
    innerRef.current?.scrollTo({ left: 0, behavior });
  }, []);
  const scrollToEnd = useCallback((behavior: ScrollBehavior = "instant") => {
    innerRef.current?.scrollTo({ left: innerRef.current.scrollWidth, behavior });
  }, []);

  useEffect(() => {
    registerComponentApi?.({ scrollToTop, scrollToBottom, scrollToStart, scrollToEnd });
  }, [registerComponentApi, scrollToBottom, scrollToEnd, scrollToStart, scrollToTop]);

  const hasHeader = Boolean(title || subtitle || avatarUrl || showAvatar);

  return (
    <div
      {...rest}
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={cx(
        styles.wrapper,
        normalizedOrientation === "horizontal" ? styles.horizontal : styles.vertical,
        onClick || onDoubleClick ? styles.isClickable : undefined,
        alignmentClass("horizontal", normalizedOrientation, horizontalAlignment),
        alignmentClass("vertical", normalizedOrientation, verticalAlignment),
        className,
      )}
      onClick={(event) => {
        if (event.detail >= 2) {
          return;
        }
        void onClick?.(event);
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        void onDoubleClick?.(event);
      }}
      onContextMenu={(event) => void onContextMenu?.(event)}
    >
      {hasHeader ? (
        <div className={styles.avatarWrapper}>
          {showAvatar ? renderAvatar(avatarUrl, title, avatarSize) : null}
          <div className={styles.titleWrapper}>
            {title ? renderTitle(title, linkTo) : null}
            {subtitle !== undefined ? <div data-xmlui-part="subtitle" className={styles.subtitle}>{subtitle}</div> : null}
          </div>
        </div>
      ) : null}
      <div className={cx(
        styles.content,
        normalizedOrientation === "horizontal" ? styles.contentHorizontal : styles.contentVertical,
      )}>
        {children}
      </div>
    </div>
  );
});

function renderAvatar(avatarUrl: string | undefined, title: string | undefined, avatarSize: string | undefined) {
  const className = cx(styles.avatar, avatarSizeClass(avatarSize));
  return avatarUrl
    ? <img data-xmlui-part="avatar" className={className} src={avatarUrl} alt="avatar" />
    : <div data-xmlui-part="avatar" role="img" aria-label={title || "avatar"} className={className}>{initials(title)}</div>;
}

function renderTitle(title: string, linkTo: string | undefined) {
  const heading = <h2 data-xmlui-part="title" className={styles.title}>{title}</h2>;
  return linkTo ? <a href={linkTo}>{heading}</a> : heading;
}

function avatarSizeClass(value: string | undefined): string | undefined {
  if (value === "xs") {
    return styles.avatarXs;
  }
  if (value === "md") {
    return styles.avatarMd;
  }
  if (value === "lg") {
    return styles.avatarLg;
  }
  return undefined;
}

function alignmentClass(axis: "horizontal" | "vertical", orientation: string, value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = alignmentValue(value);
  if (!normalized) {
    return undefined;
  }
  const isMainAxis =
    (axis === "horizontal" && orientation === "horizontal") ||
    (axis === "vertical" && orientation === "vertical");
  return styles[`${isMainAxis ? "justify" : "align"}Items${normalized}` as keyof typeof styles];
}

function alignmentValue(value: string): "Start" | "Center" | "Stretch" | "End" | "Baseline" | undefined {
  switch (value) {
    case "start":
      return "Start";
    case "center":
      return "Center";
    case "stretch":
      return "Stretch";
    case "end":
      return "End";
    case "baseline":
      return "Baseline";
    default:
      return undefined;
  }
}

function initials(title: string | undefined): string {
  return title?.trim().slice(0, 1).toUpperCase() ?? "";
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
