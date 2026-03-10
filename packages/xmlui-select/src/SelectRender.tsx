import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { forwardRef } from "react";
import { Select, createListCollection } from "@ark-ui/react/select";
import { Portal } from "@ark-ui/react/portal";
import classnames from "classnames";
import styles from "./Select.module.scss";
import { OptionContext, HiddenOption, OptionTypeProvider, type Option, Icon, useTheme } from "xmlui";

export type SelectItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

function normalizeItems(raw: any): SelectItem[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map((item: any) => {
    if (typeof item === "string") return { value: item, label: item };
    return {
      value: String(item.value ?? item.id ?? item),
      label: String(item.label ?? item.name ?? item.value ?? item),
      disabled: Boolean(item.disabled),
    };
  });
}

/**
 * Pure ark-ui Select assembly.
 *
 * Receives `value` (string[]), `onChange`, and `registerApi` from
 * wrapCompound's StateWrapper. Everything else is native React/ark-ui props.
 * Supports both `items` prop and XMLUI `Option` children.
 */
export const SelectRender = forwardRef(({
  value,
  onChange,
  registerApi,
  className,
  items: rawItems = [],
  placeholder = "Select an option",
  enabled = true,
  multiple = false,
  clearable = false,
  id,
  children,
  ...rest
}: any, ref: any) => {
  const { root } = useTheme();
  // ark-ui Portal expects a RefObject<HTMLElement | null>, not a plain HTMLElement
  const rootRef = useRef<HTMLElement | null>(null);
  rootRef.current = root ?? null;
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Collect options registered by Option children
  const [childrenOptions, setChildrenOptions] = useState<Option[]>([]);

  const onOptionAdd = useCallback((option: Option) => {
    setChildrenOptions((prev) => [...prev, option]);
  }, []);

  const onOptionRemove = useCallback((option: Option) => {
    setChildrenOptions((prev) => prev.filter((o) => o.value !== option.value));
  }, []);

  const optionContextValue = useMemo(
    () => ({ onOptionAdd, onOptionRemove }),
    [onOptionAdd, onOptionRemove],
  );

  // Stabilize items: XMLUI passes a new array reference on every render,
  // so we use JSON.stringify as the memo key to avoid recreating the collection
  // (which would cause ark-ui to fire onValueChange on every render → infinite loop).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const propItems = useMemo(() => normalizeItems(rawItems), [JSON.stringify(rawItems)]);

  // Merge prop items with children options (children options take precedence if same value)
  const items = useMemo(() => {
    if (childrenOptions.length === 0) return propItems;
    const childItems = childrenOptions.map((o) => ({
      value: String(o.value),
      label: String(o.label ?? o.value),
      disabled: o.enabled === false,
    }));
    const childValues = new Set(childItems.map((i) => i.value));
    return [...propItems.filter((i) => !childValues.has(i.value)), ...childItems];
  }, [propItems, childrenOptions]);

  const collection = useMemo(
    () => createListCollection({ items }),
    [items],
  );

  // Ensure value is always string[]
  const selectedValues: string[] = useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String);
    return [String(value)];
  }, [value]);

  // Use refs so registerApi always sees the latest value/multiple without
  // re-registering on every render (which would call setState in XMLUI internals
  // and cause an infinite update loop).
  const selectedValuesRef = useRef(selectedValues);
  selectedValuesRef.current = selectedValues;
  const multipleRef = useRef(multiple);
  multipleRef.current = multiple;

  // Root cause of the infinite loop:
  // registerComponentApi (XMLUI) uses immer's produce to store API objects.
  // Immer compares each key: `draft[uid][key] !== value`. If any API function
  // is a NEW reference (because onChange changed), immer updates the draft →
  // new state object → setComponentApis → XMLUI re-render → new __onDidChange
  // → new onChange → new API functions → immer detects change again → loop.
  //
  // Fix: all API functions must have STABLE references (created once).
  // We achieve this by using onChangeRef (already kept up-to-date above)
  // and keeping registerApi as the only dep — so the effect runs just once.
  useEffect(() => {
    registerApi?.({
      focus: () => triggerRef.current?.focus(),
      setValue: (v: any) => {
        const arr = Array.isArray(v) ? v.map(String) : v != null ? [String(v)] : [];
        onChangeRef.current(arr);
      },
      clear: () => onChangeRef.current([]),
      getValue: () =>
        multipleRef.current
          ? selectedValuesRef.current
          : selectedValuesRef.current[0] ?? undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerApi]);

  // Keep a ref to the latest onChange so handleValueChange never needs to
  // change its own reference. Ark-ui's Select.Root has an internal useEffect
  // that includes onValueChange in its deps — if the callback reference changes
  // on every XMLUI render (new __onDidChange → new onChange → new handler),
  // ark-ui re-fires onValueChange with the current value → onChange →
  // updateState → XMLUI re-render → infinite loop.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Stable reference: created once on mount, never recreated.
  const handleValueChange = useCallback(
    ({ value: newValues }: { value: string[] }) => {
      onChangeRef.current(newValues);
    },
    [], // intentionally empty — ref always holds latest onChange
  );

  return (
    <OptionContext.Provider value={optionContextValue}>
      {children && (
        <div style={{ display: "none" }}>
          <OptionTypeProvider Component={HiddenOption}>{children}</OptionTypeProvider>
        </div>
      )}
    <div
      ref={ref}
      className={classnames(styles.selectContainer, className)}
      {...rest}
    >
      <Select.Root
        collection={collection}
        value={selectedValues}
        onValueChange={handleValueChange}
        disabled={!enabled}
        multiple={multiple}
        positioning={{ sameWidth: true, placement: "bottom-start" }}
      >
        <Select.Control>
          <Select.Trigger
            ref={triggerRef}
            id={id}
            className={styles.trigger}
          >
            <Select.ValueText
              placeholder={placeholder}
              className={styles.valueText}
            />
            {clearable && selectedValues.length > 0 && (
              <Select.ClearTrigger className={styles.clearTrigger}>
                <Icon name="close" />
              </Select.ClearTrigger>
            )}
            <Select.Indicator className={styles.indicator}>
              <Icon name="chevrondown" />
            </Select.Indicator>
          </Select.Trigger>
        </Select.Control>

        <Portal container={rootRef}>
          <Select.Positioner>
            <Select.Content className={styles.content}>
              {collection.items.map((item) => (
                <Select.Item
                  key={item.value}
                  item={item}
                  className={styles.item}
                >
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator className={styles.itemIndicator}>
                    <Icon name="checkmark" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>

        <Select.HiddenSelect />
      </Select.Root>
    </div>
    </OptionContext.Provider>
  );
});

SelectRender.displayName = "SelectRender";

