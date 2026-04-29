import type { ForwardedRef, ReactNode } from "react";
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import classnames from "classnames";

import styles from "./Stepper.module.scss";
import Icon from "../Icon/IconReact";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { useEvent } from "../../components-core/utils/misc";
import { noop } from "../../components-core/constants";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import {
  StepperContext,
  useStepperContextValue,
  type StepItem,
  type StepperOrientation,
} from "./StepperContext";

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & {
  id?: string;
  activeStep?: number;
  orientation?: StepperOrientation;
  stackedLabel?: boolean;
  nonLinear?: boolean;
  classes?: Record<string, string>;
  registerComponentApi?: RegisterComponentApiFn;
  updateState?: UpdateStateFn;
  onDidChange?: (newIndex: number, id: string) => void;
  children?: ReactNode;
};

export const defaultProps = {
  activeStep: 0,
  orientation: "horizontal" as StepperOrientation,
  stackedLabel: false,
  nonLinear: false,
};

export const Stepper = memo(
  forwardRef(function Stepper(
    {
      activeStep = defaultProps.activeStep,
      orientation = defaultProps.orientation,
      stackedLabel = defaultProps.stackedLabel,
      nonLinear = defaultProps.nonLinear,
      id,
      className,
      classes,
      style,
      children,
      registerComponentApi,
      updateState,
      onDidChange = noop,
      ...rest
    }: Props,
    forwardedRef: ForwardedRef<HTMLDivElement>,
  ) {
    const _id = useId();
    const stepperId = id || _id;

    const [activeIndex, setActiveIndex] = useState<number>(
      Number.isFinite(activeStep) && activeStep >= 0 ? activeStep : 0,
    );

    useEffect(() => {
      if (activeStep === undefined || activeStep === null) return;
      const next = Number.isFinite(activeStep) && activeStep >= 0 ? activeStep : 0;
      setActiveIndex(next);
    }, [activeStep]);

    useEffect(() => {
      updateState?.({ activeStep: activeIndex });
    }, [activeIndex, updateState]);

    const stepItemsRef = useRef<StepItem[]>([]);

    const handleStepClick = useEvent((innerId: string) => {
      const items = stepItemsRef.current;
      const idx = items.findIndex((s) => s.innerId === innerId);
      if (idx < 0) return;
      setActiveIndex((prev) => {
        if (idx !== prev) {
          const item = items[idx];
          onDidChange?.(idx, item?.id ?? item?.innerId ?? "");
        }
        return idx;
      });
    });

    const { stepItems, contextValue } = useStepperContextValue(
      orientation,
      stackedLabel,
      nonLinear,
      "",
      activeIndex,
      handleStepClick,
    );
    stepItemsRef.current = stepItems;

    const activeStepId = useMemo(() => {
      if (activeIndex < 0 || activeIndex >= stepItems.length) return "";
      return stepItems[activeIndex]?.innerId ?? "";
    }, [stepItems, activeIndex]);

    const contextWithActiveId = useMemo(
      () => ({ ...contextValue, activeStepId }),
      [contextValue, activeStepId],
    );

    // Imperative APIs
    const next = useEvent(() => {
      setActiveIndex((p) => {
        const total = stepItemsRef.current.length;
        if (total === 0) return 0;
        const newIdx = Math.min(p + 1, total - 1);
        if (newIdx !== p) {
          const item = stepItemsRef.current[newIdx];
          onDidChange?.(newIdx, item?.id ?? item?.innerId ?? "");
        }
        return newIdx;
      });
    });

    const prev = useEvent(() => {
      setActiveIndex((p) => {
        const newIdx = Math.max(p - 1, 0);
        if (newIdx !== p) {
          const item = stepItemsRef.current[newIdx];
          onDidChange?.(newIdx, item?.id ?? item?.innerId ?? "");
        }
        return newIdx;
      });
    });

    const reset = useEvent(() => {
      setActiveIndex((p) => {
        if (p !== 0) {
          const item = stepItemsRef.current[0];
          onDidChange?.(0, item?.id ?? item?.innerId ?? "");
        }
        return 0;
      });
    });

    const setActiveStep = useEvent((index: number) => {
      if (typeof index !== "number" || !Number.isFinite(index)) return;
      const total = stepItemsRef.current.length;
      if (index < 0 || index >= total) return;
      setActiveIndex((p) => {
        if (p !== index) {
          const item = stepItemsRef.current[index];
          onDidChange?.(index, item?.id ?? item?.innerId ?? "");
        }
        return index;
      });
    });

    useEffect(() => {
      registerComponentApi?.({
        next,
        prev,
        reset,
        setActiveStep,
      });
    }, [registerComponentApi, next, prev, reset, setActiveStep]);

    // --- Rendering helpers (horizontal mode)
    const renderIcon = useCallback(
      (
        item: { completed?: boolean; error?: boolean; icon?: string },
        index: number,
        isActive: boolean,
      ) => {
        const completed = !!item.completed;
        const error = !!item.error;
        let content: React.ReactNode;
        if (error) {
          content = <Icon name="error" size="sm" />;
        } else if (completed) {
          content = <Icon name="checkmark" size="sm" />;
        } else if (item.icon) {
          content = <Icon name={item.icon} size="sm" />;
        } else {
          content = index + 1;
        }
        return (
          <span
            className={classnames(styles.iconCircle, {
              [styles.active]: isActive && !completed && !error,
              [styles.completed]: completed && !error,
              [styles.error]: error,
            })}
            aria-hidden="true"
          >
            {content}
          </span>
        );
      },
      [],
    );

    const renderLabelBlock = useCallback(
      (item: StepItem, isActive: boolean) => {
        const hasLabel = !!item.label;
        const hasDescription = !!item.description;
        const showOptional = !!item.optional;
        if (!hasLabel && !hasDescription && !showOptional) return null;
        return (
          <span className={styles.labelBlock}>
            {hasLabel && (
              <span
                className={classnames(styles.label, {
                  [styles.active]: isActive,
                  [styles.completed]: !!item.completed && !item.error,
                  [styles.error]: !!item.error,
                })}
              >
                {item.label}
              </span>
            )}
            {hasDescription && <span className={styles.description}>{item.description}</span>}
            {showOptional && !hasDescription && (
              <span className={styles.description}>{item.optionalLabel || "Optional"}</span>
            )}
          </span>
        );
      },
      [],
    );

    const rootClassName = classnames(
      styles.stepper,
      orientation === "horizontal" ? styles.horizontal : styles.vertical,
      { [styles.stackedLabel]: stackedLabel },
      classes?.[COMPONENT_PART_KEY],
      className,
    );

    // --- Horizontal rendering
    if (orientation === "horizontal") {
      return (
        <StepperContext.Provider value={contextWithActiveId}>
          <div
            {...rest}
            id={stepperId}
            ref={forwardedRef}
            className={rootClassName}
            style={style}
            role="group"
            aria-label="Stepper"
          >
            <div className={styles.header} role="list">
              {stepItems.map((item, index) => {
                const isActive = index === activeIndex;
                const isLast = index === stepItems.length - 1;
                const clickable = nonLinear;
                return (
                  <React.Fragment key={item.innerId}>
                    <div className={styles.headerItem} role="listitem">
                      {clickable ? (
                        <button
                          type="button"
                          className={classnames(styles.headerItemInner, styles.clickable)}
                          aria-current={isActive ? "step" : undefined}
                          onClick={() => handleStepClick(item.innerId)}
                        >
                          {renderIcon(item, index, isActive)}
                          {renderLabelBlock(item, isActive)}
                        </button>
                      ) : (
                        <div
                          className={styles.headerItemInner}
                          aria-current={isActive ? "step" : undefined}
                        >
                          {renderIcon(item, index, isActive)}
                          {renderLabelBlock(item, isActive)}
                        </div>
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={classnames(styles.connector, {
                          [styles.completed]: !!item.completed,
                        })}
                        aria-hidden="true"
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            {/* Only the active Step's content is rendered (Step decides internally). */}
            <div className={styles.content}>{children}</div>
          </div>
        </StepperContext.Provider>
      );
    }

    // --- Vertical rendering: Step children render their own header+content+connector
    return (
      <StepperContext.Provider value={contextWithActiveId}>
        <div
          {...rest}
          id={stepperId}
          ref={forwardedRef}
          className={rootClassName}
          style={style}
          role="group"
          aria-label="Stepper"
        >
          {children}
        </div>
      </StepperContext.Provider>
    );
  }),
);
