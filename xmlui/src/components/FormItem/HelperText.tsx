import type { CSSProperties } from "react";
import classnames from "classnames";

import styles from "./HelperText.module.scss";

import type { ValidationStatus } from "../abstractions";
import { WarningIcon } from "../Icon/WarningIcon";
import { ErrorIcon } from "../Icon/ErrorIcon";

// =====================================================================================================================
// React HelperText component implementation

type Props = {
  text?: string;
  status?: ValidationStatus;
  style?: CSSProperties
};

export const HelperText = ({ text = "", status, style }: Props) => {
  const renderStatusIcon = () => {
    if (status === "warning") {
      return <WarningIcon color="var(--xmlui-color-warning)" />;
    } else if (status === "error") {
      return <ErrorIcon color="var(--xmlui-color-error)" />;
    }
  };

  return (
    <div
      data-validation-status={status}
      style={style}
      className={classnames(styles.helper, {
        [styles.valid]: status === "valid",
        [styles.warning]: status === "warning",
        [styles.error]: status === "error",
      })}
    >
      {status && <div style={{ flexShrink: 0 }}>{renderStatusIcon()}</div>}
      {text && <div className={styles.helperText}>{text}</div>}
    </div>
  );
};
