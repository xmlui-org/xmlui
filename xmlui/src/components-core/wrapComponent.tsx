import React from "react";
import type { ComponentMetadata } from "../abstractions/ComponentDefs";
import type { ComponentRendererDef, LayoutContext } from "../abstractions/RendererDefs";
import { createChildLayoutContext } from "../abstractions/layout-context-utils";
import { createComponentRenderer } from "./renderers";
import { pushXsLog, createLogEntry, pushTrace, popTrace, getCurrentTrace } from "./inspector/inspectorUtils";
import { layoutOptionKeys } from "./descriptorHelper";
import { MediaBreakpointKeys } from "../abstractions/AppContextDefs";
import { MemoizedItem } from "../components/container-helpers";
import { COMPONENT_PART_KEY } from "./theming/responsive-layout";

/**
 * Generic hover capture for canvas-rendered components.
 * Wraps children in a display:contents div that captures mousemove
 * on canvas elements and emits throttled native:hover trace events.
 */
const HOVER_CAPTURE_STYLE = { display: "contents" } as const;

function HoverCapture({
  children,
  componentType,
  componentLabel,
  ariaName,
  ownerFileId,
  ownerSource,
}: {
  children: React.ReactNode;
  componentType: string;
  componentLabel?: string;
  ariaName?: string;
  ownerFileId?: string;
  ownerSource?: any;
}) {
  const THROTTLE_MS = 300;
  const SESSION_GAP_MS = 500;

  const hoverSessionRef = React.useRef({ traceId: undefined as string | undefined, lastTs: 0 });

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== "CANVAS") return;
      const now = Date.now();
      const hs = hoverSessionRef.current;
      if (now - hs.lastTs < THROTTLE_MS) return;

      // Start a new hover session if the gap since the last event exceeds SESSION_GAP_MS
      if (!hs.traceId || now - hs.lastTs > SESSION_GAP_MS) {
        hs.traceId = pushTrace();
        popTrace();
      }
      hs.lastTs = now;

      pushXsLog(
        createLogEntry("native:hover", {
          traceId: hs.traceId,
          componentType,
          componentLabel: componentLabel || componentType,
          eventName: "hover",
          ariaName: ariaName || undefined,
          offsetX: e.nativeEvent.offsetX,
          offsetY: e.nativeEvent.offsetY,
          ownerFileId,
          ownerSource,
        }),
      );
    },
    [componentType, componentLabel, ariaName, ownerFileId, ownerSource],
  );

  return (
    <div style={HOVER_CAPTURE_STYLE} onMouseMoveCapture={handleMouseMove}>
      {children}
    </div>
  );
}

/**
 * Configuration for wrapComponent. Only specify what can't be inferred
 * from conventions.
 */
export type WrapComponentConfig = {
  /**
   * Props that should be extracted with extractValue.asOptionalBoolean
   * instead of the default extractValue.
   */
  booleans?: string[];

  /**
   * Props that should be extracted with extractValue.asOptionalNumber.
   */
  numbers?: string[];

  /**
   * Props that should be extracted with extractValue.asOptionalString.
   */
  strings?: string[];

  /**
   * Event mappings. Maps XMLUI event names to React prop names.
   *
   * - Array form: ["click"] assumes onClick (on + capitalize convention)
   * - Object form: { didChange: "onDidChange" } for non-standard mappings
   */
  events?: string[] | Record<string, string>;

  /**
   * Props that should use lookupSyncCallback instead of extractValue.
   * Maps XMLUI prop name to React prop name (or same name if identical).
   */
  callbacks?: string[] | Record<string, string>;

  /**
   * Rename XMLUI prop names to different React prop names.
   * e.g., { minValue: "min", maxValue: "max" }
   */
  rename?: Record<string, string>;

  /**
   * Props to exclude from automatic forwarding.
   */
  exclude?: string[];

  /**
   * Whether this component uses state.value / updateState / initialValue.
   * Defaults to true if the metadata has events.didChange or props.initialValue.
   */
  stateful?: boolean;

  /**
   * Props that should be resolved via extractResourceUrl instead of extractValue.
   * Use for props that contain logical resource URLs (e.g., image src, avatar url).
   */
  resourceUrls?: string[];

  /**
   * When true, passes an `onNativeEvent` callback to the render component.
   * The render component can call this with any native library event object.
   * The wrapper will automatically trace it using the event's `type` field.
   *
   * This enables "let everything through" event capture for components that
   * wrap libraries with their own event systems (e.g., ECharts, Monaco, etc.).
   */
  captureNativeEvents?: boolean;

  /**
   * Optional layout context passed to renderChild when rendering node.children.
   * Use this when the component needs to wrap its children in a specific layout,
   * e.g. { type: "Stack", orientation: "vertical" }.
   */
  childrenLayoutContext?: LayoutContext;

  /**
   * When true, passes `registerComponentApi` to the native component so
   * it can register runtime APIs (e.g., focus(), setValue()). Defaults to false.
   * Only set this for components that actually call registerComponentApi.
   */
  exposeRegisterApi?: boolean;

  /**
   * When false, suppresses the `updateState` prop even for stateful components.
   * Use for components that are stateful only because of `didChange` (they fire
   * the event but never call `updateState` themselves). Defaults to true.
   */
  passUpdateState?: boolean;

  /**
   * When true, passes `node.uid` as the `uid` prop to the native component.
   * Use for components that need their XMLUI id as an HTML anchor / DOM id
   * (e.g., Bookmark).
   */
  passUid?: boolean;

  /**
   * Props holding XMLUI component definitions (valueType: "ComponentDef")
   * that should be rendered as React nodes via renderChild and passed to
   * the native component.
   *
   * - Array form: ["emptyListTemplate"] — prop name stays the same.
   * - Object form: { emptyListTemplate: "emptyList" } — maps XMLUI prop to React prop name.
   *
   * ComponentDef props not listed here or in `renderers` are auto-detected
   * from metadata and treated as static templates with the same prop name.
   */
  templates?: string[] | Record<string, string>;

  /**
   * Template props (valueType: "ComponentDef") that should be converted to
   * render-prop callbacks. The callback wraps the template in MemoizedItem
   * with context variables derived from the callback's runtime arguments.
   *
   * Maps XMLUI prop name → RendererConfig.
   */
  renderers?: Record<string, RendererConfig>;

  /**
   * When true, passes classes[COMPONENT_PART_KEY] as contentClassName
   * to the native component. Used by portal-rendering components
   * (e.g., Select, AutoComplete, DatePicker).
   */
  contentClassName?: boolean;

  /**
   * Custom render function. When provided, called instead of `<Component {...props} />`.
   * Receives the already-extracted props and the raw renderer context.
   *
   * Use for components where the rendered output or children layout depends on
   * runtime prop values (e.g., different layout modes based on orientation).
   * Auto children rendering is skipped when customRender is provided.
   */
  customRender?: (props: Record<string, any>, context: any) => React.ReactNode;

  /*
   * Derives a default aria-label from the component's resolved props.
   * Called after all props are extracted but before rendering. The returned
   * string is used as aria-label on the DOM element and as ariaName in traces,
   * unless the app author provides an explicit aria-label in markup.
   *
   * Use this to point at the prop that already describes what this instance is:
   *   deriveAriaLabel: (props) => props.name        // Avatar
   *   deriveAriaLabel: (props) => props.alt          // Image
   *   deriveAriaLabel: (props) => props.placeholder  // TextBox
   */
  deriveAriaLabel?: (props: Record<string, any>) => string | undefined;
};

