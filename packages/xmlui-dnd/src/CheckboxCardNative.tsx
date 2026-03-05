import React, { useEffect } from "react";
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
  /** Per-instance overrides — each supersedes the matching theme variable */
  checkboxColor?: string;
  checkboxIconColor?: string;
  indicatorBackgroundColor?: string;
  indicatorBorderColor?: string;
  backgroundColor?: string;
  backgroundColorChecked?: string;
  borderColor?: string;
  borderColorChecked?: string;
  borderRadius?: string;
  textColor?: string;
  descriptionColor?: string;
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
  checkboxColor,
  checkboxIconColor,
  indicatorBackgroundColor,
  indicatorBorderColor,
  backgroundColor,
  backgroundColorChecked,
  borderColor,
  borderColorChecked,
  borderRadius,
  textColor,
  descriptionColor,
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

  const wrapperVars: React.CSSProperties = {
    ...(checkboxColor !== undefined && { "--cc-checkbox": checkboxColor } as any),
    ...(checkboxIconColor !== undefined && { "--cc-icon": checkboxIconColor } as any),
    ...(indicatorBackgroundColor !== undefined && { "--cc-indicator-bg": indicatorBackgroundColor } as any),
    ...(indicatorBorderColor !== undefined && { "--cc-indicator-border": indicatorBorderColor } as any),
    ...(backgroundColor !== undefined && { "--cc-bg": backgroundColor } as any),
    ...(backgroundColorChecked !== undefined && { "--cc-bg-checked": backgroundColorChecked } as any),
    ...(borderColor !== undefined && { "--cc-border": borderColor } as any),
    ...(borderColorChecked !== undefined && { "--cc-border-checked": borderColorChecked } as any),
    ...(borderRadius !== undefined && { "--cc-radius": borderRadius } as any),
    ...(textColor !== undefined && { "--cc-text": textColor } as any),
    ...(descriptionColor !== undefined && { "--cc-desc": descriptionColor } as any),
  };

  return (
    <MantineProvider>
      <div
        className={`${styles.wrapper}${className ? ` ${className}` : ""}`}
        style={wrapperVars}
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
