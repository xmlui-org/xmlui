/**
 * Type-contract verifier.
 *
 * `verifyComponentDef()` walks a `ComponentDef` tree with the registry in
 * hand and produces `TypeContractDiagnostic` entries for contract
 * violations. The function is **pure and synchronous** — no I/O, no React,
 * no console output. Callers (LSP, Vite plugin, runtime warn-mode) decide
 * what to do with the results.
 *
 * Phase 2 (W3-2) fills in the full per-component checks:
 *   - `missing-required`   required prop absent from the def
 *   - `id-unknown-prop`       prop not declared in metadata (Levenshtein hint)
 *   - `wrong-type`         literal value fails the declared `valueType` rule
 *   - `value-not-in-enum`  literal value outside the `availableValues` set
 *   - `id-unknown-event`      event not declared in metadata
 *   - `deprecated-prop`    prop carries a `deprecationMessage`
 *
 * Expression-valued props (`value="{state.x}"`) are skipped for type/enum
 * checks because the resolved value is not known until runtime.
 *
 * See `dev-docs/plans/01-verified-type-contracts.md` Phase 2 §2.1.
 */

import type { ComponentDef, ComponentMetadata } from "../../abstractions/ComponentDefs";
import { layoutOptionKeys } from "../descriptorHelper";
import { parseLayoutProperty } from "../theming/parse-layout-props";
import { verifyValue } from "./rules/coerce";
import { verifyEnum } from "./rules/enum";
import { findSuggestion } from "./suggestions";
import type { TypeContractDiagnostic } from "./diagnostics";

export interface VerifyOptions {
  /**
   * When `true`, contract violations escalate from `warn` to `error`.
   * Controlled by `App.xmluiConfig.strictTypeContracts`.
   */
  strict?: boolean;
  /**
   * When `true`, components not found in the registry are silently skipped
   * (no `id-unknown-component` diagnostic).
   */
  skipUnknown?: boolean;
}

/**
 * Verify a component-def tree against the component registry.
 *
 * @param def       Root `ComponentDef` to walk.
 * @param registry  Map from component type name to `ComponentMetadata`.
 * @param opts      Optional verification configuration.
 * @returns         Flat array of diagnostics, sorted by line then column.
 */
