import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  type HTMLAttributeReferrerPolicy,
  type ReactNode,
  useMemo,
} from "react";
import type { To } from "react-router";
import { Link } from "@remix-run/react";
import classnames from "classnames";

import styles from "./Link.module.scss";

import type { LinkTarget } from "../abstractions";
import { createUrlWithQueryParams } from "../component-utils";
import { Icon } from "../Icon/IconNative";

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
} & Partial<
  Pick<
    HTMLAnchorElement,
    "hreflang" | "rel" | "download" | "target" | "referrerPolicy" | "ping" | "type"
  >
>;

export const LocalLink = forwardRef(function LocalLink(
  props: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const { to, children, icon, active, onClick, target, disabled, style, ...anchorProps } =
    specifyTypes(props);

  const iconLink = !!icon && !children;
  const smartTo = useMemo(() => {
    return createUrlWithQueryParams(to);
  }, [to]) as To;

  const Node = !to ? "div" : Link;

  return (
    <Node
      ref={forwardedRef as any}
      to={smartTo as To} //TODO illesg
      style={style}
      target={target}
      onClick={onClick}
      className={classnames(styles.container, {
        [styles.iconLink]: iconLink,
        [styles.active]: active,
        [styles.disabled]: disabled,
      })}
      {...anchorProps}
    >
      {icon && (
        <div className={styles.iconWrapper}>
          <Icon name={icon} />
        </div>
      )}
      {children}
    </Node>
  );
});

/**
 * Converts generic types to more specific ones.
 */
function specifyTypes(props: Props) {
  const { target, referrerPolicy } = props;
  return {
    ...props,
    target: target as LinkTarget,
    referrerPolicy: referrerPolicy as HTMLAttributeReferrerPolicy,
  };
}
