import type React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger, Portal } from "@radix-ui/react-popover";
import type { RegisterComponentApiFn } from "xmlui";

type UpdateStateFn = (componentState: any, options?: any) => void;
import { Icon } from "xmlui";
import styles from "./TableSelect.module.scss";

/**
 * Render the portal INSIDE the nearest Radix dialog so that the dialog's
 * FocusScope allows focus into the search input.
 */
function findPortalContainer(from: HTMLElement | null): HTMLElement {
  const dialog = from?.closest('[role="dialog"]') as HTMLElement | null;
  return dialog ?? document.body;
}

export type ColumnDef = {
  key: string;
  label: string;
};

type Props = {
  id?: string;
  className?: string;
  data?: Record<string, unknown>[];
  columns?: ColumnDef[];
  valueKey?: string;
  labelKey?: string;
  placeholder?: string;
  initialValue?: string;
  value?: unknown;
  onChange?: (value: string) => void;
  updateState?: UpdateStateFn;
  registerComponentApi?: RegisterComponentApiFn;
};

export const defaultProps = {
  placeholder: "Select...",
};

function resolveColumns(data: Record<string, unknown>[], columns?: ColumnDef[]): ColumnDef[] {
  if (columns && columns.length > 0) return columns;
  if (!data || data.length === 0) return [];
  return Object.keys(data[0]).map((key) => ({ key, label: key }));
}

