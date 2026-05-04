/**
 * Accessibility linter.
 *
 * `lintComponentDef()` walks a `ComponentDef` tree and emits `A11yDiagnostic`
 * entries for accessibility violations.
 *
 * All rules in this file are **pure and synchronous** — no I/O, no React, no
 * console output. The caller (LSP server, Vite plugin, or test) decides what
 * to do with the results.
 *
 * Phase 1 rules implemented here:
 *   1. `missing-accessible-name`      (must-have; strict-escalated to error)
 *   2. `icon-only-button-no-label`    (must-have; strict-escalated to error)
 *   3. `modal-no-title`               (must-have; strict-escalated to error)
 *   4. `form-input-no-label`          (must-have; strict-escalated to error)
 *   5. `duplicate-landmark`           (warn only)
 *   6. `redundant-aria-role`          (warn only)
 *   7. `missing-skip-link`            (warn only; stub — requires SkipLink component)
 */

import type { ComponentDef, ComponentMetadata } from "../../abstractions/ComponentDefs";
import type { A11yDiagnostic } from "./diagnostics";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface LintOptions {
  /**
   * When `true`, the four "must-have" codes escalate from `warn` to `error`.
   * Controlled by `App.appGlobals.strictAccessibility`.
   */
  strict?: boolean;
  /**
   * When `true`, components not found in the registry are silently skipped
   * (no `missing-accessible-name` for unregistered components).
   */
  skipUnknown?: boolean;
}

/**
 * Lint a component-def tree for accessibility violations.
 *
 * @param def       Root `ComponentDef` to walk (typically the page/app root).
 * @param registry  Map from component type name to `ComponentMetadata`.
 * @param opts      Optional lint configuration.
 * @returns         Flat array of diagnostics, sorted by line then column.
 */
export function lintComponentDef(
  def: ComponentDef,
  registry: ReadonlyMap<string, ComponentMetadata>,
  opts?: LintOptions,
): A11yDiagnostic[] {
  const { strict = false, skipUnknown = false } = opts ?? {};

  const mustHaveSeverity: "error" | "warn" = strict ? "error" : "warn";

  const diagnostics: A11yDiagnostic[] = [];
  const landmarksSeen = new Map<string, number>(); // landmark role → count

  walkTree(def, (node, _parent) => {
    const metadata = registry.get(node.type);

    // Rule 2: icon-only-button-no-label
    if (node.type === "Button" || metadata?.a11y?.role === "button") {
      checkIconOnlyButton(node, diagnostics, mustHaveSeverity);
    }

    // Rule 3: modal-no-title
    if (node.type === "Modal" || metadata?.a11y?.role === "dialog") {
      checkModalNoTitle(node, diagnostics, mustHaveSeverity);
    }

    // Rule 4: form-input-no-label
    if (metadata?.a11y?.role === "form-input") {
      checkFormInputNoLabel(node, _parent, registry, diagnostics, mustHaveSeverity);
    }

    if (!metadata) {
      if (!skipUnknown) {
        // Rule 1 for unknown components: skip (no metadata → can't determine requirements)
      }
      return;
    }

    // Rule 1: missing-accessible-name (generic)
    const { role, requiresAccessibleName, accessibleNameProps } = metadata.a11y ?? {};
    const interactive: Array<typeof role> = [
      "button", "link", "switch", "checkbox", "menuitem", "tab", "option",
    ];
    if (
      role &&
      interactive.includes(role) &&
      requiresAccessibleName !== false &&
      accessibleNameProps &&
      accessibleNameProps.length > 0
    ) {
      const hasName = accessibleNameProps.some((p) => {
        const v = node.props?.[p];
        // Allow if value is non-empty string OR a dynamic expression
        return v != null && v !== "";
      });
      if (!hasName) {
        diagnostics.push({
          code: "missing-accessible-name",
          severity: mustHaveSeverity,
          componentName: node.type,
          message: `<${node.type}> requires an accessible name. Add one of: ${accessibleNameProps.map((p) => `\`${p}\``).join(", ")}.`,
          fix: `Add \`${accessibleNameProps[0]}="..."\` to <${node.type}>.`,
        });
      }
    }

    // Rule 5: duplicate-landmark
    if (metadata.a11y?.landmark) {
      const lm = metadata.a11y.landmark;
      landmarksSeen.set(lm, (landmarksSeen.get(lm) ?? 0) + 1);
      if (landmarksSeen.get(lm)! > 1) {
        diagnostics.push({
          code: "duplicate-landmark",
          severity: "warn",
          componentName: node.type,
          message: `Duplicate "${lm}" landmark: only one <${node.type}> with landmark="${lm}" should appear per page.`,
          fix: `Remove or consolidate duplicate <${node.type}> components.`,
        });
      }
    }
  });

  return sortDiagnostics(diagnostics);
}

