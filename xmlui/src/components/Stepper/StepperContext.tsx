import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import produce from "immer";

import { EMPTY_ARRAY } from "../../components-core/constants";

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

interface IStepperContext {
  register: (item: StepItem) => void;
  unRegister: (innerId: string) => void;
  getStepItems: () => StepItem[];
  activeStepId: string;
  activeIndex: number;
  orientation: StepperOrientation;
  stackedLabel: boolean;
  nonLinear: boolean;
  onStepClick: (innerId: string) => void;
}

export const StepperContext = createContext<IStepperContext>({
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

  const unRegister = useCallback((innerId: string) => {
    setStepItems(
      produce((draft) => {
        return draft.filter((s) => s.innerId !== innerId);
      }),
    );
  }, []);

  const getStepItems = useCallback(() => stepItemsRef.current, []);

  const contextValue = useMemo<IStepperContext>(
    () => ({
      register,
      unRegister,
      getStepItems,
      activeStepId,
      activeIndex,
      orientation,
      stackedLabel,
      nonLinear,
      onStepClick,
    }),
    [
      register,
      unRegister,
      getStepItems,
      activeStepId,
      activeIndex,
      orientation,
      stackedLabel,
      nonLinear,
      onStepClick,
    ],
  );

  return { stepItems, contextValue };
}

export function useStepperContext() {
  return useContext(StepperContext);
}
