/**
 * Accessibility diagnostic types.
 *
 * `A11yDiagnostic` is the unit of output from the accessibility linter.
 * Each code maps to a specific accessibility violation or best-practice warning.
 *
 * Code taxonomy (matches the `A11yCode` union):
 *   - `missing-accessible-name`          Interactive element with no accessible name.
 *   - `icon-only-button-no-label`        <Button icon="..."> without aria-label or label.
 *   - `modal-no-title`                   <Modal> without a title prop or <ModalTitle> slot.
 *   - `form-input-no-label`              Form input outside <FormItem> and without a <Label>.
 *   - `duplicate-landmark`               More than one component with the same landmark role in a page.
 *   - `missing-skip-link`                App/Page with NavPanel but no SkipLink sibling.
 *   - `color-contrast-low`               Computed foreground/background contrast < 4.5:1.
 *   - `interactive-not-keyboard-reachable` Interactive element with no tabIndex or focus management.
 *   - `live-region-missing`              Dynamic content update with no live-region wrapper.
 *   - `redundant-aria-role`              Explicit ARIA role duplicates the element's implicit role.
 */

export type A11yCode =
  | "missing-accessible-name"
  | "icon-only-button-no-label"
  | "modal-no-title"
  | "form-input-no-label"
  | "duplicate-landmark"
  | "missing-skip-link"
  | "color-contrast-low"
  | "interactive-not-keyboard-reachable"
  | "live-region-missing"
  | "redundant-aria-role";

export interface A11yDiagnostic {
  code: A11yCode;
  severity: "error" | "warn";
  /**
   * The XMLUI component type that produced this diagnostic
   * (e.g., `"Button"`, `"Modal"`).
   */
  componentName: string;
  /** Source range of the offending element (1-based). */
  range?: { line: number; col: number; length?: number };
  /** Workspace-relative URI of the source file. */
  uri?: string;
  /** Human-readable description of the violation. */
  message: string;
  /**
   * Suggested remediation shown as a quick-fix in the IDE.
   * Plain text; may include markup attribute syntax examples.
   */
  fix?: string;
}