/**
 * Configuration for a render-prop template.
 */
export type RendererConfig = {
  /**
   * The React prop name on the native component.
   * Defaults to replacing "Template" with "Renderer" in the XMLUI prop name
   * (e.g., optionTemplate → optionRenderer).
   */
  reactProp?: string;

  /**
   * Maps callback arguments to context variables injected into the template.
   *
   * - Array form: positional mapping, e.g. ["$item", "$selectedValue"]
   *   Each entry maps args[i] to the named context variable.
   *   Use null to skip a position.
   * - Function form: receives all callback args, returns context vars object.
   *   Use for computed vars (e.g., $isFirst: rowIndex === 0).
   */
  contextVars: (string | null)[] | ((...args: any[]) => Record<string, any>);
};

/**
 * Capitalize the first letter of a string.
 */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Normalize event config into a Record<xmluiEventName, reactPropName>.
 */
function normalizeEvents(
  events: string[] | Record<string, string> | undefined,
): Record<string, string> {
  if (!events) return {};
  if (Array.isArray(events)) {
    const result: Record<string, string> = {};
    for (const name of events) {
      result[name] = `on${capitalize(name)}`;
    }
    return result;
  }
  return events;
}

/**
 * Normalize template config into a Record<xmluiPropName, reactPropName>.
 */
function normalizeTemplates(
  templates: string[] | Record<string, string> | undefined,
): Record<string, string> {
  if (!templates) return {};
  if (Array.isArray(templates)) {
    const result: Record<string, string> = {};
    for (const name of templates) {
      result[name] = name;
    }
    return result;
  }
  return { ...templates };
}

/**
 * Derive the default React prop name for a render-prop template.
 * Replaces trailing "Template" with "Renderer", or appends "Renderer".
 */
function templateToRendererName(templateProp: string): string {
  if (templateProp.endsWith("Template")) {
    return templateProp.slice(0, -"Template".length) + "Renderer";
  }
  return templateProp + "Renderer";
}

/**
 * Normalize callback config into a Record<xmluiPropName, reactPropName>.
 */
function normalizeCallbacks(
  callbacks: string[] | Record<string, string> | undefined,
): Record<string, string> {
  if (!callbacks) return {};
  if (Array.isArray(callbacks)) {
    const result: Record<string, string> = {};
    for (const name of callbacks) {
      result[name] = name;
    }
    return result;
  }
  return callbacks;
}

/**
 * Derive booleans, numbers, strings, event map, callback map, rename map,
 * and exclude set from metadata, then merge with the explicit config.
 *
 * Metadata-derived values serve as defaults; anything explicitly listed in
 * config takes precedence (config.booleans overrides, config.events extends
 * or overrides the convention-based derivation).
 */
function mergeWithMetadata(
  metadata: ComponentMetadata,
  config: WrapComponentConfig,
): {
  booleanSet: Set<string>;
  numberSet: Set<string>;
  stringSet: Set<string>;
  resourceUrlSet: Set<string>;
  eventMap: Record<string, string>;
  callbackMap: Record<string, string>;
  renameMap: Record<string, string>;
  excludeSet: Set<string>;
  templateMap: Record<string, string>;
  rendererConfigs: Record<string, RendererConfig>;
} {
  // Seed from explicit config so they take priority
  const booleanSet = new Set<string>(config.booleans ?? []);
  const numberSet = new Set<string>(config.numbers ?? []);
  const stringSet = new Set<string>(config.strings ?? []);
  const resourceUrlSet = new Set<string>(config.resourceUrls ?? []);

  // Auto-classify props from metadata valueType (only if not already categorised)
  if (metadata.props) {
    for (const [propName, propMeta] of Object.entries(metadata.props)) {
      if (propName === "initialValue") continue; // handled separately by wrapper
      if (
        booleanSet.has(propName) ||
        numberSet.has(propName) ||
        stringSet.has(propName) ||
        resourceUrlSet.has(propName)
      )
        continue;
      if (propMeta.isResourceUrl) resourceUrlSet.add(propName);
      else if (propMeta.valueType === "boolean") booleanSet.add(propName);
      else if (propMeta.valueType === "number") numberSet.add(propName);
      else if (propMeta.valueType === "string") stringSet.add(propName);
    }
  }

  // Seed event map from explicit config first (allows non-standard overrides)
  const eventMap = normalizeEvents(config.events);

  // Auto-add any metadata events not already covered by the explicit config
  if (metadata.events) {
    for (const eventName of Object.keys(metadata.events)) {
      if (!(eventName in eventMap)) {
        eventMap[eventName] = `on${capitalize(eventName)}`;
      }
    }
  }

  // Build template and renderer maps
  const templateMap = normalizeTemplates(config.templates);
  const rendererConfigs = config.renderers ?? {};
  const excludeSet = new Set(config.exclude ?? []);

  // Auto-detect ComponentDef props from metadata as static templates
  if (metadata.props) {
    for (const [propName, propMeta] of Object.entries(metadata.props)) {
      if (propMeta.valueType !== "ComponentDef") continue;
      // Skip if explicitly configured as a renderer, template, or excluded
      if (propName in rendererConfigs || propName in templateMap) continue;
      if (excludeSet.has(propName)) continue;
      // Auto-detect as static template with same prop name
      templateMap[propName] = propName;
    }
  }

  return {
    booleanSet,
    numberSet,
    stringSet,
    resourceUrlSet,
    eventMap,
    callbackMap: normalizeCallbacks(config.callbacks),
    renameMap: config.rename ?? {},
    excludeSet,
    templateMap,
    rendererConfigs,
  };
}

/**
 * Map XMLUI event names to semantic trace event kinds from the
 * trace vocabulary. Convention-based: didChange → value:change,
 * gotFocus/lostFocus → focus:change. Returns undefined for
 * events with no matching trace kind (no event emitted).
 */
function eventNameToTraceKind(xmluiName: string): string | undefined {
  switch (xmluiName) {
    case "didChange":
      return "value:change";
    case "gotFocus":
    case "lostFocus":
      return "focus:change";
    default:
      return undefined;
  }
}

