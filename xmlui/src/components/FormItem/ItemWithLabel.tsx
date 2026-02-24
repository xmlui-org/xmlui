import type { CSSProperties, ForwardedRef, ReactElement, ReactNode } from "react";
import React, { cloneElement, forwardRef, useId, useState, useCallback } from "react";
import classnames from "classnames";
import { Slot } from "@radix-ui/react-slot";

import styles from "./FormItem.module.scss";

import type { LabelPosition, RequireLabelMode } from "../abstractions";
import { Spinner } from "../Spinner/SpinnerNative";
import { PART_LABELED_ITEM, PART_LABEL } from "../../components-core/parts";
import { Part } from "../Part/Part";
import type { LayoutContext } from "../../abstractions/RendererDefs";
import { RadioGroup } from "../RadioGroup/RadioGroupNative";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";

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
  direction?: "rtl" | "ltr";
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
  | "direction"
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
  direction: "ltr",
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

  useIsomorphicLayoutEffect(() => {
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

  // Check if the child is a RadioGroup component
  const isRadioGroup = React.isValidElement(children) && children.type === RadioGroup;

  if (label === undefined && !validationResult) {
    return (
      <Part partId={PART_LABELED_ITEM}>
        <Slot {...rest} style={style} className={className} id={inputId} ref={ref}>
          {children}
        </Slot>
      </Part>
    );
  }

  // For RadioGroup, use fieldset and legend instead of label
  if (isRadioGroup) {
    return (
      <fieldset
        {...rest}
        id={inputId}
        ref={ref as unknown as React.Ref<HTMLFieldSetElement>}
        style={style}
        className={classnames(className, styles.itemWithLabel)}
        disabled={!enabled}
      >
        <div
          className={classnames(styles.container, {
            [styles.top]: labelPosition === "top",
            [styles.bottom]: labelPosition === "bottom",
            [styles.start]: labelPosition === "start",
            [styles.end]: labelPosition === "end",
            [styles.shrinkToLabel]: shrinkToLabel,
          })}
          dir={rest?.direction}
        >
          {label && (
            <div
              className={styles.labelWrapper}
              style={{
                height: labelWrapperHeight,
              }}
            >
              <Part partId={PART_LABEL}>
                <legend
                  onClick={
                    onLabelClick ||
                    ((e) => {
                      // For radio groups, focus the first radio option
                      const fieldset = (e.currentTarget as HTMLElement).closest("fieldset");
                      if (fieldset) {
                        const firstRadio = fieldset.querySelector('[role="radio"]') as HTMLElement;
                        firstRadio?.focus();
                      }
                    })
                  }
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
                  {(requireLabelMode === "markRequired" || requireLabelMode === "markBoth") &&
                    required && <span className={styles.requiredMark}>*</span>}
                  {(requireLabelMode === "markOptional" || requireLabelMode === "markBoth") &&
                    !required && <span className={styles.optionalTag}> (Optional)</span>}
                  {validationInProgress && (
                    <Spinner
                      style={{
                        height: "1em",
                        width: "1em",
                        marginLeft: "1em",
                        alignSelf: "center",
                      }}
                    />
                  )}
                </legend>
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
      </fieldset>
    );
  }

  // For other components, use the existing label structure
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
                {(requireLabelMode === "markRequired" || requireLabelMode === "markBoth") &&
                  required && <span className={styles.requiredMark}>*</span>}
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
