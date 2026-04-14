import React from "react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import produce from "immer";

import { EMPTY_ARRAY } from "../../components-core/constants";

export type StepItem = {
  innerId: string;
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
  }) => React.ReactNode;
};

export interface IStepperContext {
  register: (item: StepItem) => void;
  unregister: (innerId: string) => void;
  activeStep: number;
  stepCount: number;
  orientation: "horizontal" | "vertical";
  allowNextStepsSelect: boolean;
  linear: boolean;
  getStepItems: () => StepItem[];
}

export const StepperContext = createContext<IStepperContext>({
  register: () => {},
  unregister: () => {},
  activeStep: 0,
  stepCount: 0,
  orientation: "horizontal",
  allowNextStepsSelect: true,
  linear: false,
  getStepItems: () => [],
});

export function useStepperContext() {
  return useContext(StepperContext);
}

export function useStepperContextValue(opts: {
  activeStep: number;
  orientation: "horizontal" | "vertical";
  allowNextStepsSelect: boolean;
  linear: boolean;
}) {
  const [stepItems, setStepItems] = useState<StepItem[]>(EMPTY_ARRAY);
  const stepItemsRef = useRef<StepItem[]>(EMPTY_ARRAY);
  stepItemsRef.current = stepItems;

  const register = useCallback((item: StepItem) => {
    setStepItems(
      produce((draft) => {
        const existing = draft.findIndex((s) => s.innerId === item.innerId);
        if (existing < 0) {
          draft.push(item);
        } else {
          draft[existing] = item;
        }
      }),
    );
  }, []);

  const unregister = useCallback((innerId: string) => {
    setStepItems(
      produce((draft) => {
        return draft.filter((s) => s.innerId !== innerId);
      }),
    );
  }, []);

  const getStepItems = useCallback(() => {
    return stepItemsRef.current;
  }, []);

  const contextValue = useMemo<IStepperContext>(
    () => ({
      register,
      unregister,
      activeStep: opts.activeStep,
      stepCount: stepItems.length,
      orientation: opts.orientation,
      allowNextStepsSelect: opts.allowNextStepsSelect,
      linear: opts.linear,
      getStepItems,
    }),
    [
      register,
      unregister,
      opts.activeStep,
      stepItems.length,
      opts.orientation,
      opts.allowNextStepsSelect,
      opts.linear,
      getStepItems,
    ],
  );

  return { stepItems, contextValue };
}
