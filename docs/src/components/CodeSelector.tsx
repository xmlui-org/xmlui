import React, { useMemo } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import selectStyles from "./Select.module.scss";
import { usePlayground } from "@/src/hooks/usePlayground";
import { ThemeDefinition } from "@components-core/theming/abstractions";
import type { CompoundComponentDef } from "@abstractions/ComponentDefs";
import { contentChanged } from "@/src/state/store";

export const SelectItem = React.forwardRef(
  ({ children, className, ...props }: any, forwardedRef) => {
    return (
      <RadixSelect.Item className={selectStyles.SelectItem} {...props} ref={forwardedRef}>
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      </RadixSelect.Item>
    );
  },
);

export const CodeSelector = () => {
  const { appDescription, options, dispatch } = usePlayground();

  const selectedValue = useMemo(() => {
    switch (options.content) {
      case "app":
        "Main.xmlui";
        break;
      case "config":
        "config.json";
        break;
      default:
        return `${options.content}.xmlui`;
    }
  }, [options.content]);

  return (
    <RadixSelect.Root
      value={options.content}
      onValueChange={(value) => dispatch(contentChanged(value))}
    >
      <RadixSelect.Trigger className={selectStyles.SelectTrigger} aria-label="component">
        <RadixSelect.Value>{selectedValue}</RadixSelect.Value>
        <RadixSelect.Icon className={selectStyles.SelectIcon}>
          <ChevronDownIcon />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className={selectStyles.SelectContent}
          side="bottom"
          align="start"
          position="popper"
        >
          <RadixSelect.Viewport>
            <RadixSelect.Group>
              <SelectItem value="app" key="app">
                Main.xmlui
              </SelectItem>
              <SelectItem value="config" key="config">
                config.json
              </SelectItem>
            </RadixSelect.Group>
            {appDescription.config?.themes?.length > 0 && (
              <RadixSelect.Group>
                <RadixSelect.Label className={selectStyles.SelectLabel}>Themes</RadixSelect.Label>
                {appDescription.config?.themes?.map((theme: ThemeDefinition, index: number) => (
                  <SelectItem value={theme.name} key={index}>
                    {theme.name}
                  </SelectItem>
                ))}
              </RadixSelect.Group>
            )}
            {appDescription.components?.length > 0 && (
              <RadixSelect.Group>
                <RadixSelect.Label className={selectStyles.SelectLabel}>
                  Components
                </RadixSelect.Label>
                {appDescription.components?.map(
                  (component: CompoundComponentDef, index: number) => (
                    <SelectItem value={component.name} key={index}>
                      {`${component.name}.xmlui`}
                    </SelectItem>
                  ),
                )}
              </RadixSelect.Group>
            )}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};
