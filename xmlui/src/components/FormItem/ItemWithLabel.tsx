import type { CSSProperties, ReactNode } from "react";
import { Children, useId } from "react";
import classnames from "@components-core/utils/classnames";
import styles from "./FormItem.module.scss";
import { Spinner } from "@components/Spinner/SpinnerNative";
import { Slot } from "@radix-ui/react-slot";

export type LabelPosition = "top" | "right" | "left" | "bottom";

type ItemWithLabelProps = {
  id?: string;
  labelPosition?: LabelPosition;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  label?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  enabled?: boolean;
  required?: boolean;
  children: ReactNode;
  validationInProgress?: boolean;
  shrinkToLabel?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  validationResult?: ReactNode;
};

const numberRegex = /^[0-9]+$/;

export function ItemWithLabel({
  id,
  labelPosition = "top",
  style,
  label,
  labelBreak = true,
  labelWidth,
  enabled = true,
  required = false,
  children,
  validationInProgress = false,
  shrinkToLabel = false,
  onFocus,
  onBlur,
  labelStyle,
  validationResult,
}: ItemWithLabelProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  if (label === undefined) {
    return (
      <Slot style={style} id={inputId} onFocus={onFocus} onBlur={onBlur}>
        {children}
      </Slot>
    );
    // return cloneElement(children as ReactElement, {
    //   ...mergeProps((children as ReactElement).props, {
    //     style,
    //     id: inputId,
    //     onFocus: onFocus,
    //     onBlur: onBlur
    //   }),
    // });
  }
  return (
    <div style={style}>
      <div
        className={classnames(styles.container, {
          [styles.top]: labelPosition === "top",
          [styles.bottom]: labelPosition === "bottom",
          [styles.left]: labelPosition === "left",
          [styles.right]: labelPosition === "right",
          [styles.shrinkToLabel]: shrinkToLabel,
        })}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {label && (
          <label
            htmlFor={inputId}
            style={{
              ...labelStyle,
              width: labelWidth && numberRegex.test(labelWidth) ? `${labelWidth}px` : labelWidth,
              flexShrink: (labelWidth !== undefined) ? 0 : undefined,
            }}
            className={classnames(styles.inputLabel, {
              [styles.required]: required,
              [styles.disabled]: !enabled,
              [styles.labelBreak]: labelBreak,
            })}
          >
            {label} {required && <span className={styles.requiredMark}>*</span>}
            {validationInProgress && (
              <Spinner
                style={{ height: "1em", width: "1em", marginLeft: "1em", alignSelf: "center" }}
              />
            )}
          </label>
        )}
        {Children.only(<Slot id={inputId}>{children}</Slot>)}
      </div>
      {validationResult}
    </div>
  );
}
