import type { ForwardedRef, ReactNode, KeyboardEvent } from "react";
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

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { useEvent } from "../../components-core/utils/misc";
import { noop } from "../../components-core/constants";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import {
  StepperSettingsContext,
  StepperStateContext,
  useStepperContextValue,
  type StepItem,
  type StepperOrientation,
} from "./StepperContext";

// CSS part keys – must match `parts` declared in Stepper metadata. Kept as
// module-local constants so the classnames and any theming consumer share a
// single source of truth.
export const PART_HEADER = "header";
export const PART_STEP = "step";
export const PART_ICON = "icon";
export const PART_LABEL = "label";
export const PART_DESCRIPTION = "description";
export const PART_CONNECTOR = "connector";
export const PART_CONTENT = "content";

// Helper: build a `tab` DOM id from the stepper instance + inner step id.
export const tabIdFor = (stepperId: string, innerId: string) =>
  `${stepperId}-tab-${innerId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
// Helper: build a `tabpanel` DOM id from the stepper instance + inner step id.
export const panelIdFor = (stepperId: string, innerId: string) =>
  `${stepperId}-panel-${innerId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & {
  id?: string;
  activeStep?: number;
  orientation?: StepperOrientation;
  stackedLabel?: boolean;
  nonLinear?: boolean;
  ariaLabel?: string;
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
  ariaLabel: "Stepper",
};

export const Stepper = memo(
  forwardRef(function Stepper(
    {
      activeStep = defaultProps.activeStep,
      orientation = defaultProps.orientation,
      stackedLabel = defaultProps.stackedLabel,
      nonLinear = defaultProps.nonLinear,
      ariaLabel = defaultProps.ariaLabel,
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

    // Horizontal-mode sequential cross-fade: on step change we first fade out
    // the currently displayed step, then swap the content, then fade in the
    // new step. `displayedIndex` is what the body actually renders, while
    // `activeIndex` is what the header highlights. Header highlight flips
    // immediately; the body eases over.
    const [displayedIndex, setDisplayedIndex] = useState<number>(activeIndex);
    const [bodyVisible, setBodyVisible] = useState<boolean>(true);

    useEffect(() => {
      if (orientation !== "horizontal") {
        // Vertical mode does its own per-segment accordion animation; keep
        // `displayedIndex` in sync so switching orientations does not leave
        // the body stale.
        if (displayedIndex !== activeIndex) setDisplayedIndex(activeIndex);
        if (!bodyVisible) setBodyVisible(true);
        return;
      }
      if (activeIndex === displayedIndex) return;
      // Fade out the current step first.
      setBodyVisible(false);
      const FADE_MS = 180;
      const swapTimer = setTimeout(() => {
        setDisplayedIndex(activeIndex);
        // Next frame: fade the (now-swapped) new step back in.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setBodyVisible(true));
        });
      }, FADE_MS);
      return () => clearTimeout(swapTimer);
    }, [activeIndex, displayedIndex, orientation, bodyVisible]);

    // `updateState` is normally referentially stable (from `wrapComponent`).
    // We still guard against a churning identity by keeping the *latest*
    // reference in a ref and firing the publish effect only when the index
    // itself changes.
    const updateStateRef = useRef(updateState);
    updateStateRef.current = updateState;
    useEffect(() => {
      updateStateRef.current?.({ activeStep: activeIndex });
    }, [activeIndex]);

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

    const { stepItems, settingsValue, stateValue } = useStepperContextValue(
      orientation,
      stackedLabel,
      nonLinear,
      "",
      activeIndex,
      handleStepClick,
      stepperId,
    );
    stepItemsRef.current = stepItems;

    // In horizontal mode we delay the body swap until the fade-out finishes,
    // so the context's activeStepId follows `displayedIndex` (not the raw
    // `activeIndex`). In vertical mode `displayedIndex` tracks `activeIndex`
    // one-for-one so per-segment accordions open and close immediately.
    const indexForBody =
      orientation === "horizontal" ? displayedIndex : activeIndex;
    const activeStepId = useMemo(() => {
      if (indexForBody < 0 || indexForBody >= stepItems.length) return "";
      return stepItems[indexForBody]?.innerId ?? "";
    }, [stepItems, indexForBody]);

    const stateValueWithActiveId = useMemo(
      () => ({ ...stateValue, activeStepId }),
      [stateValue, activeStepId],
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

    // --- Keyboard navigation (roving tabindex) ------------------------------
    // ArrowLeft/ArrowRight move among horizontal tabs; ArrowUp/ArrowDown move
    // among vertical tab headers; Home/End jump to first/last. Disabled tabs
    // (linear mode, non-active) are skipped.
    const handleHeaderKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        const items = stepItemsRef.current;
        if (items.length === 0) return;
        const isHorizontalNav =
          e.key === "ArrowLeft" || e.key === "ArrowRight";
        const isVerticalNav = e.key === "ArrowUp" || e.key === "ArrowDown";
        const isHomeEnd = e.key === "Home" || e.key === "End";
        if (!isHorizontalNav && !isVerticalNav && !isHomeEnd) return;
        // Only interpret arrow keys matching the current orientation.
        if (isHorizontalNav && orientation !== "horizontal") return;
        if (isVerticalNav && orientation !== "vertical") return;
        e.preventDefault();
        let nextIdx = activeIndex;
        if (e.key === "Home") nextIdx = 0;
        else if (e.key === "End") nextIdx = items.length - 1;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
          nextIdx = Math.max(0, activeIndex - 1);
        else if (e.key === "ArrowRight" || e.key === "ArrowDown")
          nextIdx = Math.min(items.length - 1, activeIndex + 1);
        if (nextIdx === activeIndex) return;
        // Respect linear mode: only nonLinear steppers accept arbitrary jumps
        // from the keyboard. In linear mode, arrows are inert (use next/prev
        // programmatic APIs to step through).
        if (!nonLinear) return;
        setActiveIndex(nextIdx);
        const item = items[nextIdx];
        onDidChange?.(nextIdx, item?.id ?? item?.innerId ?? "");
      },
      [orientation, activeIndex, nonLinear, onDidChange],
    );

    // --- Rendering helpers (horizontal mode)
    const renderIcon = useCallback(
      (
        item: StepItem,
        index: number,
        isActive: boolean,
      ) => {
        const completed = !!item.completed;
        const error = !!item.error;
        return (
          <span
            className={classnames(styles.iconCircle, classes?.[PART_ICON], {
              [styles.active]: isActive && !completed && !error,
              [styles.completed]: completed && !error,
              [styles.error]: error,
            })}
            aria-hidden="true"
          >
            {error ? "!" : completed ? "✓" : item.icon ? item.icon : index + 1}
          </span>
        );
      },
      [classes],
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
                className={classnames(styles.label, classes?.[PART_LABEL], {
                  [styles.active]: isActive,
                  [styles.completed]: !!item.completed && !item.error,
                  [styles.error]: !!item.error,
                })}
              >
                {item.label}
              </span>
            )}
            {hasDescription && (
              <span
                className={classnames(styles.description, classes?.[PART_DESCRIPTION])}
              >
                {item.description}
              </span>
            )}
            {showOptional && !hasDescription && (
              <span
                className={classnames(styles.description, classes?.[PART_DESCRIPTION])}
              >
                {item.optionalLabel || "Optional"}
              </span>
            )}
          </span>
        );
      },
      [classes],
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
        <StepperSettingsContext.Provider value={settingsValue}>
          <StepperStateContext.Provider value={stateValueWithActiveId}>
            <div
              {...rest}
              id={stepperId}
              ref={forwardedRef}
              className={rootClassName}
              style={style}
            >
              <div
                className={classnames(styles.header, classes?.[PART_HEADER])}
                role="tablist"
                aria-label={ariaLabel}
                aria-orientation="horizontal"
                onKeyDown={handleHeaderKeyDown}
              >
                {stepItems.map((item, index) => {
                  const isActive = index === activeIndex;
                  const isLast = index === stepItems.length - 1;
                  const tabId = tabIdFor(stepperId, item.innerId);
                  const panelId = panelIdFor(stepperId, item.innerId);
                  // Roving tabindex: only the active tab takes tab focus; the
                  // rest are reachable via arrow keys.
                  const tabIndex = isActive ? 0 : -1;
                  // Linear mode headers are static (not keyboard-navigable as
                  // tabs). We still render the `tab` role so screen readers
                  // recognise the structure, but mark non-active ones
                  // `aria-disabled="true"` and make them non-clickable.
                  return (
                    <React.Fragment key={item.innerId}>
                      <div
                        className={classnames(styles.headerItem, classes?.[PART_STEP])}
                      >
                        <button
                          type="button"
                          id={tabId}
                          role="tab"
                          aria-selected={isActive}
                          aria-controls={panelId}
                          aria-current={isActive ? "step" : undefined}
                          aria-disabled={!nonLinear && !isActive ? true : undefined}
                          tabIndex={tabIndex}
                          className={classnames(styles.headerItemInner, {
                            [styles.clickable]: nonLinear,
                          })}
                          disabled={!nonLinear && !isActive}
                          onClick={
                            nonLinear ? () => handleStepClick(item.innerId) : undefined
                          }
                        >
                          {renderIcon(item, index, isActive)}
                          {renderLabelBlock(item, isActive)}
                        </button>
                      </div>
                      {!isLast && (
                        <div
                          className={classnames(styles.connector, classes?.[PART_CONNECTOR], {
                            [styles.completed]: !!item.completed,
                          })}
                          aria-hidden="true"
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              {/* Active Step/FormSegment renders its children inside; the
                  wrapper below supplies the tabpanel semantics. */}
              <div
                className={classnames(
                  styles.content,
                  styles.horizontalContent,
                  classes?.[PART_CONTENT],
                )}
                role="tabpanel"
                id={activeStepId ? panelIdFor(stepperId, activeStepId) : undefined}
                aria-labelledby={
                  activeStepId ? tabIdFor(stepperId, activeStepId) : undefined
                }
                style={{ opacity: bodyVisible ? 1 : 0 }}
              >
                {children}
              </div>
            </div>
          </StepperStateContext.Provider>
        </StepperSettingsContext.Provider>
      );
    }

    // --- Vertical rendering: Step children render their own header+content+connector
    return (
      <StepperSettingsContext.Provider value={settingsValue}>
        <StepperStateContext.Provider value={stateValueWithActiveId}>
          <div
            {...rest}
            id={stepperId}
            ref={forwardedRef}
            className={rootClassName}
            style={style}
            role="tablist"
            aria-label={ariaLabel}
            aria-orientation="vertical"
            onKeyDown={handleHeaderKeyDown}
          >
            {children}
          </div>
        </StepperStateContext.Provider>
      </StepperSettingsContext.Provider>
    );
  }),
);
