import React from "react";
import classnames from "classnames";
import styles from "./InputDivider.module.scss";

/**
 * Props for InputDivider component.
 */
export interface InputDividerProps {
  /** The separator character/string to display */
  separator: string;
  /** Optional custom className for styling and spacing */
  className?: string;
}

/**
 * InputDivider is a simple component for displaying separators between input fields.
 * 
 * This component is designed to be used in multi-field input scenarios like TimeInput 
 * and DateInput where visual separators (like ":", "/", "-") are needed between fields.
 * 
 * Key features:
 * - Flexible separator content (single or multi-character strings)
 * - CSS class-based styling for maximum flexibility
 * - Consistent behavior across different input components
 * 
 * @example
 * ```tsx
 * // Time separator
 * <InputDivider separator=":" className={styles.divider} />
 * 
 * // Date separator
 * <InputDivider separator="/" className={styles.divider} />
 * 
 * // Custom separator
 * <InputDivider separator=" • " className="custom-separator" />
 * ```
 */
export function InputDivider({ 
  separator, 
  className 
}: InputDividerProps): React.ReactElement {
  return (
    <span className={classnames(styles.inputDivider, className)}>
      {separator}
    </span>
  );
}
