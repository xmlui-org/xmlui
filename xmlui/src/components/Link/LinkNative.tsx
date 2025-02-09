import { Link } from "@remix-run/react";
import { CSSProperties, ForwardedRef, forwardRef, ReactNode } from "react";
import { useMemo } from "react";
import styles from "./Link.module.scss";
import classnames from "classnames";
import { Icon } from "../Icon/IconNative";
import type { To } from "react-router";
import type { LinkTarget } from "../abstractions";
import { createUrlWithQueryParams } from "../component-utils";

// =====================================================================================================================
// React Link component implementation

type Props = {
  to: string | { pathname: string; queryParams?: Record<string, any> };
  children: ReactNode;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  target?: LinkTarget;
  style?: CSSProperties;
};

export const LocalLink = forwardRef(function LocalLink(
  { to, children, icon, active, onClick, target, disabled, style }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
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