export function verifyComponentDef(
  def: ComponentDef,
  registry: ReadonlyMap<string, ComponentMetadata>,
  opts?: VerifyOptions,
): TypeContractDiagnostic[] {
  const { strict = false, skipUnknown = false } = opts ?? {};
  const severity: "error" | "warn" = strict ? "error" : "warn";

  const diagnostics: TypeContractDiagnostic[] = [];

  visit(def);

  diagnostics.sort(byRange);
  return diagnostics;

  function visit(node: ComponentDef | undefined): void {
    if (!node || typeof node !== "object") return;
    const typeName = normalizeTypeName(node.type);

    if (typeof typeName !== "string" || typeName.length === 0) {
      recurse(node);
      return;
    }

    const meta = registry.get(typeName);

    if (!meta) {
      if (!skipUnknown && !isFrameworkType(typeName)) {
        diagnostics.push({
          code: "id-unknown-component",
          severity,
          componentName: typeName,
          range: extractRange(node),
          message: `Unknown component <${typeName}>: not registered.`,
        });
      }
      recurse(node);
      return;
    }

    // ─── Per-prop checks ────────────────────────────────────────────────────

    const metaProps = meta.props ?? {};
    const defProps = (node.props ?? {}) as Record<string, unknown>;

    // 1. missing-required: props declared isRequired that are absent from the def
    for (const [propName, propMeta] of Object.entries(metaProps)) {
      if (propMeta.isRequired && !(propName in defProps)) {
        // The XML parser hoists the `id` attribute out of props into `node.uid`.
        // A present `uid` satisfies a required "id" prop declaration.
        if (propName === "id" && node.uid !== undefined) continue;
        diagnostics.push({
          code: "missing-required",
          severity,
          componentName: typeName,
          propName,
          expected: propMeta.valueType ?? "any",
          range: extractRange(node),
          message: `<${typeName}> is missing required prop "${propName}".`,
        });
      }
    }

    // Per-def-prop checks: id-unknown-prop, wrong-type, value-not-in-enum, deprecated-prop
    const knownPropNames = [
      ...Object.keys(metaProps),
      ...supportedBehaviorPropNames(typeName, meta),
    ];
    for (const [propName, rawValue] of Object.entries(defProps)) {
      const propMeta = metaProps[propName];

      if (!propMeta) {
        // Not in metadata — acceptable if it is a layout option or the component
        // allows arbitrary props, or if a behavior supported by this host
        // component consumes the prop.
        if (
          !isKnownLayoutProp(propName) &&
          !isSupportedBehaviorProp(propName, typeName, meta) &&
          !meta.allowArbitraryProps
        ) {
          const suggestion = findSuggestion(propName, knownPropNames);
          diagnostics.push({
            code: "id-unknown-prop",
            severity,
            componentName: typeName,
            propName,
            range: extractAttributeNameRange(node, propName),
            message: `<${typeName}> has unknown prop "${propName}".`,
            ...(suggestion !== undefined ? { suggestion } : {}),
          });
        }
        continue;
      }

      // deprecated-prop: always warn regardless of strict mode
      if (propMeta.deprecationMessage) {
        diagnostics.push({
          code: "deprecated-prop",
          severity: "warn",
          componentName: typeName,
          propName,
          range: extractAttributeNameRange(node, propName),
          message: `Prop "${propName}" on <${typeName}> is deprecated: ${propMeta.deprecationMessage}`,
        });
      }

      // Skip type and enum checks for expression-valued props — value is unknown
      // until runtime.
      if (isExpressionValue(rawValue)) continue;

      // value-not-in-enum: checked before wrong-type (more specific).
      // availableValues alone is hints-only; strict validation requires isStrictEnum.
      if (propMeta.isStrictEnum && propMeta.availableValues && propMeta.availableValues.length > 0) {
        const enumFailure = verifyEnum(rawValue, propMeta.availableValues);
        if (enumFailure) {
          diagnostics.push({
            code: "value-not-in-enum",
            severity,
            componentName: typeName,
            propName,
            expected: enumFailure.expected,
            actual: rawValue != null ? String(rawValue) : undefined,
            range: extractAttributeValueRange(node, propName),
            message: `<${typeName}> prop "${propName}": ${enumFailure.message}`,
          });
          continue; // enum failure subsumes type failure for the same value
        }
      }

      // wrong-type: literal value against the declared valueType
      if (propMeta.valueType && propMeta.valueType !== "any") {
        const typeFailure = verifyValue(propMeta.valueType, rawValue);
        if (typeFailure) {
          diagnostics.push({
            code: "wrong-type",
            severity,
            componentName: typeName,
            propName,
            expected: typeFailure.expected ?? propMeta.valueType,
            actual: rawValue != null ? String(rawValue) : undefined,
            range: extractAttributeValueRange(node, propName),
            message: `<${typeName}> prop "${propName}": ${typeFailure.message}`,
          });
        }
      }
    }

    // ─── Per-event checks ───────────────────────────────────────────────────

    const metaEvents = meta.events ?? {};
    const defEvents = (node.events ?? {}) as Record<string, unknown>;
    for (const eventName of Object.keys(defEvents)) {
      if (!(eventName in metaEvents) && !isFrameworkEvent(eventName)) {
        diagnostics.push({
          code: "id-unknown-event",
          severity,
          componentName: typeName,
          propName: eventName,
          range: extractAttributeNameRange(node, eventName),
          message: `<${typeName}> has unknown event "${eventName}".`,
        });
      }
    }

    // ─── Per-exposed-method checks ─────────────────────────────────────────

    const metaApis = meta.apis ?? {};
    const defApis = (node.api ?? {}) as Record<string, unknown>;
    for (const apiName of Object.keys(defApis)) {
      if (!(apiName in metaApis)) {
        diagnostics.push({
          code: "id-unknown-method",
          severity,
          componentName: typeName,
          propName: apiName,
          range: extractAttributeNameRange(node, apiName),
          message: `<${typeName}> exposes unknown method "${apiName}".`,
        });
      }
    }

    recurse(node);
  }

  function recurse(node: ComponentDef): void {
    const children = (node as any).children;
    if (Array.isArray(children)) {
      for (const child of children) visit(child);
    } else if (children && typeof children === "object") {
      visit(children as ComponentDef);
    }
  }
}

