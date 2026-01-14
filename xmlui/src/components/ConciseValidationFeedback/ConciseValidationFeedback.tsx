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
};

export const ConciseValidationFeedback = ({
  invalidMessages,
  validationStatus,
  successIcon = "check",
  errorIcon = "error",
}: Props) => {

  if (validationStatus === "error") {
    return (
      <Tooltip text={invalidMessages.join("\n")} delayDuration={100}>
        <Icon name={errorIcon} className={classnames(styles.icon, styles.error)} />
      </Tooltip>
    );
  }

  if (validationStatus === "valid") {
    return (
      <Icon name={successIcon} className={classnames(styles.icon, styles.valid)} />
    );
  }

  return null;
};
