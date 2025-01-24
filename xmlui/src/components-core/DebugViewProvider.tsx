import { createContext, useContext, useState } from "react";

// --- Represents the options for the state view.
type StateViewOptions = {
  showBoundary?: boolean;
  blink?: boolean;
}

// --- Represents a state transition.
type StateTransition = {
  action: string;
  uid?: string;
  prevState: any;
  nextState: any;
}

// --- This type represents the shape of the debug configuration stored in the app's global properties.
interface DebugConfiguration {
  displayStateView?: boolean;
  stateViewOptions?: StateViewOptions;
  collectStateTransitions?: boolean;
}

// --- Represents the context for the debug view.
export interface IDebugViewContext extends DebugConfiguration {
  // --- Debug tools window
  showDebugToolsWindow: boolean;
  openDebugToolsWindow: () => void;
  closeDebugToolsWindow: () => void;

  // --- State view
  setDisplayStateView: (display: boolean) => void;

  // --- State transition collection
  stateTransitions?: StateTransition[];
  startCollectingStateTransitions: () => void;
  stopCollectingStateTransitions: () => void;
}

export const DebugViewContext = createContext<IDebugViewContext | null>(null);

type Props = {
  children: React.ReactNode;
  debugConfig?: DebugConfiguration;
}

export function DebugViewProvider({ children, debugConfig }: Props) {
  const [showDebugToolsWindow, setShowDebugToolsWindow] = useState(false);
  const [displayStateView, setDisplayStateView] = useState(!!debugConfig?.displayStateView);
  const [collectStateTransitions, setCollectStateTransitions] = useState(!!debugConfig?.collectStateTransitions);
  const [stateTransitions, setStateTransitions] = useState<StateTransition[]>([]);

  const openDebugToolsWindow = () => {
    setShowDebugToolsWindow(true);
  };

  const closeDebugToolsWindow = () => {
    setShowDebugToolsWindow(false);
  };

  const startCollectingStateTransitions = () => {
    setCollectStateTransitions(true);
    setStateTransitions([]);
  };

  const stopCollectingStateTransitions = () => {
    setCollectStateTransitions(false);
  };

  const contextValue: IDebugViewContext = {
    showDebugToolsWindow,
    openDebugToolsWindow,
    closeDebugToolsWindow,
    displayStateView,
    stateViewOptions: { showBoundary: true, blink: true },
    setDisplayStateView,
    collectStateTransitions,
    stateTransitions,
    startCollectingStateTransitions,
    stopCollectingStateTransitions,
  };

  return (
    <DebugViewContext.Provider value={contextValue}>
      {children}
    </DebugViewContext.Provider>
  );
}

export function useDebugView() {
  return useContext(DebugViewContext);
}