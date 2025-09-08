import { useCallback, useMemo } from "react";
import classnames from "classnames";
import styles from "./PartialInput.module.scss";

/**
 * Direction indicator for blur events to help parent components understand
 * the user's navigation intent.
 */
export type BlurDirection = "next" | "previous" | "external";

/**
 * Props for PartialInput component.
 * This component encapsulates common input behavior for multi-field input components,
 * including auto-advance, arrow key navigation support, and enhanced blur handling.
 */
export interface PartialInputProps {
  // Core functionality (varies by context)
  value?: string | null;
  /** Explicit placeholder override. If not provided, will be generated from emptyCharacter */
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (direction: BlurDirection, event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement }) => void;
  
  // EmptyCharacter support
  /** Character to use for generating placeholders. Defaults to "-" if not provided */
  emptyCharacter?: string;
  /** Number of characters to repeat for placeholder. Defaults to 2 */
  placeholderLength?: number;
  
  // Validation & constraints (context-dependent)
  max: number;
  min: number;
  maxLength?: number; // PartialInput derives auto-advance logic from this
  validateFn?: (value: string) => boolean;
  onBeep?: () => void;
  
  // Navigation (context-dependent)
  nextInputRef?: React.RefObject<HTMLInputElement | null>;
  nextButtonRef?: React.RefObject<HTMLButtonElement | null>;
  
  // Identification & accessibility (varies)
  name: string;
  ariaLabel?: string;
  className?: string;
  invalidClassName?: string;
  
  // Standard props (can vary per input)
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  
  // Optional overrides (with sensible defaults)
  step?: number; // Default: 1
  isInvalid?: boolean; // Default: false (prevents auto-advance when true)
}

/**
 * PartialInput is a specialized input component designed for multi-field input scenarios.
 * 
 * Key features:
 * - Auto-advance: Automatically moves to the next input when max length is reached
 * - Enhanced blur detection: Provides direction information (next/previous/external)
 * - Consistent styling: Common base styles with component-specific overrides via className
 * - Accessibility: Proper ARIA labels and keyboard navigation support
 * - Validation integration: Works with validation functions and provides feedback
 * 
 * This component encapsulates common patterns found in multi-field input components,
 * reducing code duplication and ensuring consistent behavior.
 * 
 * @param props - PartialInputProps configuration
 * @returns A configured input element with enhanced multi-field input behavior
 */
export function PartialInput({
  value,
  placeholder,
  onChange,
  onBlur,
  onKeyDown,
  emptyCharacter,
  placeholderLength = 2,
  max,
  min,
  maxLength = 2,
  validateFn,
  onBeep,
  nextInputRef,
  nextButtonRef,
  name,
  ariaLabel,
  className,
  invalidClassName,
  disabled,
  readOnly,
  required,
  autoFocus,
  inputRef,
  step = 1,
  isInvalid = false,
}: PartialInputProps) {
  
  /**
   * Process emptyCharacter according to requirements.
   * Handles null/empty values, multi-character strings, and unicode characters.
   */
  const processedEmptyCharacter = useMemo(() => {
    if (!emptyCharacter || emptyCharacter.length === 0) {
      return "-";
    }
    if (emptyCharacter.length > 1) {
      // Use unicode-aware character extraction
      const firstChar = [...emptyCharacter][0];
      return firstChar;
    }
    return emptyCharacter;
  }, [emptyCharacter]);

  /**
   * Generate final placeholder value.
   * Uses explicit placeholder if provided, otherwise generates from emptyCharacter.
   */
  const finalPlaceholder = useMemo(() => {
    if (placeholder !== undefined) {
      return placeholder; // Explicit override takes precedence
    }
    return processedEmptyCharacter.repeat(placeholderLength);
  }, [placeholder, processedEmptyCharacter, placeholderLength]);
  
  /**
   * Internal focus handler that automatically selects all text for easier editing.
   * This is a common UX pattern for numeric inputs in multi-field components.
   */
  const handleInternalFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    // Select all text when gaining focus for easier editing
    event.target.select();
  }, []);

  /**
   * Enhanced input change handler with automatic advance logic.
   * When the user types the maximum number of characters and the input is valid,
   * automatically moves focus to the next input or button.
   */
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      // Call the original onChange handler
      if (onChange) {
        onChange(event);
      }

      // Auto-advance logic: move to next input when reaching maxLength with valid numeric input
      if (newValue.length === maxLength && /^\d+$/.test(newValue) && !isInvalid) {
        // Check if the new value is valid before auto-tabbing
        const isValueInvalid = validateFn ? validateFn(newValue) : false;
        
        if (!isValueInvalid) {
          // Small delay to ensure the current input is properly updated
          setTimeout(() => {
            if (nextInputRef?.current) {
              // Tab to next input field
              nextInputRef.current.focus();
              nextInputRef.current.select();
            } else if (nextButtonRef?.current) {
              // Tab to next button (e.g., action button)
              nextButtonRef.current.focus();
            }
          }, 0);
        } else {
          // Input is ready for auto-tab but invalid - play beep sound and fire event
          onBeep?.();
        }
      }
    },
    [onChange, nextInputRef, nextButtonRef, maxLength, validateFn, onBeep, isInvalid],
  );

  /**
   * Enhanced blur handler that detects the direction of navigation.
   * This helps parent components understand whether the user is moving forward,
   * backward, or clicking outside the component entirely.
   */
  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const relatedTarget = event.relatedTarget as HTMLElement;
      let direction: BlurDirection = "external";

      // Determine direction based on related target
      if (relatedTarget) {
        // Check if moving to next input
        if (nextInputRef?.current === relatedTarget) {
          direction = "next";
        }
        // Check if moving to next button
        else if (nextButtonRef?.current === relatedTarget) {
          direction = "next";
        }
        // Check if moving from a navigation event (could be previous)
        // Note: This is a simplified heuristic. In practice, we might need more sophisticated detection
        else if (relatedTarget.getAttribute("data-input") === "true") {
          // If it's another input, we assume it could be previous navigation
          // The parent component can provide more context if needed
          direction = "previous";
        }
      }

      // Call the enhanced onBlur handler with direction
      onBlur?.(direction, event);
    },
    [onBlur, nextInputRef, nextButtonRef],
  );

  /**
   * Enhanced key down handler that prevents space character input.
   * Filters out space key presses while allowing other keys to pass through.
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent space character input
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        return;
      }

      // Call the original onKeyDown handler for other keys
      onKeyDown?.(event as React.KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement });
    },
    [onKeyDown],
  );

  return (
    <input
      aria-label={ariaLabel}
      autoComplete="off"
      // biome-ignore lint/a11y/noAutofocus: This is up to developers' decision
      autoFocus={autoFocus}
      className={classnames(styles.partialInput, className, {
        [invalidClassName]: isInvalid,
      })}
      data-input="true"
      disabled={disabled}
      inputMode="numeric"
      max={max}
      maxLength={maxLength}
      min={min}
      name={name}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onFocus={handleInternalFocus}
      onKeyDown={handleKeyDown}
      placeholder={finalPlaceholder}
      readOnly={readOnly}
      ref={inputRef as React.RefObject<HTMLInputElement>}
      required={required}
      step={step}
      type="text"
      value={value !== null ? value : ""}
    />
  );
}
