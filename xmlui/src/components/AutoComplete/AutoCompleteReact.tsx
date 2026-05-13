import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  memo,
  type ReactNode,
  useId,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classnames from "classnames";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import type { Option, ValidationStatus } from "../abstractions";
import styles from "../../components/AutoComplete/AutoComplete.module.scss";
import { ThemedIcon } from "../../components/Icon/Icon";
import OptionTypeProvider from "../../components/Option/OptionTypeProvider";
import { AutoCompleteContext, useAutoComplete } from "./AutoCompleteContext";
import { OptionContext, useOption } from "../Select/OptionContext";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { Popover, PopoverContent, PopoverTrigger, Portal } from "@radix-ui/react-popover";
import { HiddenOption } from "../Select/HiddenOption";
import { PART_INPUT } from "../../components-core/parts";
import { PART_CONCISE_VALIDATION_FEEDBACK, PART_LIST_WRAPPER } from "../../components-core/parts";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { ConciseValidationFeedback } from "../ConciseValidationFeedback/ConciseValidationFeedback";
import { Part } from "../Part/Part";
import { useFormContextPart } from "../Form/FormContext";
import { useFormItemInputId } from "../FormItem/FormItemContext";


type AutoCompleteProps = {
  id?: string;
  initialValue?: string | string[];
  value?: string | string[];
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  optionRenderer?: (item: Option, value: any, inTrigger: boolean) => ReactNode;
  emptyListTemplate?: ReactNode;
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  onDidChange?: (newValue: string | string[]) => void;
  validationStatus?: ValidationStatus;
  onFocus?: (ev: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (ev: React.FocusEvent<HTMLInputElement>) => void;
  onItemCreated?: (item: string) => void;
  registerComponentApi?: RegisterComponentApiFn;
  children?: ReactNode;
  autoFocus?: boolean;
  dropdownHeight?: CSSProperties["height"];
  multi?: boolean;
  required?: boolean;
  readOnly?: boolean;
  creatable?: boolean;
  initiallyOpen?: boolean;
  modal?: boolean;
  verboseValidationFeedback?: boolean;
  validationIconSuccess?: string;
  validationIconError?: string;
  invalidMessages?: string[];
  contentClassName?: string;
  /** Field name on each Option to group by. When set, the dropdown shows a
   *  section header above each group of options sharing the same value of
   *  `option[groupBy]`. Headers are computed from the *visible* (filtered)
   *  options, so searching automatically updates which option carries the
   *  group's header. Matches Select's `groupBy` prop. */
  groupBy?: string;
  /** Renderer for a group's section header. Receives the group name as the
   *  `$group` context var. When omitted, the group key string is rendered as
   *  plain text. */
  groupHeaderRenderer?: (groupName: string) => ReactNode;
  /** Renderer for the "Ungrouped" bucket header (options missing the `groupBy`
   *  field). When omitted, the Ungrouped bucket has no header. */
  ungroupedHeaderRenderer?: () => ReactNode;
};

function isOptionsExist(options: Option[], newOptions: Option[]) {
  return newOptions.some((option) =>
    options.some((o) => o.value === option.value || o.label === option.label),
  );
}

export const defaultProps: Partial<AutoCompleteProps> = {
  enabled: true,
  readOnly: false,
  autoFocus: false,
  multi: false,
  required: false,
  validationStatus: "none",
  creatable: false,
  updateState: noop,
  onDidChange: noop,
  onFocus: noop,
  onBlur: noop,
  onItemCreated: noop,
  initiallyOpen: false,
};

export const AutoComplete = memo(forwardRef(function AutoComplete(
  {
    id: idProp,
    initialValue,
    value,
    enabled = defaultProps.enabled,
    placeholder,
    updateState = defaultProps.updateState,
    validationStatus = defaultProps.validationStatus,
    onDidChange = defaultProps.onDidChange,
    onFocus = defaultProps.onFocus,
    onBlur = defaultProps.onBlur,
    onItemCreated = defaultProps.onItemCreated,
    registerComponentApi,
    emptyListTemplate,
    style,
    className,
    classes,
    children,
    readOnly = defaultProps.readOnly,
    autoFocus = defaultProps.autoFocus,
    dropdownHeight,
    multi = defaultProps.multi,
    required = defaultProps.required,
    creatable = defaultProps.creatable,
    optionRenderer,
    initiallyOpen = defaultProps.initiallyOpen,
    modal,
    verboseValidationFeedback,
    validationIconSuccess,
    validationIconError,
    invalidMessages,
    contentClassName,
    groupBy,
    groupHeaderRenderer,
    ungroupedHeaderRenderer,
    ...rest
  }: AutoCompleteProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const id = useFormItemInputId(idProp);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(initiallyOpen);
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const { root } = useTheme();
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Refs and state for the multi-mode "+N more" truncation. Badge widths
  // depend on labels, so we do a hidden measurement pass and decide how many
  // fit alongside the input. `visibleBadgeCount` starts at Infinity so the
  // initial render shows every badge; the layout effect immediately cuts it
  // down based on real DOM measurements.
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputWrapperRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const [visibleBadgeCount, setVisibleBadgeCount] = useState<number>(Number.POSITIVE_INFINITY);
  // Bumped by ResizeObserver so the measurement effect re-runs on width change.
  const [resizeKey, setResizeKey] = useState(0);

  const contextVerboseValidationFeedback = useFormContextPart((ctx) => ctx?.verboseValidationFeedback);
  const contextValidationIconSuccess = useFormContextPart((ctx) => ctx?.validationIconSuccess);
  const contextValidationIconError = useFormContextPart((ctx) => ctx?.validationIconError);

  const finalVerboseValidationFeedback = verboseValidationFeedback ?? contextVerboseValidationFeedback ?? true;
  const finalValidationIconSuccess = validationIconSuccess ?? contextValidationIconSuccess ?? "checkmark";
  const finalValidationIconError = validationIconError ?? contextValidationIconError ?? "close";

  let validationIcon = null;
  if (!finalVerboseValidationFeedback) {
    if (validationStatus === "valid") {
      validationIcon = finalValidationIconSuccess;
    } else if (validationStatus === "error") {
      validationIcon = finalValidationIconError;
    }
  }

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === "") {
      return options;
    }

    const searchLower = searchTerm.toLowerCase();
    return options.filter((option) => {
      const extendedValue =
        option.value + " " + option.label + " " + (option.keywords || []).join(" ");
      return extendedValue.toLowerCase().includes(searchLower);
    });
  }, [options, searchTerm]);

  // Check if we should show creatable item
  const shouldShowCreatable = useMemo(() => {
    if (!creatable || !searchTerm || searchTerm.trim() === "") return false;

    // Check if the search term already exists as an option
    const searchTermExists = options.some(
      (option) => option.value === searchTerm || option.label === searchTerm,
    );

    if (searchTermExists) return false;

    // Check if it's already selected
    if (Array.isArray(value) && value.includes(searchTerm)) return false;
    if (value === searchTerm) return false;

    // Only show creatable if there are no matching filtered options
    return filteredOptions.length === 0;
  }, [creatable, searchTerm, options, value, filteredOptions]);

  // Set initial state based on the initialValue prop
  useEffect(() => {
    if (initialValue !== undefined) {
      updateState({ value: initialValue || [] }, { initial: true });
    }
  }, [initialValue, updateState]);

  // Observe the size of the reference element
  useEffect(() => {
    const current = referenceElement;
    observer.current?.disconnect();

    if (current) {
      observer.current = new ResizeObserver(() => setWidth(current.clientWidth));
      observer.current.observe(current);
    }

    return () => {
      observer.current?.disconnect();
    };
  }, [referenceElement]);

  const selectedValue = useMemo(() => {
    if (Array.isArray(value)) {
      if (value.length === 0) return [];
      return options.filter((o) => value.includes(`${o.value}`));
    }

    return options.find((o) => `${o.value}` === `${value}`);
  }, [value, options]);

  const toggleOption = useCallback(
    (selectedItem: string) => {
      if (selectedItem === "") return;

      // Check if the option is enabled
      const option = options.find((opt) => opt.value === selectedItem);
      if (option && option.enabled === false) return;

      const newSelectedValue = multi
        ? Array.isArray(value)
          ? value.includes(selectedItem)
            ? value.filter((v) => v !== selectedItem)
            : [...value, selectedItem]
          : [selectedItem]
        : selectedItem === value
          ? null
          : selectedItem;

      updateState({ value: newSelectedValue });
      onDidChange(newSelectedValue);

      if (multi) {
        setInputValue("");
        setSearchTerm("");
        // Keep dropdown open for multi-select
      } else {
        // Close dropdown for single select
        setOpen(false);
        setSearchTerm("");
      }

      // `preventScroll` avoids dragging any ancestor scrollable container —
      // without it, the browser tries to keep the input fully in view after
      // each selection, which scrolls a parent <VStack overflowY="auto"> up
      // by hundreds of pixels in long pages (e.g. Reports filters).
      inputRef.current?.focus({ preventScroll: true });
    },
    [multi, value, updateState, onDidChange, options],
  );

  useEffect(() => {
    if (!Array.isArray(selectedValue)) {
      setInputValue(selectedValue?.label || "");
      setSearchTerm("");
    }
  }, [selectedValue]);

  // --- Multi-mode badge truncation (+N more) ---
  // Selected items as a stable array (or empty when not multi/no value).
  const selectedArray: Option[] = useMemo(
    () => (multi && Array.isArray(selectedValue) ? (selectedValue as Option[]) : []),
    [multi, selectedValue],
  );

  // Measure ghost badges and decide how many fit alongside the input + actions.
  // The ghost wrapper renders every selected badge plus a max-width "+N more"
  // placeholder at `position: absolute; visibility: hidden` so we can read
  // real label widths without disturbing layout. Recomputed on every value
  // change and on container resize.
  useLayoutEffect(() => {
    if (!multi || selectedArray.length === 0) {
      setVisibleBadgeCount(selectedArray.length);
      return;
    }
    const wrapper = wrapperRef.current;
    const inputWrap = inputWrapperRef.current;
    const ghost = ghostRef.current;
    if (!wrapper || !inputWrap || !ghost) return;

    const ghostBadgeEls = Array.from(
      ghost.querySelectorAll<HTMLElement>('[data-ghost="badge"]'),
    );
    const moreEl = ghost.querySelector<HTMLElement>('[data-ghost="more"]');
    const actionsW = actionsRef.current?.getBoundingClientRect().width ?? 0;

    const wrapperW = wrapper.clientWidth;
    // Reserve room for the input and the actions block. The input wrapper
    // is `flex: 1`, so its rendered width grows to swallow whatever space is
    // free — we must reserve only its CSS-enforced `min-width`, otherwise
    // the measurement says "no badge fits" when in fact most do.
    const inputMinW =
      parseFloat(window.getComputedStyle(inputWrap).minWidth) || 100;
    const moreW = moreEl?.getBoundingClientRect().width ?? 0;
    const gap = 4; // matches `.badgeList`/`.ghostMeasurer` gap (0.25rem)

    const reserved = inputMinW + actionsW + gap * 2;
    const availableForBadges = wrapperW - reserved;

    let used = 0;
    let count = 0;
    for (let i = 0; i < ghostBadgeEls.length; i++) {
      const w = ghostBadgeEls[i].getBoundingClientRect().width;
      const remainingAfter = ghostBadgeEls.length - (i + 1);
      // Reserve a "+N more" slot only when at least one badge would overflow.
      const reserveMore = remainingAfter > 0 ? moreW + gap : 0;
      const needed = used + w + (i > 0 ? gap : 0) + reserveMore;
      if (needed <= availableForBadges) {
        used += w + (i > 0 ? gap : 0);
        count = i + 1;
      } else {
        break;
      }
    }
    setVisibleBadgeCount(count);
  }, [selectedArray, multi, resizeKey]);

  // Recompute the truncation when the trigger's width changes.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ro = new ResizeObserver(() => {
      setResizeKey((k) => k + 1);
    });
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  // Clear selected value
  const clearValue = useCallback(() => {
    const newValue = multi ? [] : "";
    setInputValue("");
    updateState({ value: newValue });
    onDidChange(newValue);
  }, [multi, updateState, onDidChange]);

  // Deselect every item the "+N more" chip stands for, in one state update.
  const removeOverflowSelections = useCallback(() => {
    if (selectedArray.length === 0) return;
    const keptValues = selectedArray.slice(0, visibleBadgeCount).map((o) => o.value);
    updateState({ value: keptValues });
    onDidChange(keptValues);
  }, [selectedArray, visibleBadgeCount, updateState, onDidChange]);

  const onOptionAdd = useCallback((option: Option) => {
    setOptions((prev) => [...prev, option]);
  }, []);

  const onOptionRemove = useCallback((option: Option) => {
    setOptions((prev) => prev.filter((opt) => opt.value !== option.value));
  }, []);

  // Combined list of all items (creatable + filtered options)
  const allItems = useMemo(() => {
    const items = [];
    if (shouldShowCreatable) {
      items.push({ type: "creatable", value: searchTerm, label: `Create "${searchTerm}"` });
    }
    filteredOptions.forEach((option) => {
      items.push({ type: "option", ...option });
    });
    return items;
  }, [shouldShowCreatable, searchTerm, filteredOptions]);

  // Helper functions to find next/previous enabled option
  const findNextEnabledIndex = useCallback(
    (currentIndex: number) => {
      for (let i = currentIndex + 1; i < allItems.length; i++) {
        const item = allItems[i];
        if (item.type === "creatable" || item.enabled !== false) {
          return i;
        }
      }
      // Wrap around to beginning
      for (let i = 0; i <= currentIndex; i++) {
        const item = allItems[i];
        if (item.type === "creatable" || item.enabled !== false) {
          return i;
        }
      }
      return -1;
    },
    [allItems],
  );

  const findPreviousEnabledIndex = useCallback(
    (currentIndex: number) => {
      for (let i = currentIndex - 1; i >= 0; i--) {
        const item = allItems[i];
        if (item.type === "creatable" || item.enabled !== false) {
          return i;
        }
      }
      // Wrap around to end
      for (let i = allItems.length - 1; i >= currentIndex; i--) {
        const item = allItems[i];
        if (item.type === "creatable" || item.enabled !== false) {
          return i;
        }
      }
      return -1;
    },
    [allItems],
  );

  // Reset selected index when options change, but select matching option when dropdown opens
  useEffect(() => {
    if (!open) {
      setSelectedIndex(-1);
    } else if (!multi && open && inputValue) {
      // For single-select, when dropdown opens and there's an input value, try to find and select the matching option
      const matchingIndex = allItems.findIndex((item) => {
        if (item.type === "creatable") return false;
        return (
          item.label?.toLowerCase() === inputValue.toLowerCase() ||
          item.value?.toLowerCase() === inputValue.toLowerCase()
        );
      });
      if (matchingIndex !== -1) {
        setSelectedIndex(matchingIndex);
      } else {
        setSelectedIndex(-1);
      }
    } else if (!multi && open && !inputValue) {
      setSelectedIndex(-1);
    }
    // For multi-select, don't reset selectedIndex when dropdown is open - preserve keyboard navigation
  }, [allItems, multi, open, inputValue]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) => {
            const nextIndex = findNextEnabledIndex(prev);
            return nextIndex !== -1 ? nextIndex : prev;
          });
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => {
            const prevIndex = findPreviousEnabledIndex(prev);
            return prevIndex !== -1 ? prevIndex : prev;
          });
          break;
        case "Enter":
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < allItems.length) {
            const selectedItem = allItems[selectedIndex];
            if (selectedItem.type === "creatable") {
              const newOption = { value: searchTerm, label: searchTerm, enabled: true };
              onOptionAdd(newOption);
              onItemCreated(searchTerm);
              toggleOption(searchTerm);
            } else if (selectedItem.enabled !== false) {
              // Only toggle if the option is enabled
              toggleOption(selectedItem.value);
            }
          } else if (allItems.length === 1) {
            // If there's only one item (creatable or regular) and no selection, select it
            const singleItem = allItems[0];
            if (singleItem.type === "creatable") {
              const newOption = { value: searchTerm, label: searchTerm, enabled: true };
              onOptionAdd(newOption);
              onItemCreated(searchTerm);
              toggleOption(searchTerm);
            } else if (singleItem.enabled !== false) {
              // Only toggle if the option is enabled
              toggleOption(singleItem.value);
            }
          }
          break;
        case "Escape":
          event.preventDefault();
          setOpen(false);
          break;
      }
    },
    [
      open,
      selectedIndex,
      allItems,
      searchTerm,
      onOptionAdd,
      onItemCreated,
      toggleOption,
      setOpen,
      findNextEnabledIndex,
      findPreviousEnabledIndex,
    ],
  );

  // Render the "empty list" message
  const emptyListNode = useMemo(
    () =>
      emptyListTemplate ?? (
        <div className={styles.autoCompleteEmpty}>
          <ThemedIcon name="noresult" />
          <span>List is empty</span>
        </div>
      ),
    [emptyListTemplate],
  );

  // Register component API for external interactions
  const focus = useCallback(() => {
    inputRef?.current?.focus({ preventScroll: true });
  }, [inputRef]);

  const setValue = useEvent((newValue: string | string[]) => {
    updateState({ value: newValue });
  });

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue,
    });
  }, [focus, registerComponentApi, setValue]);

  const optionContextValue = useMemo(
    () => ({
      onOptionAdd,
      onOptionRemove,
    }),
    [onOptionAdd, onOptionRemove],
  );

  const autoCompleteContextValue = useMemo(() => {
    return {
      multi,
      value,
      onChange: toggleOption,
      options,
      inputValue,
      searchTerm,
      open,
      setOpen,
      setSelectedIndex,
      selectedIndex,
      allItems,
      readOnly,
      optionRenderer,
      groupBy,
      groupHeaderRenderer,
      ungroupedHeaderRenderer,
    };
  }, [
    inputValue,
    searchTerm,
    multi,
    options,
    toggleOption,
    value,
    open,
    setOpen,
    setSelectedIndex,
    selectedIndex,
    allItems,
    readOnly,
    optionRenderer,
    groupBy,
    groupHeaderRenderer,
    ungroupedHeaderRenderer,
  ]);

  return (
    <AutoCompleteContext.Provider value={autoCompleteContextValue}>
      <OptionContext.Provider value={optionContextValue}>
        <Popover
          open={open}
          onOpenChange={(isOpen) => {
            if (readOnly || !enabled) return;
            setOpen(isOpen);
            if (!isOpen) {
              // Reset highlighted option when dropdown closes
              setSelectedIndex(-1);
            }
          }}
          modal={modal}
        >
          <Part partId={PART_LIST_WRAPPER}>
            <PopoverTrigger asChild ref={setReferenceElement}>
              <div
                ref={(el) => {
                  wrapperRef.current = el;
                  if (typeof forwardedRef === "function") forwardedRef(el);
                  else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                }}
                style={style}
                className={classnames(
                  classes?.[COMPONENT_PART_KEY],
                  className,
                  styles.badgeListWrapper,
                  styles[validationStatus],
                  {
                    [styles.disabled]: !enabled,
                    [styles.focused]: isFocused,
                  },
                )}
                aria-expanded={open}
                onClick={(event) => {
                  if (readOnly || !enabled) return;
                  // In multi mode, only open the dropdown, don't toggle
                  // In single mode, toggle as usual
                  if (multi && open) {
                    return; // Already open, don't close
                  }
                  event.stopPropagation();
                  setOpen((prev) => !prev);
                }}
              >
                {selectedArray.length > 0 && (
                  <div className={styles.badgeList}>
                    {selectedArray
                      .slice(0, Number.isFinite(visibleBadgeCount) ? visibleBadgeCount : selectedArray.length)
                      .map((v, index) => (
                        <span key={index} className={styles.badge}>
                          {v?.label}
                          {!readOnly && (
                            <span
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleOption(v.value);
                              }}
                            >
                              <ThemedIcon name="close" size="sm" />
                            </span>
                          )}
                        </span>
                      ))}
                    {Number.isFinite(visibleBadgeCount) &&
                      selectedArray.length > visibleBadgeCount && (
                        <span
                          className={styles.badge}
                          role="button"
                          aria-label={`${selectedArray.length - visibleBadgeCount} more selected, click to open`}
                          onClick={(event) => {
                            // Open the dropdown so the user can see the full
                            // selection — multi mode keeps it open afterwards.
                            event.stopPropagation();
                            setOpen(true);
                          }}
                        >
                          {`+${selectedArray.length - visibleBadgeCount} more`}
                          {!readOnly && (
                            <span
                              onClick={(event) => {
                                event.stopPropagation();
                                removeOverflowSelections();
                              }}
                            >
                              <ThemedIcon name="close" size="sm" />
                            </span>
                          )}
                        </span>
                      )}
                  </div>
                )}
                {/* Ghost measurer — invisible, off-screen list used to read real
                    label widths so we can decide how many badges fit before
                    swapping the overflow into a "+N more" chip. */}
                {multi && selectedArray.length > 0 && (
                  <div ref={ghostRef} className={styles.ghostMeasurer} aria-hidden="true">
                    {selectedArray.map((v, index) => (
                      <span key={`g-${index}`} data-ghost="badge" className={styles.badge}>
                        {v?.label}
                        {!readOnly && (
                          <span>
                            <ThemedIcon name="close" size="sm" />
                          </span>
                        )}
                      </span>
                    ))}
                    {/* Worst-case "+N more" placeholder — three-digit count
                        gives an upper bound for the reserved slot. */}
                    <span data-ghost="more" className={styles.badge}>
                      {`+${selectedArray.length} more`}
                      {!readOnly && (
                        <span>
                          <ThemedIcon name="close" size="sm" />
                        </span>
                      )}
                    </span>
                  </div>
                )}
                <div ref={inputWrapperRef} className={styles.inputWrapper}>
                  <Part partId={PART_INPUT}>
                    <input
                      {...rest}
                      role="combobox"
                      id={id}
                      ref={inputRef}
                      onFocus={(ev) => {
                        setIsFocused(true);
                        onFocus(ev);
                      }}
                      onBlur={(ev) => {
                        if (inputValue === "" && !multi) {
                          clearValue();
                        } else {
                          if (!Array.isArray(selectedValue) && selectedValue) {
                            setInputValue(selectedValue?.label);
                          } else {
                            setInputValue("");
                          }
                        }
                        onBlur(ev);
                        setIsFocused(false);
                      }}
                      onKeyDown={(event) => {
                        if (readOnly) return;

                        // Handle opening dropdown
                        if (event.key === "ArrowDown" && !open) {
                          setOpen(true);
                          return;
                        }

                        // Handle keyboard navigation when dropdown is open
                        if (open) {
                          handleKeyDown(event);
                        } else if (event.key === "Enter") {
                          setOpen(true);
                        }
                      }}
                      readOnly={readOnly}
                      autoFocus={autoFocus}
                      aria-autocomplete="list"
                      value={inputValue}
                      disabled={!enabled}
                      onChange={(event) => {
                        setOpen(true);
                        setInputValue(event.target.value);
                        setSearchTerm(event.target.value);
                      }}
                      placeholder={!readOnly ? placeholder : ""}
                      className={styles.commandInput}
                    />
                  </Part>
                  <div ref={actionsRef} className={styles.actions}>
                    {!finalVerboseValidationFeedback && (
                      <Part partId={PART_CONCISE_VALIDATION_FEEDBACK}>
                        <ConciseValidationFeedback
                          validationStatus={validationStatus}
                          invalidMessages={invalidMessages}
                          successIcon={finalValidationIconSuccess}
                          errorIcon={finalValidationIconError}
                        />
                      </Part>
                    )}
                    {value?.length > 0 && enabled && !readOnly && (
                      <span
                        className={styles.action}
                        onClick={(event) => {
                          event.stopPropagation();
                          clearValue();
                        }}
                      >
                        <ThemedIcon name="close" />
                      </span>
                    )}
                    <span
                      className={classnames(styles.action, { [styles.disabled]: !enabled || readOnly })}
                      aria-disabled={!enabled || readOnly}
                      onClick={() => {
                        if (readOnly || !enabled) return;
                        setOpen(!open);
                        // Focus the input after opening dropdown
                        inputRef.current?.focus({ preventScroll: true });
                      }}
                    >
                      <ThemedIcon name="chevrondown" />
                    </span>
                  </div>
                </div>
              </div>
            </PopoverTrigger>
          </Part>
          <Portal container={root}>
            <PopoverContent
              style={{ width, height: dropdownHeight }}
              className={classnames(contentClassName, styles.popoverContent)}
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div role="listbox" className={styles.commandList} style={{ height: dropdownHeight }}>
                {/* Always render through OptionTypeProvider so user-provided
                    Option children (custom templates) are preserved when
                    filtering. AutoCompleteOption hides itself if its value is
                    not in `allItems` (i.e. filtered out by searchTerm). The
                    creatable item and empty-list message are rendered as
                    siblings. */}
                {shouldShowCreatable && (
                  <CreatableItem
                    onNewItem={onItemCreated}
                    isHighlighted={selectedIndex === 0}
                  />
                )}
                <OptionTypeProvider Component={AutoCompleteOption}>{children}</OptionTypeProvider>
                {filteredOptions.length === 0 && !shouldShowCreatable && (
                  <div>{emptyListNode}</div>
                )}
              </div>
            </PopoverContent>
          </Portal>
        </Popover>
        <div style={{ display: "none"}}>
          <OptionTypeProvider Component={HiddenOption}>{children}</OptionTypeProvider>
        </div>
      </OptionContext.Provider>
    </AutoCompleteContext.Provider>
  );
}));

