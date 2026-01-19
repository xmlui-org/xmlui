import type { CSSProperties, ForwardedRef, ReactElement, ReactNode } from "react";
import { cloneElement, forwardRef, useId, useState, useLayoutEffect, useCallback } from "react";
import classnames from "classnames";
import { Slot } from "@radix-ui/react-slot";

import styles from "./FormItem.module.scss";

import type { LabelPosition, RequireLabelMode } from "../abstractions";
import { Spinner } from "../Spinner/SpinnerNative";
import { PART_LABELED_ITEM, PART_LABEL } from "../../components-core/parts";
import { Part } from "../Part/Part";
import type { LayoutContext } from "../../abstractions/RendererDefs";

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
  layoutContext?: LayoutContext;
  testId?: string;
  cloneStyle?: boolean;
  requireLabelMode?: RequireLabelMode;
};
export const defaultProps: Pick<
  ItemWithLabelProps,
  | "labelBreak"
  | "enabled"
  | "labelPosition"
  | "required"
  | "validationInProgress"
  | "shrinkToLabel"
  | "cloneStyle"
  | "requireLabelMode"
  | "isInputTemplateUsed"
> = {
  labelBreak: true,
  enabled: true,
  labelPosition: "top",
  required: false,
  validationInProgress: false,
  shrinkToLabel: false,
  cloneStyle: false,
  requireLabelMode: "markRequired",
  isInputTemplateUsed: false,
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
    enabled = defaultProps.enabled,
    required = defaultProps.required,
    children,
    validationInProgress = defaultProps.validationInProgress,
    shrinkToLabel = defaultProps.shrinkToLabel,
    onFocus,
    onBlur,
    labelStyle,
    validationResult,
    isInputTemplateUsed = defaultProps.isInputTemplateUsed,
    onLabelClick,
    layoutContext, // Destructured to prevent passing to DOM
    testId,
    cloneStyle = defaultProps.cloneStyle,
    requireLabelMode = defaultProps.requireLabelMode,
    ...rest
  }: ItemWithLabelProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [inputElement, setInputElement] = useState<HTMLElement | null>(null);
  const [inputHeight, setInputHeight] = useState<number | undefined>(undefined);

  const refCallback = useCallback((node: any) => {
    setInputElement(node);
  }, []);

  useLayoutEffect(() => {
    if (!inputElement) return;

    // Measure immediately
    setInputHeight(inputElement.offsetHeight);

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        setInputHeight(inputElement.offsetHeight);
      });
      observer.observe(inputElement);
      return () => observer.disconnect();
    }
  }, [inputElement]);

  const labelWrapperHeight =
    labelPosition === "start" || labelPosition === "end" ? inputHeight : "auto";

  if (label === undefined && !validationResult) {
    return (
      <Part partId={PART_LABELED_ITEM}>
        <Slot {...rest} style={style} className={className} id={inputId} ref={ref}>
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
          <div
            className={styles.labelWrapper}
            style={{
              height: labelWrapperHeight,
            }}
          >
            <Part partId={PART_LABEL}>
              <label
                htmlFor={inputId}
                onClick={onLabelClick || (() => document.getElementById(inputId)?.focus())}
                style={{
                  ...labelStyle,
                  width:
                    labelWidth && numberRegex.test(labelWidth) ? `${labelWidth}px` : labelWidth,
                  flexShrink: labelWidth !== undefined ? 0 : undefined,
                }}
                className={classnames(styles.inputLabel, {
                  [styles.required]: required,
                  [styles.disabled]: !enabled,
                  [styles.labelBreak]: labelBreak,
                })}
              >
                {label}
                {(requireLabelMode === "markRequired" || requireLabelMode === "markBoth") && required && (
                  <span className={styles.requiredMark}>*</span>
                )}
                {(requireLabelMode === "markOptional" || requireLabelMode === "markBoth") &&
                  !required && <span className={styles.optionalTag}> (Optional)</span>}
                {validationInProgress && (
                  <Spinner
                    style={{ height: "1em", width: "1em", marginLeft: "1em", alignSelf: "center" }}
                  />
                )}
              </label>
            </Part>
          </div>
        )}
        <div className={styles.wrapper}>
          <Part partId={PART_LABELED_ITEM}>
            {cloneElement(children as ReactElement, {
              id: !isInputTemplateUsed ? inputId : undefined,
              ref: refCallback,
              ...(cloneStyle ? {} : { style: undefined, className: undefined }),
            })}
          </Part>
          {validationResult && (
            <div className={styles.validationResultWrapper}>{validationResult}</div>
          )}
        </div>
      </div>
    </div>
  );
});
