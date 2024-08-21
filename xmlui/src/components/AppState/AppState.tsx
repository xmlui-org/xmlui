import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { useIsomorphicLayoutEffect } from "@components-core/utils/hooks";
import { useAppStateContextPart } from "@components/App/AppStateContext";

function AppState({
  bucket = "default",
  updateState,
  initialValue,
  registerComponentApi,
}: {
  bucket?: string;
  initialValue: Record<string, any>;
  updateState: UpdateStateFn;
  registerComponentApi: RegisterComponentApiFn;
}) {
  const registerAppState = useAppStateContextPart((value) => value.registerAppState);
  const update = useAppStateContextPart((value) => value.update);
  useIsomorphicLayoutEffect(() => {
    if (initialValue !== undefined) {
      registerAppState(bucket, initialValue);
    }
  }, [bucket, initialValue, registerAppState]);

  const value = useAppStateContextPart((value) => value.appState[bucket]);
  useIsomorphicLayoutEffect(() => {
    updateState({ value });
  }, [updateState, value]);

  useIsomorphicLayoutEffect(() => {
    registerComponentApi({
      update: (patch) => update(bucket, patch),
    });
  }, [bucket, registerComponentApi, update]);

  return null;
}

/**
 * AppState is a functional component (without a visible user interface) that helps store and 
 * manage the app's state.
 */
export interface AppStateComponentDef extends ComponentDef<"AppState"> {
  props: {
    /**
     * This property is the identifier of the bucket to which the \`AppState\` instance is bound. 
     * Multiple \`AppState\` instances with the same bucket will share the same state object: any of 
     * them updating the state will cause the other instances to view the new, updated state.
     */
    bucket?: string;
    /**
     * This property contains the initial state value. Though you can use multiple \`AppState\` 
     * component instances for the same bucket with their \`initialValue\` set, it may result in faulty 
     * app logic. When xmlui instantiates an \`AppInstance\` with an explicit initial value, that value 
     * is immediately set. Multiple initial values may result in undesired initialization.
     */
    initialValue?: string;
  };
  api: {
    /**
     * You can access the state object through this property.
     */
    value: Record<string, any>;
    update: (patch: Record<string, any>) => void;
  }
}

export const appStateComponentRenderer = createComponentRenderer<AppStateComponentDef>(
  "AppState",
  ({ node, extractValue, updateState, registerComponentApi }) => {
    return (
      <AppState
        bucket={extractValue(node.props.bucket)}
        initialValue={extractValue(node.props.initialValue)}
        updateState={updateState}
        registerComponentApi={registerComponentApi}
      />
    );
  },
  {}
);
