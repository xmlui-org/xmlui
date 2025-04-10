import { editorStatusChanged, textChanged } from "../state/store";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { usePlayground } from "../hooks/usePlayground";
import { useTheme } from "nextra-theme-docs";
import { Editor as XMLUIEditor } from "xmlui-devtools";

export const Editor = () => {
  const { text, dispatch, options } = usePlayground();
  const [value, setValue] = useState(text);
  const { theme, systemTheme } = useTheme();

  const isDark = useMemo(() => {
    return theme === "dark" || (theme === "system" && systemTheme === "dark");
  }, [theme, systemTheme]);

  useEffect(() => {
    setValue(text);
  }, [text]);

  const updateValue = useCallback(
    (value) => {
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
      activeThemeTone={isDark ? "dark" : "light"}
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
