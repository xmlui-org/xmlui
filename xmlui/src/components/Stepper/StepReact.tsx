import type { ForwardedRef, ReactNode } from "react";
import React, { forwardRef, memo, useEffect, useId } from "react";
import classnames from "classnames";

import styles from "./Stepper.module.scss";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { useStepperContext } from "./StepperContext";

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
    const {
      register,
      unRegister,
      getStepItems,
      activeStepId,
      orientation,
      nonLinear,
      onStepClick,
    } = useStepperContext();

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

    useEffect(() => {
      if (isActive && activated) {
        activated();
      }
    }, [isActive, activated]);

    // Horizontal mode: only the active step renders its content below the header strip.
    if (orientation === "horizontal") {
      if (!isActive) return null;
      return (
        <div
          {...rest}
          ref={forwardedRef}
          className={classnames(styles.horizontalContent, classes?.[COMPONENT_PART_KEY], className)}
          style={style}
          role="tabpanel"
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
        {nonLinear ? (
          <button
            type="button"
            className={classnames(styles.verticalHeader, styles.clickable)}
            aria-current={isActive ? "step" : undefined}
            onClick={() => onStepClick(innerId)}
          >
            {iconEl}
            {labelEl}
          </button>
        ) : (
          <div className={styles.verticalHeader} aria-current={isActive ? "step" : undefined}>
            {iconEl}
            {labelEl}
          </div>
        )}
        <div className={classnames(styles.verticalBody, { [styles.last]: isLast })}>
          {isActive && children && <div className={styles.verticalContent}>{children}</div>}
        </div>
      </div>
    );
  }),
);
