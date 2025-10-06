import { editorStatusChanged, textChanged } from "../state/store";
import { useCallback, useEffect } from "react";
import { usePlayground } from "../hooks/usePlayground";
import { Editor as XMLUIEditor } from "xmlui-devtools";

export const Editor = () => {
  const { text, dispatch, options } = usePlayground();

  const updateValue = useCallback(
    (value: string) => {
      dispatch(textChanged(value));
    },
    [dispatch],
  );

  useEffect(() => {
    dispatch(editorStatusChanged("loading"));
  }, [dispatch]);

  return (
    <XMLUIEditor
      readOnly={false}
      activeThemeTone={options.activeTone}
      saveViewState={true}
      key={"app"}
      onChange={updateValue}
      language={options.language}
      onMount={() => {
        dispatch(editorStatusChanged("loaded"));
      }}
      value={text} // Directly use global state
    />
  );
};