export function TableSelect({
  id,
  className,
  data = [],
  columns,
  valueKey,
  labelKey,
  placeholder = defaultProps.placeholder,
  initialValue,
  value: controlledValue,
  onChange,
  updateState,
  registerComponentApi,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [internalValue, setInternalValue] = useState<string>(initialValue ?? "");
  // The controlled value may be any type (e.g. number from form state), so always stringify
  const toStr = (v: unknown) => (v != null && v !== "" ? String(v) : undefined);
  const effectiveValue = toStr(controlledValue) ?? internalValue;
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [isInDialog, setIsInDialog] = useState(false);

  useEffect(() => {
    const container = findPortalContainer(triggerRef.current);
    setPortalContainer(container);
    setIsInDialog(container !== document.body);
  }, []);

  // When inside a dialog, intercept outside pointer events in the capture phase so
  // the first click closes only the dropdown (not the parent modal).
  // Radix Dialog's DismissableLayer listens in the bubble phase; by stopping
  // propagation here it never sees the event.
  useEffect(() => {
    if (!isOpen || !isInDialog) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      const inDropdown = dropdownRef.current?.contains(target);
      const inTrigger = triggerRef.current?.contains(target);
      const inLabel = id
        ? (target as Element).closest?.(`label[for="${id}"]`) !== null
        : false;
      if (!inDropdown && !inTrigger && !inLabel) {
        event.stopPropagation();
        setIsOpen(false);
        setSelectedIndex(-1);
        // Return focus to trigger so the dialog doesn't lose focus context
        setTimeout(() => triggerRef.current?.focus(), 0);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [isOpen, isInDialog, id]);

  // Expose value/setValue API for XMLUI form binding (bindTo support)
  useEffect(() => {
    registerComponentApi?.({
      value: effectiveValue,
      setValue: (newVal: unknown) => {
        const v = newVal != null ? String(newVal) : "";
        setInternalValue(v);
        updateState?.({ value: v });
      },
    });
  }, [registerComponentApi, effectiveValue, updateState]);

  const resolvedColumns = useMemo(() => resolveColumns(data, columns), [data, columns]);

  const filteredData = useMemo(() => {
    if (!filterText.trim()) return data;
    const lower = filterText.toLowerCase();
    return data.filter((row) =>
      resolvedColumns.some((col) => {
        const cell = row[col.key];
        return cell != null && String(cell).toLowerCase().includes(lower);
      }),
    );
  }, [data, resolvedColumns, filterText]);

  // Resolve what to display in the trigger button.
  const displayLabel = useMemo(() => {
    if (!effectiveValue) return null;
    if (!valueKey || resolvedColumns.length === 0) return effectiveValue;
    const matchingRow = data.find((row) => String(row[valueKey] ?? "") === effectiveValue);
    if (!matchingRow) return effectiveValue;
    const displayKey = labelKey ?? resolvedColumns[0].key;
    return String(matchingRow[displayKey] ?? "");
  }, [effectiveValue, valueKey, labelKey, data, resolvedColumns]);

  // Reset highlight when filter changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [filterText]);

  // Scroll highlighted row into view
  useEffect(() => {
    if (selectedIndex >= 0 && rowRefs.current[selectedIndex]) {
      rowRefs.current[selectedIndex]!.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open) {
      setFilterText("");
      setSelectedIndex(-1);
    } else {
      setSelectedIndex(-1);
    }
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
    setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  const selectRow = useCallback(
    (row: Record<string, unknown>) => {
      const effectiveKey =
        valueKey ?? (resolvedColumns.length > 0 ? resolvedColumns[0].key : null);
      if (!effectiveKey) return;
      const rawValue = row[effectiveKey];
      const newValue = rawValue != null ? String(rawValue) : "";
      setInternalValue(newValue);
      updateState?.({ value: rawValue ?? "" });
      setFilterText("");
      onChange?.(newValue);
      closeDropdown();
    },
    [valueKey, resolvedColumns, onChange, updateState, closeDropdown],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          closeDropdown();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1 < filteredData.length ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < filteredData.length) {
            selectRow(filteredData[selectedIndex]);
          }
          break;
      }
    },
    [filteredData, selectedIndex, selectRow, closeDropdown],
  );

  const effectiveValueKey =
    valueKey ?? (resolvedColumns.length > 0 ? resolvedColumns[0].key : null);

  return (
    <div className={`${styles.wrapper} ${className ?? ""}`}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            id={id}
            type="button"
            className={`${styles.trigger}${isOpen ? ` ${styles.open}` : ""}`}
            onKeyDown={(e) => {
              if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                setIsOpen(true);
                setSelectedIndex(e.key === "ArrowUp" ? filteredData.length - 1 : 0);
              } else if (isOpen) {
                handleKeyDown(e);
              }
            }}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className={`${styles.triggerText}${!displayLabel ? ` ${styles.placeholder}` : ""}`}>
              {displayLabel ?? placeholder}
            </span>
            <Icon name="chevrondown" className={`${styles.chevron}${isOpen ? ` ${styles.rotated}` : ""}`} />
          </button>
        </PopoverTrigger>
        <Portal container={portalContainer}>
          <PopoverContent
            ref={dropdownRef}
            className={styles.dropdown}
            style={{ width: "var(--radix-popover-trigger-width)" }}
            sideOffset={4}
            align="start"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              searchInputRef.current?.focus();
            }}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              triggerRef.current?.focus();
            }}
            onInteractOutside={(e) => {
              // When the associated label is clicked while the dropdown is open, the browser
              // simulates a click on the trigger button (closing it via onOpenChange). If we
              // let Radix also close it here the two events cancel out and the dropdown
              // stays open. Suppress the outside-interaction so only the button click fires.
              const target = e.target as Element;
              const isLabel = id ? target.closest?.(`label[for="${id}"]`) !== null : false;
              if (isLabel) e.preventDefault();
            }}
            onKeyDown={handleKeyDown}
            role="listbox"
          >
            <div className={styles.searchWrapper}>
              <Icon name="search" className={styles.searchIcon} />
              <input
                ref={searchInputRef}
                type="text"
                className={styles.searchInput}
                placeholder="Type to search..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                {resolvedColumns.length > 0 && (
                  <thead className={styles.tableHead}>
                    <tr>
                      {resolvedColumns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className={styles.tableBody}>
                  {filteredData.length === 0 ? (
                    <tr className={styles.emptyRow}>
                      <td colSpan={Math.max(resolvedColumns.length, 1)}>No results found</td>
                    </tr>
                  ) : (
                    filteredData.map((row, rowIndex) => {
                      const rowValue = effectiveValueKey
                        ? String(row[effectiveValueKey] ?? "")
                        : "";
                      const isSelected = rowValue === effectiveValue;
                      const isHighlighted = rowIndex === selectedIndex;
                      return (
                        <tr
                          key={rowIndex}
                          ref={(el) => { rowRefs.current[rowIndex] = el; }}
                          className={
                            isHighlighted
                              ? `${styles.highlighted}${isSelected ? ` ${styles.selected}` : ""}`
                              : isSelected
                                ? styles.selected
                                : undefined
                          }
                          onClick={() => selectRow(row)}
                          role="option"
                          aria-selected={isSelected}
                        >
                          {resolvedColumns.map((col) => (
                            <td key={col.key}>
                              {row[col.key] != null ? String(row[col.key]) : ""}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </PopoverContent>
        </Portal>
      </Popover>
    </div>
  );
}
