import { useState, useEffect } from "react";
import classnames from "classnames";

import { Icon } from "../Icon/IconNative";
import { Tooltip } from "../Tooltip/TooltipNative";
import type { ValidationStatus } from "../abstractions";

import styles from "./VerboseValidationFeedback.module.scss";

type Props = {
  validationStatus?: ValidationStatus;
  successIcon?: string;
  errorIcon?: string;
  invalidMessages?: string[];
};

export const VerboseValidationFeedback = ({
  validationStatus,
  successIcon = "check",
  errorIcon = "error",
  invalidMessages = [],
}: Props) => {
  // Track if the field was ever invalid during this editing session
  const [wasEverInvalid, setWasEverInvalid] = useState(false);

  // Update wasEverInvalid when validationStatus changes to error
  useEffect(() => {
    if (validationStatus === "error") {
      setWasEverInvalid(true);
    }
  }, [validationStatus]);

  // Determine which icon to show and its status for styling
  let icon: string | null = null;
  let feedbackStatus: ValidationStatus = validationStatus ?? "none";

  if (validationStatus === "error") {
    // Always show error icon when there's an error
    icon = errorIcon;
  } else if (wasEverInvalid && validationStatus !== "warning") {
    // Show success icon if the field was previously invalid and now it's valid or none
    icon = successIcon;
    // Force "valid" status for styling when showing success icon
    feedbackStatus = "valid";
  }

  if (!icon) {
    return null;
  }

  const iconElement = (
    <Icon
      name={icon}
      className={classnames(styles.icon, {
        [styles.valid]: feedbackStatus === "valid",
        [styles.warning]: feedbackStatus === "warning",
        [styles.error]: feedbackStatus === "error",
      })}
    />
  );

  // Show tooltip with all error messages when there are errors
  if (invalidMessages.length > 0 && validationStatus === "error") {
    const tooltipContent = invalidMessages.join("\n");
    return (
      <Tooltip text={tooltipContent} delayDuration={100}>
        {iconElement}
      </Tooltip>
    );
  }

  return iconElement;
};
