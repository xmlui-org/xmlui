import { useState, type HTMLAttributes } from "react";
import classnames from "classnames";

import { createMetadata } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { ThemedIcon } from "../Icon/Icon";
import { ThemedTooltip as Tooltip } from "../Tooltip/Tooltip";
import type { ValidationMode } from "../Form/FormContext";
import type { ValidationStatus } from "../abstractions";
import styles from "./ConciseValidationFeedback.module.scss";

const COMP = "ConciseValidationFeedback";
const conciseValidationFeedbackStylesSource = `
$textColor-ConciseValidationFeedback-error: createThemeVar("textColor-ConciseValidationFeedback-error");
$textColor-ConciseValidationFeedback-valid: createThemeVar("textColor-ConciseValidationFeedback-valid");
`;

export const ConciseValidationFeedbackMd = createMetadata({
  status: "experimental",
  description: "`ConciseValidationFeedback` displays compact validation feedback for a single field.",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    validationStatus: {
      description: "The validation status to display.",
      valueType: "string",
      availableValues: ["error", "valid", "warning", "none"],
    },
    invalidMessages: {
      description: "Validation messages used for the error tooltip/accessible text.",
      valueType: "string[]",
    },
    successIcon: { description: "Icon name for valid feedback.", valueType: "icon", defaultValue: "checkmark" },
    errorIcon: { description: "Icon name for error feedback.", valueType: "icon", defaultValue: "error" },
  },
  themeVars: extractScssThemeVars(conciseValidationFeedbackStylesSource),
  defaultThemeVars: {
    [`textColor-${COMP}-error`]: "$color-error",
    [`textColor-${COMP}-valid`]: "$color-valid",
  },
});

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
  const [tooltipOpen, setTooltipOpen] = useState(false);

  if (validationStatus === "error") {
    const {
      onBlur,
      onFocus,
      onMouseEnter,
      onMouseLeave,
      ...spanProps
    } = rest;
    return (
      <Tooltip text={invalidMessages.join("\n")} delayDuration={100} open={tooltipOpen}>
        <span
          {...spanProps}
          className={classnames(className)}
          onBlur={(event) => {
            setTooltipOpen(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setTooltipOpen(true);
            onFocus?.(event);
          }}
          onMouseEnter={(event) => {
            setTooltipOpen(true);
            onMouseEnter?.(event);
          }}
          onMouseLeave={(event) => {
            setTooltipOpen(false);
            onMouseLeave?.(event);
          }}
        >
          <ThemedIcon name={errorIcon} className={classnames(styles.icon, styles.error)} />
        </span>
      </Tooltip>
    );
  }

  if (validationStatus === "valid") {
    return (
      <span {...rest} className={classnames(className)}>
        <ThemedIcon name={successIcon} className={classnames(styles.icon, styles.valid)} />
      </span>
    );
  }

  return null;
};