/**
 * Framework-level type names that should never be flagged as unknown
 * (mirrors the analyzer's `id-unknown-component` allowlist).
 */
const FRAMEWORK_TYPES: ReadonlySet<string> = new Set([
  "Component",
  "Fragment",
  "#text",
  "#comment",
  "#cdata-section",
]);

const CORE_NAMESPACE_PREFIX = "#xmlui-core-ns:";

function normalizeTypeName(typeName: unknown): unknown {
  if (typeof typeName !== "string") return typeName;
  return typeName.startsWith(CORE_NAMESPACE_PREFIX)
    ? typeName.slice(CORE_NAMESPACE_PREFIX.length)
    : typeName;
}

function isFrameworkType(name: string): boolean {
  return FRAMEWORK_TYPES.has(name);
}

const FRAMEWORK_EVENTS: ReadonlySet<string> = new Set([
  "mount",
  "unmount",
  "error",
  "beforeDispose",
  "init",
  "cleanup",
]);

function isFrameworkEvent(name: string): boolean {
  return FRAMEWORK_EVENTS.has(name);
}

/**
 * Return `true` when `propName` is a layout option (e.g. `"width"`) or a
 * responsive variant of one (e.g. `"width-md"`).  These props are injected
 * by the layout engine and are not declared in component metadata.
 */
function isKnownLayoutProp(propName: string): boolean {
  const parsed = parseLayoutProperty(propName, false);

  if (typeof parsed === "string") {
    return false;
  }

  return layoutOptionKeys.includes(parsed.property);
}

type BehaviorContract = {
  name: string;
  props: readonly string[];
  supportsHost: (typeName: string, meta: ComponentMetadata) => boolean;
};

const FORM_BINDABLE_BEHAVIOR_PROPS = [
  "bindTo",
  "initialValue",
  "noSubmit",
] as const;

const LABEL_BEHAVIOR_PROPS = [
  "label",
  "labelPosition",
  "labelWidth",
  "labelBreak",
  "required",
  "enabled",
  "shrinkToLabel",
  "readOnly",
] as const;

const VALIDATION_BEHAVIOR_PROPS = [
  "required",
  "requiredInvalidMessage",
  "minLength",
  "maxLength",
  "lengthInvalidMessage",
  "lengthInvalidSeverity",
  "minValue",
  "maxValue",
  "rangeInvalidMessage",
  "rangeInvalidSeverity",
  "pattern",
  "patternInvalidMessage",
  "patternInvalidSeverity",
  "regex",
  "regexInvalidMessage",
  "regexInvalidSeverity",
  "matchValue",
  "matchInvalidMessage",
  "validationMode",
  "customValidationsDebounce",
  "validationDisplayDelay",
  "verboseValidationFeedback",
  "validate",
] as const;

const LIVE_REGION_BEHAVIOR_PROPS = [
  "withLiveRegion",
  "liveRegionMessage",
  "liveRegionPoliteness",
] as const;

const LIVE_REGION_HOSTS = new Set([
  "Text",
  "Heading",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "Badge",
  "NoResult",
  "ProgressBar",
]);

