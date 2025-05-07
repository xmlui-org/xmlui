import type { CSSProperties, ForwardedRef, ReactNode } from "react";
import { forwardRef, useId } from "react";
import classnames from "classnames";
import { Slot } from "@radix-ui/react-slot";

import styles from "./FormItem.module.scss";

import type { LabelPosition } from "../abstractions";
import { Spinner } from "../Spinner/SpinnerNative";

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
  isInputTemplateUsed?: boolean;
  validationResult?: ReactNode;
};

const numberRegex = /^[0-9]+$/;

export const ItemWithLabel = forwardRef(function ItemWithLabel(
  {
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
    isInputTemplateUsed = false,
  }: ItemWithLabelProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  if (label === undefined && !validationResult) {
    return (
      <Slot style={style} id={inputId} ref={ref}>
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
    <div style={style} ref={ref}>
      <div
        className={classnames(styles.container, {
          [styles.top]: labelPosition === "top",
          [styles.bottom]: labelPosition === "bottom",
          [styles.start]: labelPosition === "start",
          [styles.end]: labelPosition === "end",
          [styles.shrinkToLabel]: shrinkToLabel,
        })}
      >
        {label && (
          <label
            htmlFor={inputId}
            onClick={() => document.getElementById(inputId).focus()}
            style={{
              ...labelStyle,
              width: labelWidth && numberRegex.test(labelWidth) ? `${labelWidth}px` : labelWidth,
              flexShrink: labelWidth !== undefined ? 0 : undefined,
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
        <Slot id={!isInputTemplateUsed ? inputId : undefined}>{children}</Slot>
      </div>
      {validationResult}
    </div>
  );
});
