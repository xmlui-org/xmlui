import { ValidationStatus } from "@components/Input/input-abstractions";
import classnames from "@components-core/utils/classnames";
import styles from "./HelperText.module.scss";
import {CSSProperties} from "react";
import { WarningIcon } from "@components/Icon/WarningIcon";
import { ErrorIcon } from "@components/Icon/ErrorIcon";

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
      return <WarningIcon color="var(--nsoftware-color-warning)" />;
    } else if (status === "error") {
      return <ErrorIcon color="var(--nsoftware-color-error)" />;
    }
  };

  return (
    <div
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
