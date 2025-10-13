import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";
import { useAppStateContextPart } from "../../components/App/AppStateContext";

export const defaultProps: Pick<{ bucket?: string }, "bucket"> = {
  bucket: "default",
};

type Props = {
  bucket?: string;
  initialValue: Record<string, any>;
  updateState: UpdateStateFn;
  registerComponentApi: RegisterComponentApiFn;
  onDidUpdate?: AsyncFunction;
};

export function AppState({
  bucket = defaultProps.bucket,
  updateState,
  initialValue,
  registerComponentApi,
  onDidUpdate,
}: Props) {
  const update = useAppStateContextPart((value) => value.update);
  const value = useAppStateContextPart((value) => value?.appState?.[bucket]);

  useIsomorphicLayoutEffect(() => {
    if (initialValue !== undefined) {
      update(bucket, initialValue);
    }
  }, [bucket, initialValue]);

  useIsomorphicLayoutEffect(() => {
    updateState({ value });
    
    // Fire the didUpdate event when value changes
    if (onDidUpdate) {
      onDidUpdate({ bucket, value, previousValue: undefined }); // Note: previousValue tracking could be added if needed
    }
  }, [updateState, value, onDidUpdate, bucket]);

  useIsomorphicLayoutEffect(() => {
    registerComponentApi({
      update: (patch) => update(bucket, patch),
      appendToList: (key: string, id: any) => {
        const currentState = value || {};
        const currentArray = currentState[key] || [];
        // Only add if the id doesn't already exist in the array
        if (!currentArray.includes(id)) {
          const newArray = [...currentArray, id];
          update(bucket, { [key]: newArray });
        }
      },
      removeFromList: (key: string, id: any) => {
        const currentState = value || {};
        const currentArray = currentState[key] || [];
        const newArray = currentArray.filter((item: any) => item !== id);
        update(bucket, { [key]: newArray });
      },
      listIncludes: (key: string, id: any) => {
        const currentState = value || {};
        const currentArray = currentState[key] || [];
        return currentArray.includes(id);
      },
    });
  }, [bucket, registerComponentApi, update, value]);

  return null;
}
