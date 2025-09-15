import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

import type { RendererContext } from "../../abstractions/RendererDefs";
import { animationBehavior, tooltipBehavior } from "./CoreBehaviors";

/**
 * Defines the shape of a component behavior that can wrap a component with
 * additional functionality.
 */
export interface Behavior {
  /**
   * The name of the behavior (e.g., "tooltip", "animation").
   */
  name: string;

  /**
   * A function that determines if the behavior should be applied based on the
   * component's context and props.
   * @param context The renderer context of the component.
   * @returns True if the behavior is enabled, otherwise false.
   */
  isEnabled: (context: RendererContext<any>) => boolean;

  /**
   * A function that wraps the component's React node with the behavior's
   * functionality.
   * @param context The renderer context of the component.
   * @param node The React node to wrap.
   * @returns The wrapped React node.
   */
  wrap: (context: RendererContext<any>, node: ReactNode) => ReactNode;
}

/**
 * Defines the context for managing and applying component behaviors.
 */
export interface BehaviorContextType {
  /**
   * A map of registered behaviors, with the behavior's name as the key.
   */
  behaviors: Map<string, Behavior>;

  /**
   * Returns a list of all registered behaviors.
   */
  getBehaviors: () => Behavior[];

  /**
   * Registers a new behavior.
   * @param behavior The behavior to register.
   */
  registerBehavior: (behavior: Behavior) => void;

  /**
   * Unregisters a behavior by its name.
   * @param name The name of the behavior to unregister.
   */
  unregisterBehavior: (name: string) => void;
}

// --- Create the context with a default value
const BehaviorContext = createContext<BehaviorContextType | undefined>(
  undefined
);

/**
 * A provider component that makes the behavior management system available to
 * its children.
 */
export const BehaviorsProvider = ({ children }: { children: ReactNode }) => {
  const behaviors = useMemo(() => new Map<string, Behavior>(), []);

  const getBehaviors = () => {
    return Array.from(behaviors.values());
  };

  const registerBehavior = (behavior: Behavior) => {
    behaviors.set(behavior.name, behavior);
  };

  const unregisterBehavior = (name: string) => {
    behaviors.delete(name);
  };

  useMemo(() => {
    registerBehavior(animationBehavior);
    registerBehavior(tooltipBehavior);
  }, []);

  const contextValue = useMemo<BehaviorContextType>(
    () => ({
      behaviors,
      registerBehavior,
      unregisterBehavior,
      getBehaviors,
    }),
    [behaviors]
  );

  return (
    <BehaviorContext.Provider value={contextValue}>
      {children}
    </BehaviorContext.Provider>
  );
};

/**
 * A custom hook to access the behavior context.
 */
export const useBehaviors = () => {
  const context = useContext(BehaviorContext);
  if (!context) {
    throw new Error("useBehaviors must be used within a BehaviorsProvider");
  }
  return context;
};
