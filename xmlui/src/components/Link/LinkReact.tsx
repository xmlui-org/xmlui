import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  memo,
  type HTMLAttributeReferrerPolicy,
  type ReactNode,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import classnames from "classnames";

import styles from "./Link.module.scss";
import { capitalizeFirstLetter } from "../../components-core/utils/misc";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

import type { BreakMode, LinkTarget, OverflowMode } from "../abstractions";
import { createUrlWithQueryParams } from "../component-utils";
import { ThemedIcon } from "../Icon/Icon";
import type { To } from "react-router-dom";
import { Part } from "../Part/Part";
import { PART_ICON } from "../../components-core/parts";
import { getMaxLinesStyle } from "../../components-core/utils/css-utils";

// =====================================================================================================================
// React Link component implementation

type Props = {
  to: string | { pathname: string; queryParams?: Record<string, any> };
  children?: ReactNode;
  label?: string;
  icon?: string;
  active?: boolean;
  enabled?: boolean;
  horizontalAlignment?: string;
  verticalAlignment?: string;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  noIndicator?: boolean;
  maxLines?: number;
  preserveLinebreaks?: boolean;
  ellipses?: boolean;
  overflowMode?: OverflowMode;
  breakMode?: BreakMode;
} & Partial<
  Pick<
    HTMLAnchorElement,
    "hreflang" | "rel" | "download" | "target" | "referrerPolicy" | "ping" | "type"
  >
>;

export const defaultProps: Pick<Props, "active" | "enabled" | "noIndicator" | "preserveLinebreaks" | "ellipses"> = {
  active: false,
  enabled: true,
  noIndicator: false,
  preserveLinebreaks: false,
  ellipses: true,
};

export const LinkNative = memo(forwardRef(function LinkNative(
  props: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const {
    to,
    children,
    label,
    icon,
    active = defaultProps.active,
    onClick,
    target,
    enabled = defaultProps.enabled,
    horizontalAlignment,
    verticalAlignment,
    style,
    className,
    classes,
    noIndicator = defaultProps.noIndicator,
    maxLines = 0,
    preserveLinebreaks = defaultProps.preserveLinebreaks,
    ellipses = defaultProps.ellipses,
    overflowMode,
    breakMode,
    ...anchorProps
  } = specifyTypes(props);

  const content = label ?? children;
  const iconLink = !!icon && !content;
  const smartTo = useMemo(() => {
    return createUrlWithQueryParams(to);
  }, [to]) as To;

  // Create our own alignment classes using Link's styles
  // Link has flex-direction: row, so:
  // - horizontalAlignment controls justify-content (main axis)
  // - verticalAlignment controls align-items (cross axis)
  const alignmentClasses = useMemo(() => {
    return {
      horizontal:
        horizontalAlignment && styles[`justifyItems${capitalizeFirstLetter(horizontalAlignment)}`],
      vertical:
        verticalAlignment && styles[`alignItems${capitalizeFirstLetter(verticalAlignment)}`],
    };
  }, [horizontalAlignment, verticalAlignment]);

  // Determine whether any overflow/break/linebreak feature is active so we
  // know to render a wrapper <span> and apply the shrink guard on the container.
  const hasOverflowFeature = useMemo(
    () => !!(overflowMode || maxLines > 0 || preserveLinebreaks || breakMode),
    [overflowMode, maxLines, preserveLinebreaks, breakMode],
  );

  // Classes for the inner <span> that wraps the text content.
  // text-overflow / word-break only work on block-level boxes, NOT on flex containers,
  // so we must delegate them to a child element rather than the inline-flex container.
  const textSpanClasses = useMemo(() => {
    const classes: Record<string, boolean> = {};

    // --- overflow mode ---
    if (!overflowMode) {
      classes[styles.truncateOverflow] = maxLines > 0;
      classes[styles.noEllipsis] = !ellipses;
      classes[styles.multiLineClamp] = maxLines > 1;
    } else {
      switch (overflowMode) {
        case "none":
          classes[styles.overflowNone] = true;
          break;
        case "scroll":
          classes[styles.overflowScroll] = true;
          break;
        case "ellipsis":
          classes[styles.truncateOverflow] = true;
          classes[styles.noEllipsis] = !ellipses;
          classes[styles.multiLineClamp] = maxLines > 1;
          break;
        case "flow":
          classes[styles.overflowFlow] = true;
          break;
      }
    }

    // --- break mode ---
    if (breakMode) {
      switch (breakMode) {
        case "normal":
          classes[styles.breakNormal] = true;
          break;
        case "word":
          classes[styles.breakWord] = true;
          break;
        case "anywhere":
          classes[styles.breakAnywhere] = true;
          break;
        case "keep":
          classes[styles.breakKeep] = true;
          break;
        case "hyphenate":
          classes[styles.breakHyphenate] = true;
          break;
      }
    }

    // --- preserve linebreaks ---
    classes[styles.preserveLinebreaks] = preserveLinebreaks;

    return classes;
  }, [overflowMode, maxLines, ellipses, breakMode, preserveLinebreaks]);

  // Inline style for the text span (maxLines uses CSS that requires display:-webkit-box)
  const textSpanStyle = useMemo(
    () =>
      overflowMode === "ellipsis" || (!overflowMode && maxLines)
        ? getMaxLinesStyle(maxLines)
        : undefined,
    [overflowMode, maxLines],
  );

  // Use <span> (not <div>) when there is no destination so this element remains
  // valid phrasing content and can safely be nested inside <p> or <a> tags.
  const Node = to ? Link : "span";
  return (
    <Node
      {...anchorProps}
      ref={forwardedRef as any}
      // reloadDocument is a react-router-dom <Link>-only prop; omit it for plain divs.
      // Ref: https://v2.remix.run/docs/components/link#reloaddocument
      {...(to ? { reloadDocument: anchorProps.download !== undefined } : {})}
      to={smartTo}
      target={target}
      onClick={onClick}
      className={classnames(
        styles.container,
        classes?.[COMPONENT_PART_KEY],
        className,
        {
          [styles.noIndicator]: noIndicator,
          [styles.iconLink]: iconLink,
          [styles.active]: active,
          [styles.disabled]: !enabled,
          // When any overflow/text feature is active the container must be
          // allowed to shrink (min-width:0) and must clip its flex children.
          [styles.textOverflowContainer]: hasOverflowFeature,
        },
        alignmentClasses.horizontal,
        alignmentClasses.vertical,
      )}
      style={style}
    >
      {icon && (
        <Part partId={PART_ICON}>
          <div className={styles.iconWrapper}>
            <ThemedIcon name={icon} />
          </div>
        </Part>
      )}
      {hasOverflowFeature ? (
        <span className={classnames(styles.textSpan, textSpanClasses)} style={textSpanStyle}>
          {content}
        </span>
      ) : (
        content
      )}
    </Node>
  );
}));

/**
 * Converts generic types to more specific ones.
 */
function specifyTypes(props: Props) {
  const { target, referrerPolicy, ...rest } = props;
  return {
    ...rest,
    target: target as LinkTarget,
    referrerPolicy: referrerPolicy as HTMLAttributeReferrerPolicy,
  };
}
