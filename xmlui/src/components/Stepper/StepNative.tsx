import type { ForwardedRef, ReactNode } from "react";
import React, { forwardRef, memo, useEffect, useId, useRef } from "react";

import { useStepperContext } from "./StepperContext";

type Props = {
  label?: string;
  description?: string;
  icon?: string;
  completedIcon?: string;
  loading?: boolean;
  allowSkip?: boolean;
  allowStepSelect?: boolean;
  onActivate?: () => void;
  headerRenderer?: (context: {
    index: number;
    label?: string;
    isActive: boolean;
    isCompleted: boolean;
    isFirst: boolean;
    isLast: boolean;
  }) => ReactNode;
  children?: ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

export const defaultProps = {
  completedIcon: "check",
  loading: false,
  allowSkip: false,
  allowStepSelect: undefined as boolean | undefined,
};

export const StepNative = memo(
  forwardRef(function StepNative(
    {
      label,
      description,
      icon,
      completedIcon = defaultProps.completedIcon,
      loading = defaultProps.loading,
      allowSkip = defaultProps.allowSkip,
      allowStepSelect,
      onActivate,
      headerRenderer,
      children,
      style,
      className,
      ...rest
    }: Props,
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    const innerId = useId();
    const ctx = useStepperContext();
    const prevActiveRef = useRef(false);

    useEffect(() => {
      ctx.register({
        innerId,
        label,
        description,
        icon,
        completedIcon,
        loading,
        allowSkip,
        allowStepSelect,
        onActivate,
        headerRenderer,
      });
    }, [innerId, label, description, icon, completedIcon, loading, allowSkip, allowStepSelect, onActivate, headerRenderer, ctx.register]);

    useEffect(() => {
      return () => {
        ctx.unregister(innerId);
      };
    }, [innerId, ctx.unregister]);

    // Determine own index
    const stepItems = ctx.getStepItems();
    const ownIndex = stepItems.findIndex((s) => s.innerId === innerId);
    const isActive = ownIndex === ctx.activeStep;

    // Fire onActivate when becoming active
    useEffect(() => {
      if (isActive && !prevActiveRef.current) {
        onActivate?.();
      }
      prevActiveRef.current = isActive;
    }, [isActive, onActivate]);

    if (!isActive) {
      return null;
    }

    return (
      <div ref={ref} style={style} className={className} {...rest}>
        {children}
      </div>
    );
  }),
);