type CreatableItemProps = {
  onNewItem: (item: string) => void;
  isHighlighted?: boolean;
};

function CreatableItem({ onNewItem, isHighlighted = false }: CreatableItemProps) {
  const { value, options, searchTerm, onChange, setOpen, setSelectedIndex, multi } =
    useAutoComplete();
  const { onOptionAdd } = useOption();
  if (
    isOptionsExist(options, [{ value: searchTerm, label: searchTerm }]) ||
    (Array.isArray(value) && value?.find((s) => s === searchTerm)) ||
    searchTerm === value
  ) {
    return <span style={{ display: "none" }} />;
  }

  const handleClick = () => {
    const newOption = { value: searchTerm, label: searchTerm, enabled: true };
    onOptionAdd(newOption);
    onNewItem?.(searchTerm);
    onChange(searchTerm);
    // Only close dropdown for single select mode
    if (!multi) {
      setOpen(false);
    }
  };

  const Item = (
    <div
      className={classnames(styles.autoCompleteOption, {
        [styles.highlighted]: isHighlighted,
      })}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseEnter={() => {
        if (setSelectedIndex) {
          setSelectedIndex(0); // CreatableItem is always at index 0
        }
      }}
      onClick={handleClick}
      role="option"
      aria-selected={false}
    >
      {`Create "${searchTerm}"`}
    </div>
  );

  // For normal creatable
  if (searchTerm.length > 0) {
    return Item;
  }

  return <span style={{ display: "none" }} />;
}

