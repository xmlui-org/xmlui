import type React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger, Portal } from "@radix-ui/react-popover";
import type { RegisterComponentApiFn } from "xmlui";

/**
 * Render the portal INSIDE the nearest Radix dialog so that the dialog's
 * FocusScope allows focus into the search input.
 * modal={true} on Popover then ensures its DismissableLayer (higher index)
 * fires before the Dialog's, so the first outside-click closes only the
 * dropdown and not the modal.
 */
function findPortalContainer(from: HTMLElement | null): HTMLElement {
  const dialog = from?.closest('[role="dialog"]') as HTMLElement | null;
  return dialog ?? document.body;
}

type UpdateStateFn = (componentState: any, options?: any) => void;
import { Icon } from "xmlui";
import styles from "./TableSelect.module.scss";

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [isInDialog, setIsInDialog] = useState(false);
  useEffect(() => {
    const container = findPortalContainer(triggerRef.current);
    setPortalContainer(container);
    setIsInDialog(container !== document.body);
  }, []);

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
      const newValue = row[effectiveKey] != null ? String(row[effectiveKey]) : "";
      setInternalValue(newValue);
      updateState?.({ value: newValue });
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
      <Popover open={isOpen} onOpenChange={handleOpenChange} modal={isInDialog}>
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
          className={styles.dropdown}
          style={{ minWidth: "var(--radix-popover-trigger-width)" }}
          sideOffset={4}
          align="start"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            searchInputRef.current?.focus();
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
          onCloseAutoFocus={(e) => {
            // Let Radix return focus to the trigger for all close events
            // (Escape, row selection, outside click) — same as Select behaviour.
            e.preventDefault();
            triggerRef.current?.focus();
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