/**
 * End a trace, deferring popTrace to a microtask for value:change events
 * so the trace context survives through React's state batching and into
 * downstream re-renders (e.g., DataSource URL re-evaluation).
 */
function endTrace(traceId: string | undefined, traceKind: string | undefined): void {
  if (!traceId) return;
  if (traceKind === "value:change") {
    Promise.resolve().then(() => popTrace());
  } else {
    popTrace();
  }
}

/**
 * Derive a human-readable displayLabel for a trace event.
 * For value:change, the first arg is the new value (number/string).
 * For focus:change, the first arg is a FocusEvent — use the event name instead.
 */
function traceDisplayLabel(traceKind: string, xmluiName: string, args: any[]): string | undefined {
  if (traceKind === "value:change") {
    const val = args[0];
    if (val == null) return undefined;
    // File or File[] — emit file metadata instead of "[object File]"
    if (typeof File !== "undefined") {
      if (val instanceof File) return val.name;
      if (Array.isArray(val) && val.length > 0 && val[0] instanceof File) {
        return val.map((f: File) => f.name).join(", ");
      }
    }
    // ChangeListener passes { prevValue, newValue } — show a diff summary
    if (typeof val === "object" && val !== null && "prevValue" in val && "newValue" in val) {
      const prev = val.prevValue;
      const next = val.newValue;
      if (Array.isArray(next)) {
        return `${(prev || []).length} → ${next.length} items`;
      }
      try {
        return `${JSON.stringify(prev)?.slice(0, 30)} → ${JSON.stringify(next)?.slice(0, 30)}`;
      } catch {
        return `[object] → [object]`;
      }
    }
    return String(val);
  }
  // For focus events, the arg is a FocusEvent object — not useful as a label
  return undefined;
}

/**
 * Extract file metadata from value:change args for trace enrichment.
 * Returns undefined if the value doesn't contain File objects.
 */
function extractFileMetadata(
  args: any[],
): { files: { name: string; size: number; type: string }[] } | undefined {
  if (typeof File === "undefined") return undefined;
  const val = args[0];
  if (val instanceof File) {
    return { files: [{ name: val.name, size: val.size, type: val.type }] };
  }
  if (Array.isArray(val) && val.length > 0 && val[0] instanceof File) {
    return { files: val.map((f: File) => ({ name: f.name, size: f.size, type: f.type })) };
  }
  return undefined;
}

/**
 * Extract a human-readable display label from a native library event object.
 * Tries common fields in order of specificity. Returns undefined if nothing
 * useful can be extracted, in which case the trace will just show the event type.
 */

/**
 * Creates a complete XMLUI component renderer by automatically bridging
 * XMLUI markup props to React component props.
 *
 * Instead of manually mapping every prop through extractValue, lookupEventHandler,
 * etc., wrapComponent handles the plumbing automatically. You only need to declare
 * the exceptions — which props are booleans, which are events, which need renaming.
 *
 * Everything in node.props that isn't explicitly handled gets forwarded via
 * extractValue() by default, so new props on the native component "just work"
 * without touching the wrapper.
 *
 * @param type - The XMLUI component type name (e.g., "Slider")
 * @param Component - The native React component
 * @param metadata - The component metadata (from createMetadata)
 * @param config - Configuration for prop mapping
 * @returns A ComponentRendererDef ready for registration
 */
