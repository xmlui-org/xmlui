import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";
import { useAppStateContextPart } from "../../components/App/AppStateContext";

export const defaultProps: Pick<{ bucket?: string }, "bucket"> = {
  bucket: "default",
};

export function AppState({
  bucket = defaultProps.bucket,
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
