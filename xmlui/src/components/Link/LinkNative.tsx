import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  type HTMLAttributeReferrerPolicy,
  type ReactNode,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import classnames from "classnames";

import styles from "./Link.module.scss";
import { capitalizeFirstLetter } from "../../components-core/utils/misc";

import type { LinkTarget } from "../abstractions";
import { createUrlWithQueryParams } from "../component-utils";
import { ThemedIcon } from "../Icon/Icon";
import type { To } from "react-router-dom";
import { Part } from "../Part/Part";
import { PART_ICON } from "../../components-core/parts";

// =====================================================================================================================
// React Link component implementation

type Props = {
  to: string | { pathname: string; queryParams?: Record<string, any> };
  children: ReactNode;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  horizontalAlignment?: string;
  verticalAlignment?: string;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
  noIndicator?: boolean;
} & Partial<
  Pick<
    HTMLAnchorElement,
    "hreflang" | "rel" | "download" | "target" | "referrerPolicy" | "ping" | "type"
  >
>;

export const defaultProps: Pick<Props, "active" | "disabled" | "noIndicator"> = {
  active: false,
  disabled: false,
  noIndicator: false,
};

export const LinkNative = forwardRef(function LinkNative(
  props: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const {
    to,
    children,
    icon,
    active = defaultProps.active,
    onClick,
    target,
    disabled = defaultProps.disabled,
    horizontalAlignment,
    verticalAlignment,
    style,
    className,
    noIndicator = defaultProps.noIndicator,
    ...anchorProps
  } = specifyTypes(props);

  const iconLink = !!icon && !children;
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

  const Node = to ? Link : "div";
  return (
    <Node
      {...anchorProps}
      ref={forwardedRef as any}
      // This line is needed to make download work with Link
      // Ref: https://v2.remix.run/docs/components/link#reloaddocument
      reloadDocument={anchorProps.download !== undefined}
      to={smartTo}
      style={style}
      target={target}
      onClick={onClick}
      className={classnames(
        className,
        styles.container,
        {
          [styles.noIndicator]: noIndicator,
          [styles.iconLink]: iconLink,
          [styles.active]: active,
          [styles.disabled]: disabled,
        },
        alignmentClasses.horizontal,
        alignmentClasses.vertical,
      )}
    >
      {icon && (
        <Part partId={PART_ICON}>
          <div className={styles.iconWrapper}>
            <ThemedIcon name={icon} />
          </div>
        </Part>
      )}
      {children}
    </Node>
  );
});

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
