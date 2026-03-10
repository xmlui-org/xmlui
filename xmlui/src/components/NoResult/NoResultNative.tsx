import type { CSSProperties, ForwardedRef} from "react";
import { forwardRef } from "react";
import classnames from "classnames";

import styles from "./NoResult.module.scss";

import { ThemedIcon } from "../Icon/Icon";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

// Default props for the NoResult component
export const defaultProps = {
  hideIcon: false,
  icon: "noresult",
};

type Props = {
  label: string;
  icon?: string;
  hideIcon?: boolean;
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
};

export const NoResult = forwardRef(function NoResult(
  {
    label,
    icon = defaultProps.icon,
    hideIcon = defaultProps.hideIcon,
    style,
    className,
    classes,
    ...rest
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      {...rest}
      className={classnames(styles.noResultWrapper, classes?.[COMPONENT_PART_KEY], className)}
      style={style}
      ref={forwardedRef}
    >
      {!hideIcon && <ThemedIcon name={icon} className={styles.icon} />}
      {label}
    </div>
  );
});
