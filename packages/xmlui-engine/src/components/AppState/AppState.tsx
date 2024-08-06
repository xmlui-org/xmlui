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

interface AppStateComponentDef extends ComponentDef<"AppState"> {
  props: {
    bucket?: string;
    initialValue?: string;
  };
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
