import { forwardRef, useMemo, useState } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import selectStyles from "./Select.module.scss";
import { usePlayground } from "../hooks/usePlayground";
import { contentChanged } from "../state/store";
import { useTheme, Button, type CompoundComponentDef, Icon, type ThemeDefinition } from "xmlui";

export const SelectItem = forwardRef(({ children, className, ...props }: any, forwardedRef) => {
  return (
    <RadixSelect.Item className={selectStyles.RadixMenuItem} {...props} ref={forwardedRef}>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
});

SelectItem.displayName = "SelectItem";

export const CodeSelector = () => {
  const { appDescription, options, dispatch } = usePlayground();
  const [open, setOpen] = useState(false);
  const { root } = useTheme();

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
  }, [options.content]);

  return (
    <RadixSelect.Root
      open={open}
      onOpenChange={(open) => setOpen(open)}
      value={options.content}
      onValueChange={(value) => dispatch(contentChanged(value))}
    >
      <RadixSelect.Trigger aria-label="component">
        <Button themeColor="primary" variant="ghost">
          <RadixSelect.Value>{selectedValue}</RadixSelect.Value>
          <RadixSelect.Icon className={selectStyles.SelectIcon}>
            {open ? <Icon name="chevronup" /> : <Icon name="chevrondown" />}
          </RadixSelect.Icon>
        </Button>
      </RadixSelect.Trigger>
      <RadixSelect.Portal container={root}>
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
            </RadixSelect.Group>
            {appDescription.config?.themes?.length > 0 && (
              <RadixSelect.Group>
                <RadixSelect.Label className={selectStyles.SelectLabel}>Themes</RadixSelect.Label>
                {appDescription.config?.themes?.map((theme: ThemeDefinition, index: number) => (
                  <SelectItem value={theme.id} key={index}>
                    {`${theme.id}.json`}
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
