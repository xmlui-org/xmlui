import type { CSSProperties, HTMLAttributeReferrerPolicy, MouseEvent, ReactNode } from "react";
import { forwardRef, memo, useMemo } from "react";

import { defaultProps } from "./Link.defaults";
import styles from "./Link.module.scss";

export type LinkProps = {
  to?: unknown;
  children?: ReactNode;
  label?: unknown;
  icon?: unknown;
  active?: boolean;
  enabled?: boolean;
  horizontalAlignment?: string;
  verticalAlignment?: string;
  target?: string;
  rel?: string;
  download?: unknown;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
  ping?: string;
  hreflang?: string;
  type?: string;
  noIndicator?: boolean;
  maxLines?: number;
  preserveLinebreaks?: boolean;
  ellipses?: boolean;
  overflowMode?: string;
  breakMode?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => void | Promise<void>;
};

export const LinkNative = memo(forwardRef<HTMLElement, LinkProps>(function LinkNative(
  {
    to,
    children,
    label,
    icon,
    active = defaultProps.active,
    enabled = defaultProps.enabled,
    horizontalAlignment,
    verticalAlignment,
    target,
    rel,
    download,
    referrerPolicy,
    ping,
    hreflang,
    type,
    noIndicator = defaultProps.noIndicator,
    maxLines = 0,
    preserveLinebreaks = defaultProps.preserveLinebreaks,
    ellipses = defaultProps.ellipses,
    overflowMode,
    breakMode,
    className,
    style,
    onClick,
    ...rest
  },
  ref,
) {
  const href = linkHref(to);
  const content = label === undefined ? children : displayValue(label);
  const iconName = typeof icon === "string" && icon !== "" ? icon : undefined;
  const iconLink = !!iconName && content === undefined;
  const hasOverflowFeature = !!(overflowMode || maxLines > 0 || preserveLinebreaks || breakMode);
  const textSpanClassName = useMemo(
    () =>
      cx(
        styles.linkTextSpan,
        overflowClasses({ overflowMode, maxLines, ellipses }),
        preserveLinebreaks ? styles.linkPreserveLinebreaks : undefined,
        breakModeClass(breakMode),
      ),
    [breakMode, ellipses, maxLines, overflowMode, preserveLinebreaks],
  );
  const mergedStyle = useMemo(() => ({
    ...style,
    ...(maxLines > 0 && (overflowMode === "ellipsis" || !overflowMode)
      ? {
          display: undefined,
          "--xmlui-link-max-lines": maxLines,
        } as CSSProperties
      : undefined),
  }), [maxLines, overflowMode, style]);

  const commonProps = {
    ...rest,
    ref: ref as never,
    className: cx(
      styles.linkContainer,
      active ? styles.linkActive : undefined,
      !enabled ? styles.linkDisabled : undefined,
      noIndicator ? styles.linkNoIndicator : undefined,
      iconLink ? styles.linkIconOnly : undefined,
      hasOverflowFeature ? styles.linkTextOverflowContainer : undefined,
      alignmentClass("justifyItems", horizontalAlignment),
      alignmentClass("alignItems", verticalAlignment),
      className,
    ),
    style: mergedStyle,
    onClick: enabled ? onClick : undefined,
  };

  const body = (
    <>
      {iconName ? (
        <span data-part-id="icon" data-xmlui-part="icon" className={styles.linkIconWrapper}>
          <span aria-hidden="true" data-icon={iconName} className={styles.linkIconMarker} />
        </span>
      ) : null}
      {hasOverflowFeature ? (
        <span className={textSpanClassName}>
          {content}
        </span>
      ) : (
        content
      )}
    </>
  );

  if (!href) {
    return (
      <span {...commonProps}>
        {body}
      </span>
    );
  }

  return (
    <a
      {...commonProps}
      href={href}
      target={target}
      rel={rel}
      download={download === true ? "" : typeof download === "string" ? download : undefined}
      referrerPolicy={referrerPolicy}
      ping={ping}
      hrefLang={hreflang}
      type={type}
    >
      {body}
    </a>
  );
}));

function linkHref(to: unknown): string | undefined {
  if (typeof to === "string") {
    return to === "" ? undefined : to;
  }
  if (!to || typeof to !== "object") {
    return undefined;
  }
  const record = to as { pathname?: unknown; queryParams?: unknown };
  const pathname = typeof record.pathname === "string" ? record.pathname : "";
  const queryParams = record.queryParams && typeof record.queryParams === "object"
    ? new URLSearchParams(Object.entries(record.queryParams as Record<string, unknown>)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([name, value]) => [name, String(value)]))
    : undefined;
  const query = queryParams?.toString();
  return `${pathname}${query ? `?${query}` : ""}` || undefined;
}

function displayValue(value: unknown): string {
  return value === null ? "null" : String(value);
}

function overflowClasses({
  overflowMode,
  maxLines,
  ellipses,
}: {
  overflowMode?: string;
  maxLines: number;
  ellipses: boolean;
}): string | undefined {
  if (!overflowMode) {
    if (maxLines > 1) {
      return cx(
        styles.linkMultiLineClamp,
        !ellipses ? styles.linkNoEllipsis : undefined,
      );
    }
    return cx(
      maxLines > 0 ? styles.linkTruncateOverflow : undefined,
      !ellipses ? styles.linkNoEllipsis : undefined,
    );
  }
  if (overflowMode === "none") {
    return styles.linkOverflowNone;
  }
  if (overflowMode === "scroll") {
    return styles.linkOverflowScroll;
  }
  if (overflowMode === "flow") {
    return styles.linkOverflowFlow;
  }
  return cx(
    maxLines > 1 ? styles.linkMultiLineClamp : styles.linkTruncateOverflow,
    !ellipses ? styles.linkNoEllipsis : undefined,
  );
}

function breakModeClass(breakMode?: string): string | undefined {
  if (breakMode === "word") {
    return styles.linkBreakWord;
  }
  if (breakMode === "anywhere") {
    return styles.linkBreakAnywhere;
  }
  if (breakMode === "keep") {
    return styles.linkBreakKeep;
  }
  if (breakMode === "hyphenate") {
    return styles.linkBreakHyphenate;
  }
  if (breakMode === "normal") {
    return styles.linkBreakNormal;
  }
  return undefined;
}

function alignmentClass(prefix: "justifyItems" | "alignItems", value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = `link${prefix[0]?.toUpperCase() ?? ""}${prefix.slice(1)}${value[0]?.toUpperCase() ?? ""}${value.slice(1)}`;
  return Object.prototype.hasOwnProperty.call(styles, normalized)
    ? styles[normalized as keyof typeof styles]
    : undefined;
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
