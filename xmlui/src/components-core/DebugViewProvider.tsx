import { createContext, useContext, useMemo, useState } from "react";
import styles from "./DebugViewProvider.module.scss";

// --- Represents the options for the state view.
type StateViewOptions = {
  showBoundary?: boolean;
  blink?: boolean;
};

// --- Represents a state transition.
type StateTransition = {
  action: string;
  uid?: string;
  prevState: any;
  nextState: any;
};

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
};

export function DebugViewProvider({ children, debugConfig }: Props) {
  const [showDebugToolsWindow, setShowDebugToolsWindow] = useState(false);
  const [displayStateView, setDisplayStateView] = useState(!!debugConfig?.displayStateView);
  const [collectStateTransitions, setCollectStateTransitions] = useState(
    !!debugConfig?.collectStateTransitions,
  );
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

  const contextValue: IDebugViewContext = useMemo(
    () => ({
      // showDebugToolsWindow,
      // openDebugToolsWindow,
      // closeDebugToolsWindow,
      // displayStateView,
      // stateViewOptions: { showBoundary: true, blink: true },
      // setDisplayStateView,
      collectStateTransitions,
      log: (logEntry) => {
        setStateTransitions((prev) => [...prev, logEntry]);
      },

      // startCollectingStateTransitions,
      // stopCollectingStateTransitions,
    }),
    [collectStateTransitions],
  );

  return (
    <DebugViewContext.Provider value={contextValue}>
      <div className={styles.wrapper}>
        <div className={styles.content}>
          {children}
        </div>
        <div className={styles.debugger}>
          {stateTransitions.reverse().map((st, index) => {
            return (
              <div key={index} style={{display: "flex", flexDirection: "row"}}>
                {new Date().toISOString()} - {st.action} - containerUid: {st.containerUid},{" "} uid: {st.uid},
                <details><summary>prev state</summary>{JSON.stringify({...st.prevState, value: JSON.stringify(st.prevState?.value, null, 2)?.substring(0, 20)}, null, 2)}</details>
                <details>
                  <summary>next state</summary>
                  {JSON.stringify({...st.nextState, value: JSON.stringify(st.nextState?.value, null, 2)?.substring(0, 20)}, null, 2)}
                </details>
              </div>
            );
          })}
          <button style={{position: 'absolute', right: 0, top: 0}} onClick={()=>{setStateTransitions([])}}>clear</button>
        </div>
      </div>
    </DebugViewContext.Provider>
  );
}

export function useDebugView() {
  return useContext(DebugViewContext);
}
