import { Link } from "@remix-run/react";
import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import styles from "./Link.module.scss";
import classnames from "@components-core/utils/classnames";
import { Icon } from "@components/Icon/IconNative";
import type { To } from "react-router";
import type { LinkTarget } from "@components/abstractions";
import { createUrlWithQueryParams } from "@components/component-utils";

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

export const LocalLink = ({ to, children, icon, active, onClick, target, disabled, style }: Props) => {
  const iconLink = !!icon && !children;
  const smartTo = useMemo(() => {
    return createUrlWithQueryParams(to);
  }, [to]) as To;

  const Node = !to ? "div" : Link;

  return (
    <Node
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
};
