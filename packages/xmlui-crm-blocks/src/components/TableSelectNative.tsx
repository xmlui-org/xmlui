import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import type { RegisterComponentApiFn } from "xmlui";
import styles from "./TableSelect.module.scss";

/**
 * Find the nearest focus-trapping container (Radix dialog, or body).
 * Rendering the portal INSIDE the dialog's DOM subtree satisfies Radix UI's
 * focus trap so the search input can receive keyboard events normally.
 */
function findPortalContainer(from: HTMLElement | null): HTMLElement {
  // Walk up to the nearest dialog element (Radix renders [role="dialog"])
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
  placeholder?: string;
  initialValue?: string;
  onChange?: (value: string) => void;
  registerComponentApi?: RegisterComponentApiFn;
};

export const defaultProps = {
  placeholder: "Select...",
};

type DropdownRect = {
  top: number;
  left: number;
  width: number;
};

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M13.5 13.5L17 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
  placeholder = defaultProps.placeholder,
  initialValue,
  onChange,
  registerComponentApi,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [internalValue, setInternalValue] = useState<string>(initialValue ?? "");
  const [dropdownRect, setDropdownRect] = useState<DropdownRect | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Resolve portal container once after mount.
  // Rendering inside the dialog's DOM subtree keeps Radix UI's focus trap happy,
  // while position:fixed + high z-index ensures correct visual placement.
  useEffect(() => {
    setPortalContainer(findPortalContainer(triggerRef.current));
  }, []);

  // Expose value/setValue API for XMLUI form binding (bindTo support)
  useEffect(() => {
    registerComponentApi?.({
      value: internalValue,
      setValue: (newVal: unknown) => {
        setInternalValue(newVal != null ? String(newVal) : "");
      },
    });
  }, [registerComponentApi, internalValue]);

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
    if (!internalValue) return null;
    if (!valueKey || resolvedColumns.length === 0) return internalValue;
    const matchingRow = data.find((row) => String(row[valueKey] ?? "") === internalValue);
    if (!matchingRow) return internalValue;
    return String(matchingRow[resolvedColumns[0].key] ?? "");
  }, [internalValue, valueKey, data, resolvedColumns]);

  // Calculate portal dropdown position from the trigger's bounding rect.
  //
  // The dialog's .content element has `transform: translate(0)` which creates a
  // new fixed-positioning containing block. This means `position: fixed` inside the
  // dialog portal is relative to the dialog's own top-left corner, not the viewport.
  // We compensate by subtracting the container's offset so the dropdown lines up
  // correctly in the viewport regardless of where the dialog is positioned.
  const updateDropdownRect = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();

    let offsetTop = 0;
    let offsetLeft = 0;
    if (portalContainer && portalContainer !== document.body) {
      const containerRect = portalContainer.getBoundingClientRect();
      offsetTop = containerRect.top;
      offsetLeft = containerRect.left;
    }

    setDropdownRect({
      top: triggerRect.bottom - offsetTop,
      left: triggerRect.left - offsetLeft,
      width: triggerRect.width,
    });
  }, [portalContainer]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        setFilterText("");
        updateDropdownRect();
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      return !prev;
    });
  }, [updateDropdownRect]);

  // Keep dropdown aligned with trigger when user scrolls or resizes
  useEffect(() => {
    if (!isOpen) return;
    const onScroll = () => updateDropdownRect();
    const onResize = () => updateDropdownRect();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen, updateDropdownRect]);

  // Close when clicking outside both the trigger and the portal dropdown
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const inTrigger = triggerRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inTrigger && !inDropdown) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleRowClick = useCallback(
    (row: Record<string, unknown>) => {
      const effectiveKey =
        valueKey ?? (resolvedColumns.length > 0 ? resolvedColumns[0].key : null);
      if (!effectiveKey) return;
      const newValue = row[effectiveKey] != null ? String(row[effectiveKey]) : "";
      setInternalValue(newValue);
      setIsOpen(false);
      setFilterText("");
      onChange?.(newValue);
    },
    [valueKey, resolvedColumns, onChange],
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
  }, []);

  const effectiveValueKey =
    valueKey ?? (resolvedColumns.length > 0 ? resolvedColumns[0].key : null);

  const dropdown = isOpen && dropdownRect ? (
    <div
      ref={dropdownRef}
      className={styles.dropdown}
      role="listbox"
      style={{
        position: "fixed",
        top: dropdownRect.top,
        left: dropdownRect.left,
        width: dropdownRect.width,
      }}
    >
      <div className={styles.searchWrapper}>
        <SearchIcon className={styles.searchIcon} />
        <input
          ref={searchInputRef}
          type="text"
          className={styles.searchInput}
          placeholder="Type to search..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          onKeyDown={handleKeyDown}
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
                const isSelected = rowValue === internalValue;
                return (
                  <tr
                    key={rowIndex}
                    className={isSelected ? styles.selected : undefined}
                    onClick={() => handleRowClick(row)}
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
    </div>
  ) : null;

  return (
    <div className={`${styles.wrapper} ${className ?? ""}`} id={id}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger}${isOpen ? ` ${styles.open}` : ""}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`${styles.triggerText}${!displayLabel ? ` ${styles.placeholder}` : ""}`}>
          {displayLabel ?? placeholder}
        </span>
        <ChevronDownIcon className={`${styles.chevron}${isOpen ? ` ${styles.rotated}` : ""}`} />
      </button>

      {portalContainer && createPortal(dropdown, portalContainer)}
    </div>
  );
}
