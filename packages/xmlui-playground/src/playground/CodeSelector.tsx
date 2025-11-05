import { useMemo } from "react";
import { usePlayground } from "../hooks/usePlayground";
import { contentChanged } from "../state/store";
import {
  type CompoundComponentDef,
  type ThemeDefinition,
  DropdownMenu,
  MenuItem,
  Text,
} from "xmlui";
import styles from "./CodeSelector.module.scss";

export const CodeSelector = () => {
  const { appDescription, options, dispatch } = usePlayground();

  const selectedValue = useMemo(() => {
    let content = "";
    if (options.content === "app") {
      content = "Main.xmlui";
    } else if (content === "config") {
      content = "config.json";
    } else if (
      appDescription.config?.themes?.some((theme: ThemeDefinition) => theme.id === options.content)
    ) {
      content = `${options.content}.json`;
    } else if (
      appDescription.components?.some(
        (component: CompoundComponentDef) =>
          component.name.toLowerCase() === options.content.toLowerCase(),
      )
    ) {
      content = `${options.content}.xmlui`;
    }
    return content;
  }, [appDescription.components, appDescription.config?.themes, options.content]);

  return (
    <DropdownMenu label={selectedValue}>
      <MenuItem key={"app"} label={"Main.xmlui"} onClick={() => dispatch(contentChanged("app"))} />

      {appDescription.config?.themes?.length > 0 && (
        <>
          <Text className={styles.sectionTitle} variant="strong">
            Themes
          </Text>
          {appDescription.config?.themes?.map((theme: ThemeDefinition, index: number) => (
            <MenuItem
              key={index}
              label={`${theme.id}.json`}
              onClick={() => dispatch(contentChanged(theme.id))}
            />
          ))}
        </>
      )}

      {appDescription.components?.length > 0 && (
        <>
          <Text className={styles.sectionTitle} variant="strong">
            Components
          </Text>
          {appDescription.components?.map((component: CompoundComponentDef, index: number) => (
            <MenuItem
              key={index}
              label={`${component.name}.xmlui`}
              onClick={() => dispatch(contentChanged(component.name))}
            />
          ))}
        </>
      )}
    </DropdownMenu>
  );
};
