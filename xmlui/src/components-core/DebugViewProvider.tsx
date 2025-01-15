import { createContext } from "react";

type StateViewOptions = {
  showBoundary?: boolean;
  blink?: boolean;
}

interface IDebugViewContext {
  displayStateView?: boolean;
  stateView?: StateViewOptions;
  setDisplayStateView: (display: boolean) => void;
}

export const DebugViewContext = createContext<IDebugViewContext | null>(null);