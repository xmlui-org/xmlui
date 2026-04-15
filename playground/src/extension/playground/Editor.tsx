import { editorStatusChanged, textChanged } from "../state/store";
import { startTransition, useCallback, useEffect, useState } from "react";
import { usePlayground } from "../hooks/usePlayground";
import { Editor as XMLUIEditor } from "xmlui-devtools";
import { overflows } from "xmlui/testing";

export const Editor = () => {
  const { text, dispatch, options } = usePlayground();
  const [value, setValue] = useState(text);

  useEffect(() => {
    setValue(text);
  }, [text]);

  const updateValue = useCallback(
    (value: string) => {
      setValue(value);
      startTransition(() => {
        dispatch(textChanged(value));
      });
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
      value={value}
    />
  );
};
