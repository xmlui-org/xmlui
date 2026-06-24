import type { ForwardedRef, HTMLAttributes, ReactNode } from "react";
import { forwardRef, memo, useEffect, useId } from "react";

import { Icon } from "../Icon/IconReact";
import styles from "./Stepper.module.scss";
import { useStepperContext } from "./StepperContext";

type Props = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  label?: string;
  description?: string;
  icon?: string;
  error?: boolean;
  completed?: boolean;
  activated?: () => void;
  children?: ReactNode;
};

export const Step = memo(forwardRef(function Step(
  {
    label,
    description,
    icon,
    error = false,
    completed = false,
    className,
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
      error,
      completed,
    });
  }, [completed, description, error, icon, innerId, label, register]);

  useEffect(() => () => {
    unRegister(innerId);
  }, [innerId, unRegister]);

  const isActive = activeStepId === innerId;

  useEffect(() => {
    if (isActive) {
      activated?.();
    }
  }, [activated, isActive]);

  if (orientation === "horizontal") {
    if (!isActive) {
      return null;
    }
    return (
      <div
        {...rest}
        ref={forwardedRef}
        className={cx(styles.horizontalContent, className)}
        style={style}
        role="tabpanel"
      >
        {children}
      </div>
    );
  }

  const items = getStepItems();
  const index = items.findIndex((step) => step.innerId === innerId);
  const isLast = index === items.length - 1;
  const showError = Boolean(error);
  const showCompleted = Boolean(completed) && !showError;
  const iconContent = showError
    ? <Icon name="error" size="sm" />
    : showCompleted
      ? <Icon name="checkmark" size="sm" />
      : icon
        ? <Icon name={icon} size="sm" />
        : index >= 0 ? index + 1 : "";

  const iconEl = (
    <span className={cx(
      styles.iconCircle,
      isActive && !showCompleted && !showError && styles.active,
      showCompleted && styles.completed,
      showError && styles.error,
    )} aria-hidden="true">
      {iconContent}
    </span>
  );

  const labelEl = label || description ? (
    <span className={styles.labelBlock}>
      {label && (
        <span className={cx(
          styles.label,
          isActive && !showCompleted && !showError && styles.active,
          showCompleted && styles.completed,
          showError && styles.error,
        )}>
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
      className={cx(styles.verticalItem, className)}
      style={style}
    >
      {nonLinear ? (
        <button
          type="button"
          className={cx(styles.verticalHeader, styles.clickable)}
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
      <div className={cx(styles.verticalBody, isLast && styles.last)}>
        {isActive && children && <div className={styles.verticalContent}>{children}</div>}
      </div>
    </div>
  );
}));

function cx(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
