import type { CSSProperties } from "react";
import classnames from "classnames";

import { Icon } from "../Icon/IconNative";
import { Tooltip } from "../Tooltip/TooltipNative";
import type { ValidationStatus } from "../abstractions";

import styles from "./VerboseValidationFeedback.module.scss";

type Props = {
  icon?: string | null;
  message?: string;
  validationStatus?: ValidationStatus;
  style?: CSSProperties;
  className?: string;
};

export const VerboseValidationFeedback = ({
  icon,
  message,
  validationStatus,
}: Props) => {
  if (!icon) {
    return null;
  }

  const iconElement = (
    <Icon
      name={icon}
      className={classnames(styles.icon, {
        [styles.valid]: validationStatus === "valid",
        [styles.warning]: validationStatus === "warning",
        [styles.error]: validationStatus === "error",
      })}
    />

  );

  if (message) {
    return (
      <Tooltip text={message} delayDuration={100} tooltipTemplate={<div className={styles.wrapper}>asdasdasd</div>}>
        {iconElement}
      </Tooltip>
    );
  }

  return iconElement;
};
