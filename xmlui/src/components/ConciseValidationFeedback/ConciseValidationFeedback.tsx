import type { HTMLAttributes } from "react";
import classnames from "classnames";

import { Icon } from "../Icon/IconNative";
import { Tooltip } from "../Tooltip/TooltipNative";
import type { ValidationMode } from "../Form/FormContext";
import type { ValidationStatus } from "../abstractions";

import styles from "./ConciseValidationFeedback.module.scss";

type Props = {
  validationStatus?: ValidationStatus;
  invalidMessages?: string[];
  successIcon?: string;
  errorIcon?: string;
  validationMode?: ValidationMode;
} & HTMLAttributes<HTMLSpanElement>;

export const ConciseValidationFeedback = ({
  invalidMessages = [],
  validationStatus,
  successIcon = "checkmark",
  errorIcon = "error",
  className,
  ...rest
}: Props) => {
  if (validationStatus === "error") {
    return (
      <span {...rest} className={classnames(className)}>
        <Tooltip text={invalidMessages.join("\n")} delayDuration={100}>
          <Icon name={errorIcon} className={classnames(styles.icon, styles.error)} />
        </Tooltip>
      </span>
    );
  }

  if (validationStatus === "valid") {
    return (
      <span {...rest} className={classnames(className)}>
        <Icon name={successIcon} className={classnames(styles.icon, styles.valid)} />
      </span>
    );
  }

  return null;
};
