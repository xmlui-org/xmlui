import type { ForwardedRef, HTMLAttributes, ReactNode } from "react";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { Icon } from "../Icon/IconReact";
import { defaultProps } from "./Stepper.defaults";
import styles from "./Stepper.module.scss";
import {
  StepperContext,
  useStepperContextValue,
  type StepItem,
  type StepperOrientation,
} from "./StepperContext";

type Props = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  id?: string;
  activeStep?: number;
  orientation?: StepperOrientation;
  stackedLabel?: boolean;
  nonLinear?: boolean;
  registerComponentApi?: (api: Record<string, unknown>) => void;
  onDidChange?: (newIndex: number, id: string) => void;
  children?: ReactNode;
};

export const Stepper = memo(forwardRef(function Stepper(
  {
    activeStep = defaultProps.activeStep,
    orientation = defaultProps.orientation,
    stackedLabel = defaultProps.stackedLabel,
    nonLinear = defaultProps.nonLinear,
    id,
    className,
    style,
    children,
    registerComponentApi,
    onDidChange,
    ...rest
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const generatedId = useId();
  const stepperId = id || generatedId;
  const [activeIndex, setActiveIndex] = useState<number>(
    Number.isFinite(activeStep) && activeStep >= 0 ? activeStep : 0,
  );

  useEffect(() => {
    if (activeStep === undefined || activeStep === null) {
      return;
    }
    setActiveIndex(Number.isFinite(activeStep) && activeStep >= 0 ? activeStep : 0);
  }, [activeStep]);

  const stepItemsRef = useRef<StepItem[]>([]);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const emitDidChange = useCallback((index: number) => {
    const item = stepItemsRef.current[index];
    onDidChange?.(index, item?.id ?? item?.innerId ?? "");
  }, [onDidChange]);
  const emitDidChangeRef = useRef(emitDidChange);
  emitDidChangeRef.current = emitDidChange;

  const commitActiveIndex = useCallback((next: number) => {
    const previous = activeIndexRef.current;
    if (previous === next) {
      return;
    }
    activeIndexRef.current = next;
    setActiveIndex(next);
    queueMicrotask(() => emitDidChangeRef.current(next));
  }, []);

  const handleStepClick = useCallback((innerId: string) => {
    const index = stepItemsRef.current.findIndex((step) => step.innerId === innerId);
    if (index < 0) {
      return;
    }
    commitActiveIndex(index);
  }, [commitActiveIndex]);

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
    if (activeIndex < 0 || activeIndex >= stepItems.length) {
      return "";
    }
    return stepItems[activeIndex]?.innerId ?? "";
  }, [activeIndex, stepItems]);

  const contextWithActiveId = useMemo(
    () => ({ ...contextValue, activeStepId }),
    [activeStepId, contextValue],
  );

  const apiRef = useRef<Record<string, unknown>>();
  if (!apiRef.current) {
    apiRef.current = {
      get activeStep() {
        return activeIndexRef.current;
      },
      next: () => {
        const total = stepItemsRef.current.length;
        if (total === 0) {
          return;
        }
        commitActiveIndex(Math.min(activeIndexRef.current + 1, total - 1));
      },
      prev: () => {
        commitActiveIndex(Math.max(activeIndexRef.current - 1, 0));
      },
      reset: () => {
        commitActiveIndex(0);
      },
      setActiveStep: (index: unknown) => {
        if (typeof index !== "number" || !Number.isFinite(index)) {
          return;
        }
        const total = stepItemsRef.current.length;
        if (index < 0 || index >= total) {
          return;
        }
        commitActiveIndex(index);
      },
    };
  }

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        registerComponentApi?.(apiRef.current!);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeIndex, registerComponentApi]);

  const renderIcon = useCallback((
    item: { completed?: boolean; error?: boolean; icon?: string },
    index: number,
    isActive: boolean,
  ) => {
    const completed = Boolean(item.completed);
    const error = Boolean(item.error);
    const content = error
      ? <Icon name="error" size="sm" />
      : completed
        ? <Icon name="checkmark" size="sm" />
        : item.icon
          ? <Icon name={item.icon} size="sm" />
          : index + 1;
    return (
      <span className={cx(
        styles.iconCircle,
        isActive && !completed && !error && styles.active,
        completed && !error && styles.completed,
        error && styles.error,
      )} aria-hidden="true">
        {content}
      </span>
    );
  }, []);

  const renderLabelBlock = useCallback((item: StepItem, isActive: boolean) => {
    if (!item.label && !item.description && !item.optional) {
      return null;
    }
    return (
      <span className={styles.labelBlock}>
        {item.label && (
          <span className={cx(
            styles.label,
            isActive && styles.active,
            item.completed && !item.error && styles.completed,
            item.error && styles.error,
          )}>
            {item.label}
          </span>
        )}
        {item.description && <span className={styles.description}>{item.description}</span>}
        {item.optional && !item.description && (
          <span className={styles.description}>{item.optionalLabel || "Optional"}</span>
        )}
      </span>
    );
  }, []);

  const rootClassName = cx(
    styles.stepper,
    orientation === "horizontal" ? styles.horizontal : styles.vertical,
    stackedLabel && styles.stackedLabel,
    className,
  );

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
              const inner = (
                <>
                  {renderIcon(item, index, isActive)}
                  {renderLabelBlock(item, isActive)}
                </>
              );
              return (
                <Fragment key={item.innerId}>
                  <div className={styles.headerItem} role="listitem">
                    {nonLinear ? (
                      <button
                        type="button"
                        className={cx(styles.headerItemInner, styles.clickable)}
                        aria-current={isActive ? "step" : undefined}
                        onClick={() => handleStepClick(item.innerId)}
                      >
                        {inner}
                      </button>
                    ) : (
                      <div
                        className={styles.headerItemInner}
                        aria-current={isActive ? "step" : undefined}
                      >
                        {inner}
                      </div>
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={cx(styles.connector, item.completed && styles.completed)}
                      aria-hidden="true"
                    />
                  )}
                </Fragment>
              );
            })}
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      </StepperContext.Provider>
    );
  }

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
}));

function cx(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function Fragment({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
