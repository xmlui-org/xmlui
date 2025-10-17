import { useMemo } from "react";
import { usePlayground } from "../hooks/usePlayground";
import { NestedApp } from "xmlui";

export function Preview() {
  const { appDescription, options } = usePlayground();

  let components = useMemo(
    () => appDescription.components.map((comp) => comp.component),
    [appDescription.components],
  );
  return (
    <NestedApp
      app={appDescription.app}
      activeTone={options.activeTone}
      activeTheme={options.activeTheme}
      api={appDescription.api}
      components={components}
      config={appDescription.config}
      height={"100%"}
    />
  );
}
