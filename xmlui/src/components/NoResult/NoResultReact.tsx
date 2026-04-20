import { type ForwardedRef, type HTMLAttributes, forwardRef, memo } from "react";
import classnames from "classnames";

import styles from "./NoResult.module.scss";

import { ThemedIcon } from "../Icon/Icon";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

// Default props for the NoResult component
export const defaultProps = {
  hideIcon: false,
  icon: "noresult",
};

type Props = HTMLAttributes<HTMLDivElement> & {
  label: string;
  icon?: string;
  hideIcon?: boolean;
  classes?: Record<string, string>;
};

export const NoResult = memo(forwardRef(function NoResult(
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
}));