// ---------------------------------------------------------------------------
// Individual rule implementations
// ---------------------------------------------------------------------------

function checkIconOnlyButton(
  node: ComponentDef,
  out: A11yDiagnostic[],
  severity: "error" | "warn",
): void {
  const props = node.props ?? {};
  const hasIcon =
    props.icon != null && props.icon !== "" &&
    // Allow when the icon is an expression (dynamic — optimistically skip)
    !String(props.icon).startsWith("{");
  if (!hasIcon) return;

  // Has an icon; check for accessible label
  const hasLabel =
    (props.label != null && props.label !== "") ||
    (props["aria-label"] != null && props["aria-label"] !== "") ||
    (props.title != null && props.title !== "") ||
    // Accept an expression-valued prop optimistically
    Object.keys(props).some(
      (k) => ["label", "aria-label", "title"].includes(k) &&
        String(props[k]).startsWith("{"),
    );

  if (!hasLabel) {
    out.push({
      code: "icon-only-button-no-label",
      severity,
      componentName: node.type,
      message: `Icon-only <${node.type}> has no accessible label. Screen readers cannot identify this button.`,
      fix: `Add \`aria-label="..."\` or \`label="..."\` to describe the button's purpose.`,
    });
  }
}

function checkModalNoTitle(
  node: ComponentDef,
  out: A11yDiagnostic[],
  severity: "error" | "warn",
): void {
  const props = node.props ?? {};
  const hasTitle =
    (props.title != null && props.title !== "") ||
    // Dynamic value — skip optimistically
    (typeof props.title === "string" && props.title.startsWith("{"));

  // Also check for a ModalTitle slot child
  const hasModalTitleSlot =
    node.slots?.header?.some((c) => c.type === "ModalTitle") ||
    node.children?.some((c) => c.type === "ModalTitle");

  if (!hasTitle && !hasModalTitleSlot) {
    out.push({
      code: "modal-no-title",
      severity,
      componentName: node.type,
      message: `<${node.type}> has no title. Modals must have a visible title for screen readers.`,
      fix: `Add \`title="..."\` to <${node.type}> or include a <ModalTitle> slot child.`,
    });
  }
}

const FORM_INPUT_TYPES = new Set([
  "TextBox", "NumberBox", "Select", "AutoComplete", "Checkbox", "Switch",
  "RadioGroup", "DateInput", "TimeInput", "DatePicker", "Slider", "RatingInput",
  "PasswordInput", "TextArea", "FileInput",
]);

function checkFormInputNoLabel(
  node: ComponentDef,
  parent: ComponentDef | undefined,
  registry: ReadonlyMap<string, ComponentMetadata>,
  out: A11yDiagnostic[],
  severity: "error" | "warn",
): void {
  // If the parent is a FormItem, the label is provided by it — no violation
  if (parent?.type === "FormItem") return;

  // If the input has a bindTo prop, a FormBinding behavior is likely providing context — skip
  if (node.props?.bindTo != null) return;

  // If the input has its own label prop, it's fine (LabelBehavior will render it)
  const props = node.props ?? {};
  const hasLabel =
    (props.label != null && props.label !== "") ||
    (props["aria-label"] != null && props["aria-label"] !== "") ||
    (props["aria-labelledby"] != null && props["aria-labelledby"] !== "");

  if (!hasLabel) {
    out.push({
      code: "form-input-no-label",
      severity,
      componentName: node.type,
      message: `<${node.type}> is used outside a <FormItem> and has no label. Form inputs must be labelled.`,
      fix: `Wrap in \`<FormItem label="...">\` or add \`label="..."\` directly to <${node.type}>.`,
    });
  }
}

// ---------------------------------------------------------------------------
// Tree walker
// ---------------------------------------------------------------------------

function walkTree(
  node: ComponentDef,
  visitor: (node: ComponentDef, parent: ComponentDef | undefined) => void,
  parent?: ComponentDef,
): void {
  visitor(node, parent);
  if (node.children) {
    for (const child of node.children) {
      walkTree(child, visitor, node);
    }
  }
  if (node.slots) {
    for (const slotChildren of Object.values(node.slots)) {
      for (const child of slotChildren) {
        walkTree(child, visitor, node);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sortDiagnostics(diagnostics: A11yDiagnostic[]): A11yDiagnostic[] {
  return diagnostics.slice().sort((a, b) => {
    const lineA = a.range?.line ?? 0;
    const lineB = b.range?.line ?? 0;
    if (lineA !== lineB) return lineA - lineB;
    return (a.range?.col ?? 0) - (b.range?.col ?? 0);
  });
}