export function wrapComponent<TMd extends ComponentMetadata>(
  type: string,
  Component: React.ComponentType<any>,
  metadata: TMd,
  config: WrapComponentConfig = {},
): ComponentRendererDef {
  const {
    booleanSet,
    numberSet,
    stringSet,
    resourceUrlSet,
    eventMap,
    callbackMap,
    renameMap,
    excludeSet,
    templateMap,
    rendererConfigs,
  } = mergeWithMetadata(metadata, config);

  // Collect all specially-handled XMLUI prop names so we can skip them
  // when forwarding the rest.
  const filteredLayoutKeys = layoutOptionKeys.filter((key) => !metadata.props?.[key]);
  const specialProps = new Set([
    ...Object.keys(eventMap),
    ...Object.keys(callbackMap),
    ...resourceUrlSet,
    ...Object.keys(templateMap),
    ...Object.keys(rendererConfigs),
    "id", // handled separately via className/node
    "ref", // XMLUI ref attribute — must never be forwarded as a React string ref
    "style", // XMLUI style attribute contains CSS custom-property strings ("--color: red").
    // The layout processor converts this into the className/inline styles on the
    // wrapper element. Forwarding it as a React prop would pass an invalid string
    // to the native component and cause a React error.
    // Layout props are handled by the layout resolver and applied via CSS className.
    // They must not be forwarded to the native component as React props, because that
    // would pass raw XMLUI theme variable strings (e.g. "$textColor-secondary") to DOM
    // elements or SVG renderers where they are invalid and cause unexpected rendering.
    // Exception: if a layout prop is explicitly declared in the component's metadata props,
    // it has component-specific meaning (e.g. Card's "orientation") and must be forwarded.
    ...filteredLayoutKeys,
    // Responsive variants of layout props (e.g. fontSize-md, backgroundColor-lg)
    // are also layout-only and must not be forwarded to native components.
    ...filteredLayoutKeys.flatMap((key) => MediaBreakpointKeys.map((bp) => `${key}-${bp}`)),
  ]);

  // Detect whether this is a stateful component
  const isStateful =
    config.stateful ?? !!(metadata.props?.["initialValue"] || metadata.events?.["didChange"]);

  if (isStateful) {
    specialProps.add("initialValue");
  }

  // When childrenAsTemplate is active, `data` is consumed internally for iteration
  // and should not be forwarded as a React prop.
  if (metadata.childrenAsTemplate) {
    specialProps.add("data");
    specialProps.add(metadata.childrenAsTemplate);
  }

  // aria-label is handled by the aria-label resolution cascade, not generic forwarding.
  specialProps.add("aria-label");

  // Behavior-consumed props that must never be forwarded to native React components.
  // These are XMLUI framework props handled by auto-attached behaviors (formBindingBehavior,
  // validationBehavior, etc.) or ComponentAdapter. Forwarding them causes React DOM warnings.
  specialProps.add("bindTo");
  specialProps.add("onValidate");
  // bubbleEvents is consumed by ComponentAdapter's useMouseEventHandlers and must
  // never reach native components (it is not a valid HTML attribute).
  specialProps.add("bubbleEvents");
  // updateState is an XMLUI-internal callback and must never be forwarded to
  // native DOM elements (it causes a React prop warning).
  specialProps.add("updateState");
  // The following props are consumed by FormBindingBehavior from node.props directly
  // and must not be forwarded as React props (they are not valid HTML attributes).
  specialProps.add("noSubmit");
  specialProps.add("itemIndex");
  specialProps.add("labelPosition");
  specialProps.add("labelWidth");
  specialProps.add("labelBreak");
  specialProps.add("requireLabelMode");
  specialProps.add("customValidationsDebounce");
  // Validation message/severity props — consumed by FormBindingBehavior only.
  // Components that need them (FormItem) use customRender and extract from node.props directly.
  specialProps.add("requiredInvalidMessage");
  specialProps.add("lengthInvalidMessage");
  specialProps.add("lengthInvalidSeverity");
  specialProps.add("rangeInvalidMessage");
  specialProps.add("rangeInvalidSeverity");
  specialProps.add("patternInvalidMessage");
  specialProps.add("patternInvalidSeverity");
  specialProps.add("regexInvalidMessage");
  specialProps.add("regexInvalidSeverity");
  specialProps.add("validationDisplayDelay");
  specialProps.add("validationMode");
  // Tooltip behavior props — consumed by TooltipBehavior and must not be forwarded
  // to native DOM elements (they are not valid HTML attributes).
  specialProps.add("tooltip");
  specialProps.add("tooltipMarkdown");
  specialProps.add("tooltipOptions");
  // LabelBehavior props — consumed by LabelBehavior. Components that need these
  // natively (e.g. `required` on TextBox) declare them explicitly in their metadata
  // props, which places them in booleanSet/numberSet/stringSet and causes them to
  // be forwarded with proper type conversion (see forwarding loop below).
  specialProps.add("required");
  specialProps.add("shrinkToLabel");
  // PubSubBehavior — consumed by PubSubBehavior only.
  specialProps.add("subscribeToTopic");
  // AnimationBehavior — consumed by AnimationBehavior only.
  specialProps.add("animation");
  specialProps.add("animationOptions");
  // BookmarkBehavior — consumed by BookmarkBehavior only.
  specialProps.add("bookmark");
  specialProps.add("bookmarkLevel");
  specialProps.add("bookmarkTitle");
  specialProps.add("bookmarkOmitFromToc");

  // If the component explicitly declares a prop in its metadata, it owns that prop
  // and it must always be forwarded (even if the same name is also a behavior-consumed
  // prop that was added to specialProps above). Remove any such keys from specialProps.
  // Exception: props handled as templates or renderers must stay in specialProps so
  // the general forwarding loop does not overwrite the rendered output with the raw AST.
  if (metadata.props) {
    for (const propName of Object.keys(metadata.props)) {
      if (propName in templateMap || propName in rendererConfigs) continue;
      specialProps.delete(propName);
    }
  }

  return createComponentRenderer(type, metadata, (context) => {
    const {
      node,
      extractValue,
      extractResourceUrl,
      lookupEventHandler,
      lookupSyncCallback,
      renderChild,
      className,
      classes,
      updateState,
      state,
      registerComponentApi,
    } = context;

    const props: Record<string, any> = {};

    // --- Extract source location for trace enrichment ---
    const nodeSource = (node as any).debug?.source;
    const ownerFileId = nodeSource?.fileId;
    const ownerSource = nodeSource ? { start: nodeSource.start, end: nodeSource.end } : undefined;

    // All tracing (pushTrace, pushXsLog, HoverCapture) is gated on xsVerbose.
    const xsVerbose = context.appContext?.appGlobals?.xsVerbose === true;

    // --- Resolve aria-label cascade ---
    // Computed after prop forwarding (below) but declared here so event handler
    // closures can read the final value when they fire at interaction time.
    let ariaLabel: string | undefined;

    // --- Always pass through XMLUI plumbing ---
    props.className = className;
    props.classes = classes;
    if (config.exposeRegisterApi) {
      props.registerComponentApi = registerComponentApi;
    }
    if (config.passUid) {
      props.uid = extractValue(node.uid);
    }

    if (isStateful) {
      if (config.passUpdateState !== false) {
        props.updateState = updateState;
      }
      props.value = state.value;
      props.initialValue = extractValue(node.props?.initialValue);
    }

    // --- Events (with auto-tracing) ---
    // Emit a semantic behavioral trace event and/or call the XMLUI handler.
    // Only wire up the prop if there is something to do — leaving it undefined
    // preserves native component behaviour that checks `!!onClick` etc.
    for (const [xmluiName, reactPropName] of Object.entries(eventMap)) {
      const handler = lookupEventHandler(xmluiName);
      const traceKind = xsVerbose ? eventNameToTraceKind(xmluiName) : undefined;
      if (!handler && !traceKind) continue;
      props[reactPropName] = (...args: any[]) => {
        // If an interaction trace is active (i- prefix), inherit its traceId
        // so value:change events are grouped with the causing interaction.
        // Don't push/pop the stack in that case — the interaction owns the trace.
        const activeTrace = traceKind ? getCurrentTrace() : undefined;
        const inheritInteraction = activeTrace?.startsWith("i-");
        const traceId = traceKind && !inheritInteraction ? pushTrace() : undefined;
        try {
          let result: any;
          if (handler) {
            result = handler(...args);
          }
          if (traceKind) {
            // For ChangeListener didChange, include prevValue/newValue for diff rendering
            const changeListenerDiff: Record<string, any> = {};
            if (traceKind === "value:change" && args[0] && typeof args[0] === "object" && "prevValue" in args[0] && "newValue" in args[0]) {
              changeListenerDiff.prevValue = args[0].prevValue;
              changeListenerDiff.newValue = args[0].newValue;
            }
            pushXsLog(
              createLogEntry(traceKind, {
                component: type,
                componentLabel: ariaLabel || node.uid || undefined,
                displayLabel: traceDisplayLabel(traceKind, xmluiName, args),
                eventName: xmluiName,
                ariaName: ariaLabel,
                ownerFileId,
                ownerSource,
                ...extractFileMetadata(args),
                ...changeListenerDiff,
              }),
            );
          }
          return result;
        } finally {
          if (traceId) endTrace(traceId, traceKind);
        }
      };
    }

    // --- Sync callbacks ---
    for (const [xmluiName, reactPropName] of Object.entries(callbackMap)) {
      props[reactPropName] = lookupSyncCallback(node.props?.[xmluiName]);
    }

    // --- Dynamic native event capture ---
    // Only enabled per-component via config.captureNativeEvents (not appGlobals).
    const nativeEventsEnabled =
      xsVerbose && config.captureNativeEvents;

    if (nativeEventsEnabled) {
      const xmluiId = node.uid || node.testId;
      props.onNativeEvent = (event: any) => {
        const eventType = event?.type || "unknown";
        const traceKind = `native:${eventType}`;

        // Extract canvas-relative coordinates from the native DOM event.
        // Libraries wrap the MouseEvent at different depths:
        //   ECharts: event.event.event (ZRender wrapper → DOM MouseEvent)
        //   React synthetic: event.nativeEvent
        //   Direct: event.offsetX
        const domEvent =
          event?.event?.event || event?.event?.nativeEvent || event?.event || event?.nativeEvent;
        const offsetX = domEvent?.offsetX ?? event?.offsetX;
        const offsetY = domEvent?.offsetY ?? event?.offsetY;

        // Non-hover events get their own trace
        const traceId = pushTrace();
        popTrace();

        pushXsLog(
          createLogEntry(traceKind, {
            traceId,
            componentType: type,
            componentLabel: ariaLabel || xmluiId || type,
            displayLabel: event?.displayLabel || undefined,
            eventName: eventType,
            ariaName: ariaLabel,
            nativeEvent: event,
            ...(typeof offsetX === "number" && { offsetX, offsetY }),
            ownerFileId,
            ownerSource,
          }),
        );

        // Also fire as an XMLUI event if a handler is registered
        // with the native event name (e.g., legendselectchanged in XMLUI)
        const handler = lookupEventHandler(eventType);
        if (handler) {
          handler(event);
        }
      };
    }

    // --- Resource URL props ---
    for (const key of resourceUrlSet) {
      const rawValue = node.props?.[key];
      props[renameMap[key] ?? key] = rawValue ? extractResourceUrl(rawValue) : undefined;
    }

    // --- Static templates (render ComponentDef props as React nodes) ---
    for (const [xmluiProp, reactProp] of Object.entries(templateMap)) {
      const template = node.props?.[xmluiProp];
      if (template) {
        props[reactProp] = renderChild(template);
      }
    }

    // --- Render-prop templates (ComponentDef → callback with MemoizedItem) ---
    for (const [xmluiProp, rendererConfig] of Object.entries(rendererConfigs)) {
      const template = node.props?.[xmluiProp];
      if (!template) continue;

      const reactProp = rendererConfig.reactProp ?? templateToRendererName(xmluiProp);
      const ctxDef = rendererConfig.contextVars;

      if (typeof ctxDef === "function") {
        props[reactProp] = (...args: any[]) => (
          <MemoizedItem
            node={template}
            contextVars={ctxDef(...args)}
            renderChild={renderChild}
            layoutContext={context.layoutContext}
          />
        );
      } else {
        props[reactProp] = (...args: any[]) => {
          const contextVars: Record<string, any> = {};
          for (let i = 0; i < ctxDef.length; i++) {
            const name = ctxDef[i];
            if (name !== null) {
              contextVars[name] = args[i];
            }
          }
          return (
            <MemoizedItem
              node={template}
              contextVars={contextVars}
              renderChild={renderChild}
              layoutContext={context.layoutContext}
            />
          );
        };
      }
    }

    // --- Content class name for portal components ---
    if (config.contentClassName) {
      props.contentClassName = classes?.[COMPONENT_PART_KEY];
    }

    // --- Forward all remaining node.props ---
    if (node.props) {
      for (const [key, rawValue] of Object.entries(node.props)) {
        if (excludeSet.has(key)) continue;

        // Determine the React prop name (after rename)
        const reactKey = renameMap[key] ?? key;

        // Explicitly-typed props always forward, even if the key is also in
        // specialProps (e.g. `required` is in specialProps to block untyped
        // forwarding, but a component that declares `required: dRequired()` in
        // its metadata gets it forwarded as a proper boolean here).
        if (booleanSet.has(key)) {
          props[reactKey] = extractValue.asOptionalBoolean(rawValue);
        } else if (numberSet.has(key)) {
          props[reactKey] = extractValue.asOptionalNumber(rawValue);
        } else if (stringSet.has(key)) {
          props[reactKey] = extractValue.asOptionalString(rawValue);
        } else if (specialProps.has(key)) {
          // Not an explicitly-typed component prop and in the blocked set → skip.
          continue;
        } else {
          props[reactKey] = extractValue(rawValue);
        }
      }
    }

    // --- Resolve aria-label cascade ---
    // 1. App author's explicit aria-label (always wins)
    // 2. Wrapper author's deriveAriaLabel (pulls from existing props)
    // 3. Metadata defaultAriaLabel (static fallback)
    // 4. Component's label prop (matches browser accessible name computation)
    const explicitAriaLabel = extractValue(node.props?.["aria-label"]);
    ariaLabel =
      explicitAriaLabel ||
      config.deriveAriaLabel?.(props) ||
      metadata.defaultAriaLabel ||
      props.label ||
      undefined;
    if (ariaLabel) {
      props["aria-label"] = ariaLabel;
    }

    // --- Emit data:bind trace when a data prop resolves to an array with changed length ---
    // Placed after aria-label cascade so ariaLabel is available for the trace event.
    if (xsVerbose && Array.isArray(props.data)) {
      const bindKey = node.uid || node.testId || type;
      const w = typeof window !== "undefined" ? (window as any) : {};
      if (!w.__xsDataBindCounts) w.__xsDataBindCounts = {};
      const prevCount = w.__xsDataBindCounts[bindKey];
      const currCount = props.data.length;
      if (prevCount !== currCount && (prevCount !== undefined || currCount > 0)) {
        w.__xsDataBindCounts[bindKey] = currCount;
        pushXsLog(
          createLogEntry("data:bind", {
            component: type,
            componentLabel: ariaLabel || node.uid || undefined,
            ariaName: ariaLabel,
            displayLabel: `${bindKey}: ${prevCount ?? 0} → ${currCount} items`,
            prevCount: prevCount ?? 0,
            rowCount: currCount,
            ownerFileId,
            ownerSource,
          }),
        );
      }
    }

    // --- Render children ---
    let rendered: React.ReactNode;
    if (config.customRender) {
      // Custom rendering: caller handles children and component selection.
      rendered = config.customRender(props, context);
      // customRender builds its own JSX and may not forward aria-label/role
      // from the resolved props. Inject them onto the root element so they
      // always reach the DOM — this is an accessibility concern, not tracing.
      if (rendered && React.isValidElement(rendered)) {
        const inject: Record<string, any> = {};
        if (props["aria-label"] && !(rendered.props as any)["aria-label"]) {
          inject["aria-label"] = props["aria-label"];
        }
        if (props["role"] && !(rendered.props as any)["role"]) {
          inject["role"] = props["role"];
        }
        if (Object.keys(inject).length > 0) {
          rendered = React.cloneElement(rendered, inject);
        }
      }
    } else {
      // When childrenAsTemplate is declared in metadata, children are treated as
      // an item template: the component's `data` prop provides an array and each
      // item is rendered using the template with $item / $itemIndex context vars,
      // matching the pattern used by List, TileGrid, and other data components.
      const templatePropName = metadata.childrenAsTemplate;
      // Skip childrenAsTemplate auto-rendering when the template prop is handled as a renderer
      const templateHandledAsRenderer = templatePropName
        ? templatePropName in rendererConfigs
        : false;
      const data =
        templatePropName && !templateHandledAsRenderer ? extractValue(node.props.data) : undefined;
      if (
        templatePropName &&
        !templateHandledAsRenderer &&
        node.props?.[templatePropName] &&
        Array.isArray(data)
      ) {
        const itemTemplate = node.props[templatePropName];
        const childLayoutCtx = config.childrenLayoutContext
          ? createChildLayoutContext(context.layoutContext, config.childrenLayoutContext)
          : undefined;
        props.children = data.map((item: any, index: number) => (
          <MemoizedItem
            node={itemTemplate as any}
            key={item?.id ?? index}
            renderChild={renderChild}
            layoutContext={childLayoutCtx}
            contextVars={{
              $item: item,
              $itemIndex: index,
              $isFirst: index === 0,
              $isLast: index === data.length - 1,
            }}
          />
        ));
      } else if (
        templatePropName &&
        !templateHandledAsRenderer &&
        node.props?.[templatePropName] &&
        !Array.isArray(data)
      ) {
        // childrenAsTemplate moved children into the template prop, but no data was provided —
        // render the template prop as normal children (inline children mode)
        props.children = renderChild(
          node.props[templatePropName],
          config.childrenLayoutContext
            ? createChildLayoutContext(context.layoutContext, config.childrenLayoutContext)
            : undefined,
        );
      } else if (
        node.children &&
        (Array.isArray(node.children) ? node.children.length > 0 : true)
      ) {
        props.children = renderChild(
          node.children,
          config.childrenLayoutContext
            ? createChildLayoutContext(context.layoutContext, config.childrenLayoutContext)
            : undefined,
        );
      }
      rendered = <Component {...props} />;
    }
    if (nativeEventsEnabled) {
      return (
        <HoverCapture
          componentType={type}
          componentLabel={node.uid || node.testId || type}
          ariaName={ariaLabel}
          ownerFileId={ownerFileId}
          ownerSource={ownerSource}
        >
          {rendered}
        </HoverCapture>
      );
    }
    return rendered;
  });
}

