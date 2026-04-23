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

// --- Two-context split --------------------------------------------------------
// `Settings` holds everything that stays stable across step transitions:
// registration callbacks, orientation/layout flags, and the click handler. The
// stepper can re-render many times without these changing, so consumers that
// only need to register themselves (e.g. a Step mount effect) will not re-run.
//
// `State` holds the transient active-step information and changes on every
// navigation. Consumers that reflect the active state (render-time) subscribe
// only to this context, avoiding the churn caused when a single merged context
// would invalidate every consumer on each navigation.
interface IStepperSettings {
  inStepper: boolean;
  register: (item: StepItem) => void;
  unRegister: (innerId: string) => void;
  getStepItems: () => StepItem[];
  orientation: StepperOrientation;
  stackedLabel: boolean;
  nonLinear: boolean;
  onStepClick: (innerId: string) => void;
  // Shared id prefix used to derive per-step tab/panel DOM ids so the ARIA
  // `aria-controls` / `aria-labelledby` pair can cross the header ↔ content
  // boundary without each consumer re-inventing the scheme.
  stepperInstanceId: string;
}

interface IStepperState {
  activeStepId: string;
  activeIndex: number;
}

const DEFAULT_SETTINGS: IStepperSettings = {
  inStepper: false,
  register: () => {},
  unRegister: () => {},
  getStepItems: () => [],
  orientation: "horizontal",
  stackedLabel: false,
  nonLinear: false,
  onStepClick: () => {},
  stepperInstanceId: "",
};

const DEFAULT_STATE: IStepperState = {
  activeStepId: "",
  activeIndex: 0,
};

export const StepperSettingsContext = createContext<IStepperSettings>(DEFAULT_SETTINGS);
export const StepperStateContext = createContext<IStepperState>(DEFAULT_STATE);

export function useStepperSettings() {
  return useContext(StepperSettingsContext);
}

export function useStepperState() {
  return useContext(StepperStateContext);
}

// Convenience combined hook. Prefer `useStepperSettings` / `useStepperState`
// directly so that consumers only re-render on the slice they actually read.
export function useStepperContext() {
  const settings = useStepperSettings();
  const state = useStepperState();
  return useMemo(() => ({ ...settings, ...state }), [settings, state]);
}

/**
 * Backing store + context values for a Stepper. Returns the two memoized
 * context values plus the current list of registered step items.
 */
export function useStepperContextValue(
  orientation: StepperOrientation,
  stackedLabel: boolean,
  nonLinear: boolean,
  activeStepId: string,
  activeIndex: number,
  onStepClick: (innerId: string) => void,
  stepperInstanceId: string,
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

  const settingsValue = useMemo<IStepperSettings>(
    () => ({
      inStepper: true,
      register,
      unRegister,
      getStepItems,
      orientation,
      stackedLabel,
      nonLinear,
      onStepClick,
      stepperInstanceId,
    }),
    [
      register,
      unRegister,
      getStepItems,
      orientation,
      stackedLabel,
      nonLinear,
      onStepClick,
      stepperInstanceId,
    ],
  );

  const stateValue = useMemo<IStepperState>(
    () => ({ activeStepId, activeIndex }),
    [activeStepId, activeIndex],
  );

  return { stepItems, settingsValue, stateValue };
}
