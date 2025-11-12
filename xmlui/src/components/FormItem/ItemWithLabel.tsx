import type { CSSProperties, ForwardedRef, ReactElement, ReactNode } from "react";
import { cloneElement, forwardRef, useId } from "react";
import classnames from "classnames";
import { Slot } from "@radix-ui/react-slot";

import styles from "./FormItem.module.scss";

import type { LabelPosition } from "../abstractions";
import { Spinner } from "../Spinner/SpinnerNative";
import { PART_LABELED_ITEM, PART_LABEL } from "../../components-core/parts";
import { Part } from "../Part/Part";

// Component part names

type ItemWithLabelProps = {
  id?: string;
  labelPosition?: LabelPosition;
  style?: CSSProperties;
  className?: string;
  labelStyle?: CSSProperties;
  label?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  enabled?: boolean;
  required?: boolean;
  children: ReactNode;
  validationInProgress?: boolean;
  shrinkToLabel?: boolean;
  onFocus?: (ev: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (ev: React.FocusEvent<HTMLInputElement>) => void;
  isInputTemplateUsed?: boolean;
  onLabelClick?: () => void;
  validationResult?: ReactNode;
  layoutContext?: any;
  testId?: string;
};
export const defaultProps: Pick<ItemWithLabelProps, "labelBreak"> = {
  labelBreak: true,
};

const numberRegex = /^[0-9]+$/;

export const ItemWithLabel = forwardRef(function ItemWithLabel(
  {
    id,
    labelPosition = "top",
    style = {},
    className,
    label,
    labelBreak = defaultProps.labelBreak,
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
    onLabelClick,
    layoutContext,
    ...rest
  }: ItemWithLabelProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  if (label === undefined && !validationResult) {
    return (
      <Part partId={PART_LABELED_ITEM}>
        <Slot
          {...rest}
          style={style}
          className={className}
          id={inputId}
          ref={ref}
        >
          {children}
        </Slot>
      </Part>
    );
  }
  return (
    <div {...rest} ref={ref} style={style} className={classnames(className, styles.itemWithLabel)}>
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
          <Part partId={PART_LABEL}>
            <label
              htmlFor={inputId}
              onClick={onLabelClick || (() => document.getElementById(inputId)?.focus())}
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
          </Part>
        )}
        <Part partId={PART_LABELED_ITEM}>
          {cloneElement(children as ReactElement, {
            id: !isInputTemplateUsed ? inputId : undefined,
            style: undefined,
            className: undefined,
          })}
        </Part>
      </div>
      {validationResult}
    </div>
  );
});