function AutoCompleteOption(option: Option & { isHighlighted?: boolean; itemIndex?: number }) {
  const {
    value,
    label,
    enabled = true,
    readOnly,
    children,
    isHighlighted: explicitHighlighted,
    itemIndex: explicitItemIndex,
  } = option;
  const id = useId();
  const {
    value: selectedValue,
    onChange,
    multi,
    setOpen,
    setSelectedIndex,
    selectedIndex,
    allItems,
    optionRenderer,
    groupBy,
    groupHeaderRenderer,
    ungroupedHeaderRenderer,
  } = useAutoComplete();
  const selected = multi ? selectedValue?.includes(value) : selectedValue === value;

  // AutoCompleteOption is always rendered through OptionTypeProvider so the
  // user's custom Option children (templates) are preserved even when a
  // search term is active. We derive `itemIndex`/`isHighlighted` from the
  // shared context `allItems`/`selectedIndex` when explicit props weren't
  // passed (legacy callers can still override). If our value isn't in
  // `allItems`, the searchTerm filtered us out — render nothing.
  const itemIndex =
    explicitItemIndex !== undefined
      ? explicitItemIndex
      : allItems.findIndex((i) => i.type === "option" && i.value === value);
  if (explicitItemIndex === undefined && itemIndex === -1) {
    return null;
  }
  const isHighlighted =
    explicitHighlighted !== undefined
      ? explicitHighlighted
      : itemIndex !== -1 && selectedIndex === itemIndex;

  // Decide whether to render a section header above this option. When `groupBy`
  // is set on the parent AutoComplete, each option is grouped by the value of
  // `option[groupBy]`. This option is the first visible member of its group iff
  // the previous visible option in `allItems` either doesn't exist or sits in a
  // different group. `allItems` is computed against the *current* filtered list,
  // so searching automatically shifts the header to whichever option becomes
  // first in its group. Missing group field values fall back to the "Ungrouped"
  // bucket, matching Select's behavior.
  let showGroupHeader = false;
  let groupHeaderContent: ReactNode = null;
  if (groupBy && itemIndex !== -1) {
    const groupKey = (option as any)[groupBy] ?? "Ungrouped";
    const prev = itemIndex > 0 ? allItems[itemIndex - 1] : null;
    const prevGroupKey =
      prev && prev.type === "option" ? (prev as any)[groupBy] ?? "Ungrouped" : null;
    if (prevGroupKey !== groupKey) {
      if (groupKey === "Ungrouped") {
        if (ungroupedHeaderRenderer) {
          showGroupHeader = true;
          groupHeaderContent = ungroupedHeaderRenderer();
        }
      } else {
        showGroupHeader = true;
        groupHeaderContent = groupHeaderRenderer
          ? groupHeaderRenderer(String(groupKey))
          : String(groupKey);
      }
    }
  }

  const handleClick = () => {
    if (!readOnly && enabled) {
      onChange(value);
      // Only close dropdown for single select mode
      if (!multi) {
        setOpen(false);
      }
    }
  };

  return (
    <>
      {showGroupHeader && (
        <div role="presentation" className={styles.groupHeader}>
          {groupHeaderContent}
        </div>
      )}
      <div
        id={id}
        role="option"
        aria-disabled={!enabled}
        aria-selected={selected}
        className={classnames(styles.autoCompleteOption, {
          [styles.disabledOption]: !enabled,
          [styles.highlighted]: isHighlighted,
        })}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseEnter={() => {
          if (itemIndex !== undefined && itemIndex !== -1 && setSelectedIndex && enabled) {
            setSelectedIndex(itemIndex);
          }
        }}
        onClick={handleClick}
      >
        {children ? (
          <>
            <div className={styles.autoCompleteOptionContent}>{children}</div>
            {selected && <ThemedIcon name="checkmark" />}
          </>
        ) : optionRenderer ? (
          optionRenderer({ label, value, enabled }, selectedValue as any, false)
        ) : (
          <>
            <div className={styles.autoCompleteOptionContent}>{label}</div>
            {selected && <ThemedIcon name="checkmark" />}
          </>
        )}
      </div>
    </>
  );
}