const BEHAVIOR_CONTRACTS: readonly BehaviorContract[] = [
  {
    name: "animation",
    props: ["animation", "animationOptions"],
    supportsHost: isVisualHost,
  },
  {
    name: "bookmark",
    props: ["bookmark", "bookmarkLevel", "bookmarkTitle", "bookmarkOmitFromToc"],
    supportsHost: isVisualHost,
  },
  {
    name: "formBinding",
    props: FORM_BINDABLE_BEHAVIOR_PROPS,
    supportsHost: (typeName, meta) => typeName !== "FormItem" && hasValueApiPair(meta),
  },
  {
    name: "label",
    props: LABEL_BEHAVIOR_PROPS,
    supportsHost: (typeName, meta) =>
      isVisualHost(typeName, meta) &&
      typeName !== "FormItem" &&
      !hasOwnProp(meta, "label") &&
      !hasOwnProp(meta, "bindTo"),
  },
  {
    name: "liveRegion",
    props: LIVE_REGION_BEHAVIOR_PROPS,
    supportsHost: (typeName, meta) => isVisualHost(typeName, meta) && LIVE_REGION_HOSTS.has(typeName),
  },
  {
    name: "pubsub",
    props: ["subscribeToTopic"],
    supportsHost: () => true,
  },
  {
    name: "tooltip",
    props: ["tooltip", "tooltipMarkdown", "tooltipOptions"],
    supportsHost: isVisualHost,
  },
  {
    name: "validation",
    props: VALIDATION_BEHAVIOR_PROPS,
    supportsHost: (typeName, meta) => typeName === "FormItem" || hasValueApiPair(meta),
  },
  {
    name: "variant",
    props: ["variant"],
    supportsHost: isVisualHost,
  },
  {
    name: "eventPropagation",
    props: ["bubbleEvents"],
    supportsHost: () => true,
  },
];

function supportedBehaviorPropNames(typeName: string, meta: ComponentMetadata): string[] {
  const names = new Set<string>();
  for (const contract of BEHAVIOR_CONTRACTS) {
    if (isBehaviorExcluded(contract.name, meta)) continue;
    if (!contract.supportsHost(typeName, meta)) continue;
    for (const propName of contract.props) {
      names.add(propName);
    }
  }
  return Array.from(names);
}

function isSupportedBehaviorProp(
  propName: string,
  typeName: string,
  meta: ComponentMetadata,
): boolean {
  return BEHAVIOR_CONTRACTS.some(
    (contract) =>
      (contract.props as readonly string[]).includes(propName) &&
      !isBehaviorExcluded(contract.name, meta) &&
      contract.supportsHost(typeName, meta),
  );
}

function isBehaviorExcluded(behaviorName: string, meta: ComponentMetadata): boolean {
  return meta.excludeBehaviors?.includes(behaviorName) ?? false;
}

function isVisualHost(_typeName: string, meta: ComponentMetadata): boolean {
  return !meta.nonVisual;
}

function hasOwnProp(meta: ComponentMetadata, propName: string): boolean {
  return !!meta.props?.[propName];
}

function hasValueApiPair(meta: ComponentMetadata): boolean {
  return !!meta.apis?.value && !!meta.apis?.setValue;
}

/**
 * Return `true` when the prop value contains at least one `{...}` binding
 * expression, meaning its resolved value is not known until runtime.
 *
 * A simple regex test is intentionally used here instead of the full
 * `parseParameterString` to keep the verifier dependency-free from the
 * scripting parser.  The check is conservative: any value that *looks like*
 * it might contain a binding expression is left for runtime verification.
 */
function isExpressionValue(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /\{[^}]+\}/.test(value);
}

function extractAttributeNameRange(
  node: any,
  propName: string,
): TypeContractDiagnostic["range"] {
  return extractRange(node?.debug?.attributes?.[propName]?.name) ?? extractRange(node);
}

function extractAttributeValueRange(
  node: any,
  propName: string,
): TypeContractDiagnostic["range"] {
  const attrRange = node?.debug?.attributes?.[propName];
  return extractRange(attrRange?.value) ?? extractRange(attrRange?.name) ?? extractRange(node);
}

function extractRange(nodeOrRange: any): TypeContractDiagnostic["range"] {
  const sourceRange = nodeOrRange?.debug?.source ?? nodeOrRange?.__SOURCE_RANGE ?? nodeOrRange?.__SOURCE ?? nodeOrRange;
  if (!sourceRange) return undefined;
  if (
    typeof sourceRange.line === "number" &&
    typeof sourceRange.col === "number"
  ) {
    return {
      line: sourceRange.line,
      col: sourceRange.col,
      length: sourceRange.length,
    };
  }
  return undefined;
}

function byRange(a: TypeContractDiagnostic, b: TypeContractDiagnostic): number {
  const al = a.range?.line ?? 0;
  const bl = b.range?.line ?? 0;
  if (al !== bl) return al - bl;
  const ac = a.range?.col ?? 0;
  const bc = b.range?.col ?? 0;
  return ac - bc;
}
