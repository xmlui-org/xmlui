import { useEffect } from "react";
import { Checkbox, MantineProvider } from "@mantine/core";
import styles from "./CheckboxCard.module.scss";

type Props = {
  label?: string;
  description?: string;
  /** Current value from XMLUI state */
  value?: boolean;
  /** Initial checked state */
  initialValue?: boolean | string;
  /** XMLUI state updater */
  updateState?: (updater: Record<string, any>) => void;
  /** XMLUI didChange event handler */
  onChange?: (checked: boolean) => void;
  size?: string;
  disabled?: boolean;
  className?: string;
  registerComponentApi?: any;
};

export const defaultProps: Required<Pick<Props, "size">> = {
  size: "sm",
};

export const CheckboxCardNative = ({
  label,
  description,
  value,
  initialValue,
  updateState,
  onChange,
  size = defaultProps.size,
  disabled,
  className,
}: Props) => {
  useEffect(() => {
    if (value === undefined) {
      const initial = initialValue === true || initialValue === "true";
      updateState?.({ value: initial });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checked = value === true;

  const handleClick = disabled
    ? undefined
    : () => {
        updateState?.({ value: !checked });
        onChange?.(!checked);
      };

  return (
    <MantineProvider>
      <div
        className={`${styles.wrapper}${className ? ` ${className}` : ""}`}
      >
        <Checkbox.Card
          checked={checked}
          onClick={handleClick}
          withBorder
          classNames={{ card: styles.card }}
        >
          <div className={styles.content}>
            <Checkbox.Indicator
              size={size as any}
              disabled={disabled}
              classNames={{ indicator: styles.indicator }}
            />
            <div className={styles.text}>
              {label && <span className={styles.label}>{label}</span>}
              {description && <span className={styles.description}>{description}</span>}
            </div>
          </div>
        </Checkbox.Card>
      </div>
    </MantineProvider>
  );
};
