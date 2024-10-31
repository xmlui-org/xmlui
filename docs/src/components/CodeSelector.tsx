import React, { useMemo } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import selectStyles from "./Select.module.scss";
import { usePlayground } from "@/src/hooks/usePlayground";
import { ThemeDefinition } from "@components-core/theming/abstractions";
import type { CompoundComponentDef } from "@abstractions/ComponentDefs";
import { contentChanged } from "@/src/state/store";
import {HiChevronDown, HiChevronUp} from "react-icons/hi";

export const SelectItem = React.forwardRef(
  ({ children, className, ...props }: any, forwardedRef) => {
    return (
      <RadixSelect.Item className={selectStyles.RadixMenuItem} {...props} ref={forwardedRef}>
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      </RadixSelect.Item>
    );
  },
);

export const CodeSelector = () => {
  const { appDescription, options, dispatch } = usePlayground();
  const [open, setOpen] = React.useState(false);
  const selectedValue = useMemo(() => {
    let content = "";
    switch (options.content) {
      case "app":
        content = "Main.xmlui";
        break;
      case "config":
        content = "config.json";
        break;
      default:
        content = `${options.content}.xmlui`;
    }
    return content;
  }, [options.content]);

  return (
    <RadixSelect.Root
      open={open}
      onOpenChange={(open) => setOpen(open)}
      value={options.content}
      onValueChange={(value) => dispatch(contentChanged(value))}
    >
      <RadixSelect.Trigger className={selectStyles.SelectTrigger} aria-label="component">
        <RadixSelect.Value>{selectedValue}</RadixSelect.Value>
        <RadixSelect.Icon className={selectStyles.SelectIcon}>
          {open ? <HiChevronUp /> : <HiChevronDown />}
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className={selectStyles.RadixMenuContent}
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
