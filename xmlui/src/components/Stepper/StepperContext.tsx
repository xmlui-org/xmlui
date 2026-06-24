import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

export type StepItem = {
  innerId: string;
  id?: string;
  label?: string;
  description?: string;
  completed?: boolean;
  optional?: boolean;
  optionalLabel?: string;
  error?: boolean;
  icon?: string;
};

export type StepperOrientation = "horizontal" | "vertical";

type StepperContextValue = {
  register: (item: StepItem) => void;
  unRegister: (innerId: string) => void;
  getStepItems: () => StepItem[];
  activeStepId: string;
  activeIndex: number;
  orientation: StepperOrientation;
  stackedLabel: boolean;
  nonLinear: boolean;
  onStepClick: (innerId: string) => void;
};

export const StepperContext = createContext<StepperContextValue>({
  register: () => {},
  unRegister: () => {},
  getStepItems: () => [],
  activeStepId: "",
  activeIndex: 0,
  orientation: "horizontal",
  stackedLabel: false,
  nonLinear: false,
  onStepClick: () => {},
});

export function useStepperContextValue(
  orientation: StepperOrientation,
  stackedLabel: boolean,
  nonLinear: boolean,
  activeStepId: string,
  activeIndex: number,
  onStepClick: (innerId: string) => void,
) {
  const [stepItems, setStepItems] = useState<StepItem[]>([]);
  const stepItemsRef = useRef<StepItem[]>([]);
  stepItemsRef.current = stepItems;

  const register = useCallback((item: StepItem) => {
    setStepItems((items) => {
      const existing = items.findIndex((step) => step.innerId === item.innerId);
      if (existing < 0) {
        return [...items, item];
      }
      const next = [...items];
      next[existing] = item;
      return next;
    });
  }, []);

  const unRegister = useCallback((innerId: string) => {
    setStepItems((items) => items.filter((step) => step.innerId !== innerId));
  }, []);

  const getStepItems = useCallback(() => stepItemsRef.current, []);

  const contextValue = useMemo<StepperContextValue>(() => ({
    register,
    unRegister,
    getStepItems,
    activeStepId,
    activeIndex,
    orientation,
    stackedLabel,
    nonLinear,
    onStepClick,
  }), [
    activeIndex,
    activeStepId,
    getStepItems,
    nonLinear,
    onStepClick,
    orientation,
    register,
    stackedLabel,
    unRegister,
  ]);

  return { stepItems, contextValue };
}

export function useStepperContext() {
  return useContext(StepperContext);
}
