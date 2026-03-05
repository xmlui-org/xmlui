import React, { useEffect } from "react";
import { Checkbox, MantineProvider } from "@mantine/core";
import styles from "./ImageCheckboxCard.module.scss";

type Props = {
  imageUrl?: string;
  imageAlt?: string;
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
  /** Layout override */
  imageHeight?: string;
  className?: string;
  registerComponentApi?: any;
};

export const defaultProps: Required<Pick<Props, "size">> = {
  size: "sm",
};

export const ImageCheckboxCardNative = ({
  imageUrl,
  imageAlt,
  label,
  description,
  value,
  initialValue,
  updateState,
  onChange,
  size = defaultProps.size,
  disabled,
  imageHeight,
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
    ...(imageHeight !== undefined && { "--ic-img-h": imageHeight } as any),
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
          {imageUrl && (
            <img src={imageUrl} alt={imageAlt ?? ""} className={styles.image} />
          )}
          <div className={styles.content}>
            <div className={styles.text}>
              {label && <span className={styles.label}>{label}</span>}
              {description && <span className={styles.description}>{description}</span>}
            </div>
            <Checkbox.Indicator
              size={size as any}
              disabled={disabled}
              classNames={{ indicator: styles.indicator }}
            />
          </div>
        </Checkbox.Card>
      </div>
    </MantineProvider>
  );
};
