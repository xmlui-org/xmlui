import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  type HTMLAttributeReferrerPolicy,
  type ReactNode,
  useMemo,
} from "react";
import { Link } from "@remix-run/react";
import classnames from "classnames";

import styles from "./Link.module.scss";

import type { LinkTarget } from "../abstractions";
import { createUrlWithQueryParams } from "../component-utils";
import { Icon } from "../Icon/IconNative";
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
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
} & Partial<
  Pick<
    HTMLAnchorElement,
    "hreflang" | "rel" | "download" | "target" | "referrerPolicy" | "ping" | "type"
  >
>;

export const defaultProps: Pick<Props, "active" | "disabled"> = {
  active: false,
  disabled: false,
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
    style,
    className,
    ...anchorProps
  } = specifyTypes(props);

  const iconLink = !!icon && !children;
  const smartTo = useMemo(() => {
    return createUrlWithQueryParams(to);
  }, [to]) as To;

  const Node = to ? Link : "div";
  return (
    <Node
      {...anchorProps}
      ref={forwardedRef as any}
      to={smartTo}
      style={style}
      target={target}
      onClick={onClick}
      className={classnames(className, styles.container, {
        [styles.iconLink]: iconLink,
        [styles.active]: active,
        [styles.disabled]: disabled,
      })}
    >
      {icon && (
        <Part partId={PART_ICON}>
          <div className={styles.iconWrapper}>
            <Icon name={icon} />
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
