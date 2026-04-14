import type { ForwardedRef, ReactNode } from "react";
import { forwardRef, memo, useEffect, useRef, useState } from "react";
import classnames from "classnames";

import styles from "./Stepper.module.scss";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useEvent } from "../../components-core/utils/misc";
import { StepperContext, useStepperContextValue } from "./StepperContext";
import { Spinner } from "../Spinner/SpinnerNative";
import Icon from "../Icon/IconNative";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

type Props = {
  id?: string;
  activeStep?: number;
  orientation?: "horizontal" | "vertical";
  allowNextStepsSelect?: boolean;
  linear?: boolean;
  completed?: boolean;
  iconPosition?: "left" | "right";
  updateState?: (state: Record<string, unknown>) => void;
  registerComponentApi?: RegisterComponentApiFn;
  onStepChange?: (index: number) => void;
  onComplete?: () => void;
  children?: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  classes?: Record<string, string>;
};

export const defaultProps = {
  activeStep: 0,
  orientation: "horizontal" as "horizontal" | "vertical",
  allowNextStepsSelect: true,
  linear: false,
  iconPosition: "left" as "left" | "right",
};

export const StepperNative = memo(
  forwardRef(function StepperNative(
    {
      id,
      activeStep: activeStepProp = defaultProps.activeStep,
      orientation = defaultProps.orientation,
      allowNextStepsSelect = defaultProps.allowNextStepsSelect,
      linear = defaultProps.linear,
      completed,
      iconPosition = defaultProps.iconPosition,
      updateState,
      registerComponentApi,
      onStepChange,
      onComplete,
      children,
      style,
      className,
      classes,
      ...rest
    }: Props,
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    const [internalActiveStep, setInternalActiveStep] = useState(activeStepProp);
    const highestVisitedRef = useRef(activeStepProp);

    // Sync internal step with prop changes
    useEffect(() => {
      setInternalActiveStep(activeStepProp);
      highestVisitedRef.current = Math.max(highestVisitedRef.current, activeStepProp);
    }, [activeStepProp]);

    const { stepItems, contextValue } = useStepperContextValue({
      activeStep: internalActiveStep,
      orientation,
      allowNextStepsSelect,
      linear,
    });

    const stepCount = stepItems.length;

    // Derived state
    const hasPrevStep = internalActiveStep > 0;
    const hasNextStep = internalActiveStep < stepCount - 1;
    const isCompleted = completed ?? internalActiveStep >= stepCount;
    const percent = stepCount > 0 ? Math.round((internalActiveStep / stepCount) * 100) : 0;

    // Track whether onComplete was already fired
    const completeFiredRef = useRef(false);

    const changeStep = useEvent((newStep: number) => {
      if (newStep < 0 || newStep > stepCount) return;
      setInternalActiveStep(newStep);
      highestVisitedRef.current = Math.max(highestVisitedRef.current, newStep);
      onStepChange?.(newStep);
    });

    const next = useEvent(() => {
      if (internalActiveStep >= stepCount) return;
      // In linear mode, skip only if current step allows it or we're just moving forward
      if (linear) {
        const currentItem = stepItems[internalActiveStep];
        if (currentItem && !currentItem.allowSkip && internalActiveStep < stepCount - 1) {
          // In linear mode without validation hooks, we still allow forward navigation.
          // Full validation blocking is reserved for future isStepValid integration.
        }
      }
      changeStep(internalActiveStep + 1);
    });

    const prev = useEvent(() => {
      if (internalActiveStep <= 0) return;
      changeStep(internalActiveStep - 1);
    });

    const goToStep = useEvent((index: number) => {
      if (index < 0 || index >= stepCount) return;

      // Check per-step allowStepSelect (when explicitly set)
      const targetItem = stepItems[index];
      if (targetItem?.allowStepSelect !== undefined) {
        if (!targetItem.allowStepSelect) return;
      } else {
        // Global check
        if (!allowNextStepsSelect && index > highestVisitedRef.current) return;
      }

      changeStep(index);
    });

    const reset = useEvent(() => {
      highestVisitedRef.current = 0;
      completeFiredRef.current = false;
      changeStep(0);
    });

    // Update XMLUI state
    useEffect(() => {
      updateState?.({
        activeStep: internalActiveStep,
        hasPrevStep,
        hasNextStep,
        isCompleted,
        stepCount,
        percent,
      });
    }, [updateState, internalActiveStep, hasPrevStep, hasNextStep, isCompleted, stepCount, percent]);

    // Fire onComplete
    useEffect(() => {
      if (isCompleted && !completeFiredRef.current) {
        completeFiredRef.current = true;
        onComplete?.();
      }
      if (!isCompleted) {
        completeFiredRef.current = false;
      }
    }, [isCompleted, onComplete]);

    // Register imperative API
    useEffect(() => {
      registerComponentApi?.({
        next,
        prev,
        goToStep,
        reset,
      });
    }, [registerComponentApi, next, prev, goToStep, reset]);

    // Determine step state for each indicator
    const getStepState = (index: number): "active" | "completed" | "incomplete" => {
      if (index === internalActiveStep) return "active";
      if (index < internalActiveStep) return "completed";
      return "incomplete";
    };

    const isStepClickable = (index: number): boolean => {
      const item = stepItems[index];
      // Per-step override takes precedence when explicitly set
      if (item?.allowStepSelect !== undefined) return item.allowStepSelect;
      // Global check
      if (!allowNextStepsSelect && index > highestVisitedRef.current) return false;
      return true;
    };

    return (
      <StepperContext.Provider value={contextValue}>
        <div
          {...rest}
          id={id}
          ref={ref}
          className={classnames(
            styles.root,
            { [styles.vertical]: orientation === "vertical" },
            classes?.[COMPONENT_PART_KEY],
            className,
          )}
          style={style}
          role="group"
          aria-label="Progress steps"
        >
          {/* Step indicator strip */}
          <div className={styles.steps}>
            {stepItems.map((item, index) => {
              const state = getStepState(index);
              const clickable = isStepClickable(index);

              return (
                <div key={item.innerId} style={{ display: "contents" }}>
                  {item.headerRenderer ? (
                    // Custom header template
                    <div
                      className={classnames(styles.stepWrapper, {
                        [styles.iconRight]: iconPosition === "right",
                      })}
                    >
                      {item.headerRenderer({
                        index,
                        label: item.label,
                        isActive: state === "active",
                        isCompleted: state === "completed",
                        isFirst: index === 0,
                        isLast: index === stepItems.length - 1,
                      })}
                    </div>
                  ) : (
                    <div
                      className={classnames(styles.stepWrapper, {
                        [styles.iconRight]: iconPosition === "right",
                      })}
                    >
                      {/* Indicator button */}
                      <button
                        type="button"
                        className={styles.indicator}
                        data-state={state}
                        disabled={!clickable}
                        aria-label={item.label || `Step ${index + 1}`}
                        aria-current={state === "active" ? "step" : undefined}
                        onClick={() => {
                          if (clickable) goToStep(index);
                        }}
                      >
                        {item.loading ? (
                          <Spinner delay={0} />
                        ) : state === "completed" ? (
                          <Icon name={item.completedIcon || "check"} size="1em" />
                        ) : item.icon ? (
                          <Icon name={item.icon} size="1em" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </button>

                      {/* Label + description body */}
                      {(item.label || item.description) && (
                        <div className={styles.stepBody}>
                          {item.label && (
                            <span className={styles.stepLabel} data-state={state}>
                              {item.label}
                            </span>
                          )}
                          {item.description && (
                            <span className={styles.stepDescription} data-state={state}>
                              {item.description}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Separator (not after last step) */}
                  {index < stepItems.length - 1 && (
                    <div
                      className={styles.separator}
                      data-state={index < internalActiveStep ? "completed" : "incomplete"}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Content panel */}
          <div className={styles.content}>{children}</div>
        </div>
      </StepperContext.Provider>
    );
  }),
);
