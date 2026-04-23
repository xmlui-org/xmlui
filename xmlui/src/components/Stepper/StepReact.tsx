import type { ForwardedRef, ReactNode } from "react";
import React, { forwardRef, memo, useEffect, useId } from "react";
import classnames from "classnames";

import styles from "./Stepper.module.scss";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import {
  useStepperSettings,
  useStepperState,
} from "./StepperContext";
import { panelIdFor, tabIdFor } from "./StepperReact";

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & {
  label?: string;
  description?: string;
  icon?: string;
  classes?: Record<string, string>;
  activated?: () => void;
  children?: ReactNode;
};

export const Step = memo(
  forwardRef(function Step(
    {
      label,
      description,
      icon,
      className,
      classes,
      style,
      children,
      activated,
      ...rest
    }: Props,
    forwardedRef: ForwardedRef<HTMLDivElement>,
  ) {
    const innerId = useId();
    // Registration + static config: depends only on the settings slice of the
    // stepper context, which is stable across step transitions.
    const { register, unRegister, getStepItems, orientation, nonLinear, onStepClick, stepperInstanceId } =
      useStepperSettings();
    // Active-step state lives in a separate context so re-renders triggered
    // by navigation do not invalidate the registration effect above.
    const { activeStepId } = useStepperState();

    useEffect(() => {
      register({
        innerId,
        label,
        description,
        icon,
      });
    }, [register, innerId, label, description, icon]);

    useEffect(() => {
      return () => {
        unRegister(innerId);
      };
    }, [innerId, unRegister]);

    const isActive = activeStepId === innerId;
    const tabId = stepperInstanceId ? tabIdFor(stepperInstanceId, innerId) : undefined;
    const panelId = stepperInstanceId ? panelIdFor(stepperInstanceId, innerId) : undefined;

    useEffect(() => {
      if (isActive && activated) {
        activated();
      }
    }, [isActive, activated]);

    // Horizontal mode: only the active step renders its content below the header strip.
    // The Stepper wrapper already provides the `role="tabpanel"` semantics and
    // dynamic `aria-labelledby`, so we do NOT add another tabpanel role here
    // (nested tabpanels are invalid ARIA and confuse assistive tech).
    if (orientation === "horizontal") {
      if (!isActive) return null;
      return (
        <div
          {...rest}
          ref={forwardedRef}
          className={classnames(styles.horizontalContent, classes?.[COMPONENT_PART_KEY], className)}
          style={style}
        >
          {children}
        </div>
      );
    }

    // Vertical mode: this Step renders its own header + (if active) content + connector.
    const items = getStepItems();
    const index = items.findIndex((s) => s.innerId === innerId);
    const isLast = index === items.length - 1;

    const iconEl = (
      <span
        className={classnames(styles.iconCircle, {
          [styles.active]: isActive,
        })}
        aria-hidden="true"
      >
        {icon ? icon : index >= 0 ? index + 1 : ""}
      </span>
    );

    const labelEl =
      label || description ? (
        <span className={styles.labelBlock}>
          {label && (
            <span
              className={classnames(styles.label, {
                [styles.active]: isActive,
              })}
            >
              {label}
            </span>
          )}
          {description && <span className={styles.description}>{description}</span>}
        </span>
      ) : null;

    return (
      <div
        {...rest}
        ref={forwardedRef}
        className={classnames(styles.verticalItem, classes?.[COMPONENT_PART_KEY], className)}
        style={style}
      >
        <button
          type="button"
          id={tabId}
          role="tab"
          aria-selected={isActive}
          aria-controls={panelId}
          aria-current={isActive ? "step" : undefined}
          aria-disabled={!nonLinear && !isActive ? true : undefined}
          tabIndex={isActive ? 0 : -1}
          className={classnames(styles.verticalHeader, {
            [styles.clickable]: nonLinear,
          })}
          disabled={!nonLinear && !isActive}
          onClick={nonLinear ? () => onStepClick(innerId) : undefined}
        >
          {iconEl}
          {labelEl}
        </button>
        <div
          className={classnames(styles.verticalBody, { [styles.last]: isLast })}
          role="tabpanel"
          id={panelId}
          aria-labelledby={tabId}
          hidden={!isActive || undefined}
        >
          {isActive && children && <div className={styles.verticalContent}>{children}</div>}
        </div>
      </div>
    );
  }),
);