/**
 * Extended configuration for wrapCompound.
 */
export type WrapCompoundConfig = WrapComponentConfig & {
  /** Parse raw initialValue into the component's native format. */
  parseInitialValue?: (raw: any, props: Record<string, any>) => any;
  /** Format external value changes (e.g., clamp to min/max). Defaults to identity. */
  formatExternalValue?: (value: any, props: Record<string, any>) => any;
};

/**
 * Creates a complete XMLUI component renderer that also manages value state
 * lifecycle. Unlike wrapComponent (which passes updateState to the native
 * component), wrapCompound handles local state, initialValue parsing, value
 * syncing, and updateState calls internally via a StateWrapper.
 *
 * The RenderComponent receives:
 * - `value` — current value (already parsed, synced)
 * - `onChange(newValue)` — call to update value
 * - `registerApi(apis)` — call to register component APIs
 * - All other forwarded props (min, max, className, etc.)
 *
 * No XMLUI imports needed in the render component.
 */
export function wrapCompound<TMd extends ComponentMetadata>(
  type: string,
  RenderComponent: React.ComponentType<any>,
  metadata: TMd,
  config: WrapCompoundConfig = {},
): ComponentRendererDef {
  const {
    booleanSet,
    numberSet,
    stringSet,
    eventMap,
    callbackMap,
    renameMap,
    excludeSet,
    templateMap,
    rendererConfigs,
  } = mergeWithMetadata(metadata, config);

  const filteredLayoutKeysCompound = layoutOptionKeys.filter((key) => !metadata.props?.[key]);
  const specialProps = new Set([
    ...Object.keys(eventMap),
    ...Object.keys(callbackMap),
    ...Object.keys(templateMap),
    ...Object.keys(rendererConfigs),
    "id",
    "ref",
    "style", // same reasoning as in wrapComponent
    ...filteredLayoutKeysCompound,
    // Responsive variants of layout props (e.g. fontSize-md, backgroundColor-lg)
    ...filteredLayoutKeysCompound.flatMap((key) => MediaBreakpointKeys.map((bp) => `${key}-${bp}`)),
  ]);

  const isStateful =
    config.stateful ?? !!(metadata.props?.["initialValue"] || metadata.events?.["didChange"]);

  if (isStateful) {
    specialProps.add("initialValue");
  }

  // aria-label is handled by the aria-label resolution cascade, not generic forwarding.
  specialProps.add("aria-label");

  // Behavior-consumed props that must never be forwarded to native React components.
  specialProps.add("bindTo");
  specialProps.add("onValidate");
  // Tooltip behavior props — consumed by TooltipBehavior and must not be forwarded
  // to native DOM elements (they are not valid HTML attributes).
  specialProps.add("tooltip");
  specialProps.add("tooltipMarkdown");
  specialProps.add("tooltipOptions");
  // LabelBehavior props — see wrapComponent for rationale.
  specialProps.add("required");
  specialProps.add("shrinkToLabel");
  // PubSubBehavior, AnimationBehavior, BookmarkBehavior — consumed by their respective behaviors.
  specialProps.add("subscribeToTopic");
  specialProps.add("animation");
  specialProps.add("animationOptions");
  specialProps.add("bookmark");
  specialProps.add("bookmarkLevel");
  specialProps.add("bookmarkTitle");
  specialProps.add("bookmarkOmitFromToc");

  // If the component explicitly declares a prop in its metadata, it owns that prop
  // and it must always be forwarded (even if the same name is also a behavior-consumed
  // prop that was added to specialProps above). Remove any such keys from specialProps.
  if (metadata.props) {
    for (const propName of Object.keys(metadata.props)) {
      specialProps.delete(propName);
    }
  }

  // StateWrapper uses an outer/inner split to solve the stale-closure
  // problem with React.memo.  XMLUI's createComponentRenderer creates new
  // function references (event handlers) on every evaluation, which defeats
  // React.memo's shallow comparison.
  //
  // CallbackSync (outer, NOT memoized):
  //   - Always renders (cheap — just updates a ref and renders child)
  //   - Keeps a ref pointing to the latest function props
  //
  // MemoizedInner (inner, memoized with custom comparison):
  //   - Only re-renders when non-function props change (value, className, etc.)
  //   - Uses the ref from CallbackSync for all callback invocations
  //   - Provides stable onChange/registerApi references to RenderComponent

  const MemoizedInner = React.memo(
    React.forwardRef(
      ({ __callbackRef, __initialValue, __value, ...nativeProps }: any, ref: any) => {
        const [localValue, setLocalValue] = React.useState(() =>
          config.parseInitialValue
            ? config.parseInitialValue(__initialValue, nativeProps)
            : __initialValue,
        );

        // Initial state setup (once on mount)
        const initialized = React.useRef(false);
        React.useEffect(() => {
          if (
            !initialized.current &&
            __callbackRef.current.__updateState &&
            localValue !== undefined
          ) {
            const stateValue =
              Array.isArray(localValue) && localValue.length === 1 ? localValue[0] : localValue;
            __callbackRef.current.__updateState({ value: stateValue }, { initial: true });
            initialized.current = true;
          }
        }, []);

        // Sync external value changes
        React.useEffect(() => {
          if (__value !== undefined) {
            const formatted = config.formatExternalValue
              ? config.formatExternalValue(__value, nativeProps)
              : __value;
            setLocalValue(formatted);
          }
        }, [__value]);

        // onChange: stable reference — delegates to ref for current callback
        const onChange = React.useCallback(
          (newValue: any) => {
            setLocalValue(
              config.formatExternalValue
                ? config.formatExternalValue(newValue, nativeProps)
                : newValue,
            );
            __callbackRef.current.__onDidChange?.(newValue);
          },
          [__callbackRef],
        );

        // API registration: stable reference
        const registerApi = React.useCallback(
          (apis: Record<string, any>) => {
            __callbackRef.current.__registerComponentApi?.(apis);
          },
          [__callbackRef],
        );

        // Build stable wrappers for native event props (onFocus, onBlur, etc.)
        // Created once per event key, delegates to ref for current handler.
        const stableEvents = React.useRef<Record<string, (...args: any[]) => any>>({});
        for (const key of Object.keys(nativeProps)) {
          if (typeof nativeProps[key] === "function" && !stableEvents.current[key]) {
            const eventKey = key;
            stableEvents.current[eventKey] = (...args: any[]) =>
              __callbackRef.current._native?.[eventKey]?.(...args);
          }
        }

        const mergedProps = { ...nativeProps };
        for (const [key, fn] of Object.entries(stableEvents.current)) {
          mergedProps[key] = fn;
        }

        return (
          <RenderComponent
            ref={ref}
            {...mergedProps}
            value={localValue}
            onChange={onChange}
            registerApi={registerApi}
          />
        );
      },
    ),
    (prevProps, nextProps) => {
      // Custom comparison: skip function props and __callbackRef (ref identity is stable).
      // Only re-render when value-type props (className, enabled, placeholder, etc.) change.
      const allKeys = new Set([...Object.keys(prevProps), ...Object.keys(nextProps)]);
      for (const key of allKeys) {
        if (key === "__callbackRef") continue;
        if (typeof prevProps[key] === "function" && typeof nextProps[key] === "function") continue;
        if (prevProps[key] !== nextProps[key]) return false;
      }
      return true;
    },
  );

  // CallbackSync: outer component that keeps the callback ref current.
  // NOT memoized — runs on every XMLUI evaluation (cheap, no DOM work).
  const CallbackSync = React.forwardRef(
    (
      {
        __updateState,
        __initialValue,
        __registerComponentApi,
        __value,
        __onDidChange,
        // onDidChange is the XMLUI-mapped handler for the didChange event — consumed
        // by the state wrapper. It must not be forwarded to the native render component.
        onDidChange: _onDidChange,
        ...nativeProps
      }: any,
      ref: any,
    ) => {
      const callbackRef = React.useRef<any>({
        __onDidChange,
        __updateState,
        __registerComponentApi,
        _native: {},
      });

      // Sync all function props into the ref (runs every render of CallbackSync)
      callbackRef.current.__onDidChange = __onDidChange;
      callbackRef.current.__updateState = __updateState;
      callbackRef.current.__registerComponentApi = __registerComponentApi;

      // Sync native event handlers (onFocus, onBlur, etc.)
      for (const key of Object.keys(nativeProps)) {
        if (typeof nativeProps[key] === "function") {
          callbackRef.current._native[key] = nativeProps[key];
        }
      }

      return (
        <MemoizedInner
          ref={ref}
          __callbackRef={callbackRef}
          __initialValue={__initialValue}
          __value={__value}
          {...nativeProps}
        />
      );
    },
  );

  const StateWrapper = CallbackSync;

  StateWrapper.displayName = `${type}StateWrapper`;

  return createComponentRenderer(type, metadata, (context) => {
    const {
      node,
      extractValue,
      lookupEventHandler,
      lookupSyncCallback,
      renderChild,
      className,
      classes,
      updateState,
      state,
      registerComponentApi,
    } = context;

    const props: Record<string, any> = {};

    // --- Extract source location for trace enrichment ---
    const nodeSource = (node as any).debug?.source;
    const ownerFileId = nodeSource?.fileId;
    const ownerSource = nodeSource ? { start: nodeSource.start, end: nodeSource.end } : undefined;

    // All tracing (pushTrace, pushXsLog, HoverCapture) is gated on xsVerbose.
    const xsVerbose = context.appContext?.appGlobals?.xsVerbose === true;

    // --- Resolve aria-label cascade ---
    let ariaLabel: string | undefined;

    props.className = className;
    props.classes = classes;

    // State-management props go to StateWrapper as __-prefixed internals
    if (isStateful) {
      props.__updateState = updateState;
      props.__value = state.value;
      props.__initialValue = extractValue(node.props?.initialValue);
    }
    props.__registerComponentApi = registerComponentApi;

    // --- Events (with auto-tracing + auto-updateState) ---
    for (const [xmluiName, reactPropName] of Object.entries(eventMap)) {
      const handler = lookupEventHandler(xmluiName);
      const traceKind = xsVerbose ? eventNameToTraceKind(xmluiName) : undefined;

      if (xmluiName === "didChange" && isStateful) {
        // didChange for stateful components: native components call onDidChange(value)
        // directly, so we intercept it here for tracing and XMLUI handler dispatch.
        // When xsVerbose is off and no XMLUI handler, skip — native noop is fine.
        if (traceKind || handler) {
          props.onDidChange = (...args: any[]) => {
            const activeTrace2 = traceKind ? getCurrentTrace() : undefined;
            const inheritInteraction2 = activeTrace2?.startsWith("i-");
            const traceId = traceKind && !inheritInteraction2 ? pushTrace() : undefined;
            try {
              let result: any;
              if (handler) {
                result = handler(...args);
              }
              if (traceKind) {
                pushXsLog(
                  createLogEntry(traceKind, {
                    component: type,
                    componentLabel: ariaLabel || node.uid || undefined,
                    displayLabel: traceDisplayLabel(traceKind, xmluiName, args),
                    eventName: xmluiName,
                    ariaName: ariaLabel,
                    ownerFileId,
                    ownerSource,
                    ...extractFileMetadata(args),
                  }),
                );
              }
              return result;
            } finally {
              if (traceId) endTrace(traceId, traceKind);
            }
          };
        }
        // __onDidChange still needed for the StateWrapper onChange path
        props.__onDidChange = props.onDidChange || ((...args: any[]) => {
          updateState({ value: args[0] });
        });
      } else {
        // Non-didChange events (gotFocus, lostFocus, ChangeListener didChange) pass through as native props
        props[reactPropName] = (...args: any[]) => {
          const traceId = traceKind ? pushTrace() : undefined;
          try {
            let result: any;
            if (handler) {
              result = handler(...args);
            }
            if (traceKind) {
              // For ChangeListener didChange, include prevValue/newValue for diff rendering
              const changeListenerDiff: Record<string, any> = {};
              if (traceKind === "value:change" && args[0] && typeof args[0] === "object" && "prevValue" in args[0] && "newValue" in args[0]) {
                changeListenerDiff.prevValue = args[0].prevValue;
                changeListenerDiff.newValue = args[0].newValue;
              }
              pushXsLog(
                createLogEntry(traceKind, {
                  component: type,
                  componentLabel: ariaLabel || node.uid || undefined,
                  displayLabel: traceDisplayLabel(traceKind, xmluiName, args),
                  eventName: xmluiName,
                  ariaName: ariaLabel,
                  ownerFileId,
                  ownerSource,
                  ...extractFileMetadata(args),
                  ...changeListenerDiff,
                }),
              );
            }
            return result;
          } finally {
            endTrace(traceId, traceKind);
          }
        };
      }
    }

    // --- Sync callbacks ---
    for (const [xmluiName, reactPropName] of Object.entries(callbackMap)) {
      props[reactPropName] = lookupSyncCallback(node.props?.[xmluiName]);
    }

    // --- Dynamic native event capture (same as wrapComponent) ---
    const nativeEventsEnabled =
      xsVerbose && config.captureNativeEvents;

    if (nativeEventsEnabled) {
      const xmluiId = node.uid || node.testId;
      props.onNativeEvent = (event: any) => {
        const eventType = event?.type || "unknown";
        const traceKind = `native:${eventType}`;

        // Extract canvas-relative coordinates from the native DOM event.
        // Libraries wrap the MouseEvent at different depths:
        //   ECharts: event.event.event (ZRender wrapper → DOM MouseEvent)
        //   React synthetic: event.nativeEvent
        //   Direct: event.offsetX
        const domEvent =
          event?.event?.event || event?.event?.nativeEvent || event?.event || event?.nativeEvent;
        const offsetX = domEvent?.offsetX ?? event?.offsetX;
        const offsetY = domEvent?.offsetY ?? event?.offsetY;

        // Non-hover events get their own trace
        const traceId = pushTrace();
        popTrace();

        pushXsLog(
          createLogEntry(traceKind, {
            traceId,
            componentType: type,
            componentLabel: ariaLabel || xmluiId || type,
            displayLabel: event?.displayLabel || undefined,
            eventName: eventType,
            ariaName: ariaLabel,
            nativeEvent: event,
            ...(typeof offsetX === "number" && { offsetX, offsetY }),
            ownerFileId,
            ownerSource,
          }),
        );

        // Also fire as an XMLUI event if a handler is registered
        const handler = lookupEventHandler(eventType);
        if (handler) {
          handler(event);
        }
      };
    }

    // --- Static templates (render ComponentDef props as React nodes) ---
    for (const [xmluiProp, reactProp] of Object.entries(templateMap)) {
      const template = node.props?.[xmluiProp];
      if (template) {
        props[reactProp] = renderChild(template);
      }
    }

    // --- Render-prop templates (ComponentDef → callback with MemoizedItem) ---
    for (const [xmluiProp, rendererConfig] of Object.entries(rendererConfigs)) {
      const template = node.props?.[xmluiProp];
      if (!template) continue;

      const reactProp = rendererConfig.reactProp ?? templateToRendererName(xmluiProp);
      const ctxDef = rendererConfig.contextVars;

      if (typeof ctxDef === "function") {
        props[reactProp] = (...args: any[]) => (
          <MemoizedItem
            node={template}
            contextVars={ctxDef(...args)}
            renderChild={renderChild}
            layoutContext={context.layoutContext}
          />
        );
      } else {
        props[reactProp] = (...args: any[]) => {
          const contextVars: Record<string, any> = {};
          for (let i = 0; i < ctxDef.length; i++) {
            const name = ctxDef[i];
            if (name !== null) {
              contextVars[name] = args[i];
            }
          }
          return (
            <MemoizedItem
              node={template}
              contextVars={contextVars}
              renderChild={renderChild}
              layoutContext={context.layoutContext}
            />
          );
        };
      }
    }

    // --- Content class name for portal components ---
    if (config.contentClassName) {
      props.contentClassName = classes?.[COMPONENT_PART_KEY];
    }

    // --- Forward all remaining node.props ---
    if (node.props) {
      for (const [key, rawValue] of Object.entries(node.props)) {
        if (excludeSet.has(key)) continue;

        const reactKey = renameMap[key] ?? key;

        // Explicitly-typed props always forward even if also in specialProps.
        if (booleanSet.has(key)) {
          props[reactKey] = extractValue.asOptionalBoolean(rawValue);
        } else if (numberSet.has(key)) {
          props[reactKey] = extractValue.asOptionalNumber(rawValue);
        } else if (stringSet.has(key)) {
          props[reactKey] = extractValue.asOptionalString(rawValue);
        } else if (specialProps.has(key)) {
          continue;
        } else {
          props[reactKey] = extractValue(rawValue);
        }
      }
    }

    // --- Resolve aria-label cascade ---
    // Matches browser accessible name computation:
    // 1. Explicit aria-label, 2. Component's deriveAriaLabel, 3. defaultAriaLabel,
    // 4. label prop (associated <label>), 5. placeholder (last resort)
    const explicitAriaLabel = extractValue(node.props?.["aria-label"]);
    ariaLabel =
      explicitAriaLabel ||
      config.deriveAriaLabel?.(props) ||
      metadata.defaultAriaLabel ||
      props.label ||
      extractValue(node.props?.["placeholder"]) ||
      undefined;
    if (ariaLabel) {
      props["aria-label"] = ariaLabel;
    }
    if (xsVerbose) {
      props["data-component-type"] = type;
    }

    const rendered = <StateWrapper {...props} />;
    if (nativeEventsEnabled) {
      return (
        <HoverCapture
          componentType={type}
          componentLabel={node.uid || node.testId || type}
          ariaName={ariaLabel}
          ownerFileId={ownerFileId}
          ownerSource={ownerSource}
        >
          {rendered}
        </HoverCapture>
      );
    }
    return rendered;
  });
}
