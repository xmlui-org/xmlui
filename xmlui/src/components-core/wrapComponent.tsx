import React from "react";
import type { ComponentMetadata } from "../abstractions/ComponentDefs";
import type { ComponentRendererDef } from "../abstractions/RendererDefs";
import { createComponentRenderer } from "./renderers";
import { pushXsLog, createLogEntry } from "./inspector/inspectorUtils";

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
      if (booleanSet.has(propName) || numberSet.has(propName) || stringSet.has(propName) || resourceUrlSet.has(propName)) continue;
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

  return {
    booleanSet,
    numberSet,
    stringSet,
    resourceUrlSet,
    eventMap,
    callbackMap: normalizeCallbacks(config.callbacks),
    renameMap: config.rename ?? {},
    excludeSet: new Set(config.exclude ?? []),
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
 * Derive a human-readable displayLabel for a trace event.
 * For value:change, the first arg is the new value (number/string).
 * For focus:change, the first arg is a FocusEvent — use the event name instead.
 */
function traceDisplayLabel(
  traceKind: string,
  xmluiName: string,
  args: any[],
): string | undefined {
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
    return String(val);
  }
  // For focus events, the arg is a FocusEvent object — not useful as a label
  return undefined;
}

/**
 * Extract file metadata from value:change args for trace enrichment.
 * Returns undefined if the value doesn't contain File objects.
 */
function extractFileMetadata(args: any[]): { files: { name: string; size: number; type: string }[] } | undefined {
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
  const { booleanSet, numberSet, stringSet, resourceUrlSet, eventMap, callbackMap, renameMap, excludeSet } =
    mergeWithMetadata(metadata, config);

  // Collect all specially-handled XMLUI prop names so we can skip them
  // when forwarding the rest.
  const specialProps = new Set([
    ...Object.keys(eventMap),
    ...Object.keys(callbackMap),
    ...resourceUrlSet,
    "id", // handled separately via className/node
  ]);

  // Detect whether this is a stateful component
  const isStateful =
    config.stateful ??
    !!(metadata.props?.["initialValue"] || metadata.events?.["didChange"]);

  if (isStateful) {
    specialProps.add("initialValue");
  }

  return createComponentRenderer(type, metadata, (context) => {
    const {
      node,
      extractValue,
      extractResourceUrl,
      lookupEventHandler,
      lookupSyncCallback,
      className,
      updateState,
      state,
      registerComponentApi,
    } = context;

    const props: Record<string, any> = {};

    // --- Extract source location for trace enrichment ---
    const nodeSource = (node as any).debug?.source;
    const ownerFileId = nodeSource?.fileId;
    const ownerSource = nodeSource ? { start: nodeSource.start, end: nodeSource.end } : undefined;

    // --- Always pass through XMLUI plumbing ---
    props.className = className;
    props.registerComponentApi = registerComponentApi;

    if (isStateful) {
      props.updateState = updateState;
      props.value = state.value;
      props.initialValue = extractValue(node.props?.initialValue);
    }

    // --- Events (with auto-tracing) ---
    // Emit a semantic behavioral trace event and/or call the XMLUI handler.
    // Only wire up the prop if there is something to do — leaving it undefined
    // preserves native component behaviour that checks `!!onClick` etc.
    for (const [xmluiName, reactPropName] of Object.entries(eventMap)) {
      const handler = lookupEventHandler(xmluiName);
      const traceKind = eventNameToTraceKind(xmluiName);
      if (!handler && !traceKind) continue;
      props[reactPropName] = (...args: any[]) => {
        if (traceKind) {
          pushXsLog(createLogEntry(traceKind, {
            component: type,
            componentLabel: node.uid || node.testId || undefined,
            displayLabel: traceDisplayLabel(traceKind, xmluiName, args),
            eventName: xmluiName,
            ariaName: extractValue(node.props?.["aria-label"]) || undefined,
            ownerFileId,
            ownerSource,
            ...extractFileMetadata(args),
          }));
        }
        if (handler) {
          return handler(...args);
        }
      };
    }

    // --- Sync callbacks ---
    for (const [xmluiName, reactPropName] of Object.entries(callbackMap)) {
      props[reactPropName] = lookupSyncCallback(node.props?.[xmluiName]);
    }

    // --- Dynamic native event capture ---
    // When captureNativeEvents is enabled (per-component config or appGlobals),
    // pass an onNativeEvent callback that the render component can call with
    // any native library event. The event flows into the trace system automatically.
    if (config.captureNativeEvents || context.appContext?.appGlobals?.captureNativeEvents) {
      const xmluiId = node.uid || node.testId;
      props.onNativeEvent = (event: any) => {
        const eventType = event?.type || "unknown";
        const traceKind = `native:${eventType}`;
        pushXsLog(createLogEntry(traceKind, {
          componentType: type,
          componentLabel: xmluiId || type,
          displayLabel: event?.displayLabel || undefined,
          eventName: eventType,
          ariaName: extractValue(node.props?.["aria-label"]) || undefined,
          nativeEvent: event,
          ownerFileId,
          ownerSource,
        }));

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

    // --- Forward all remaining node.props ---
    if (node.props) {
      for (const [key, rawValue] of Object.entries(node.props)) {
        if (specialProps.has(key)) continue;
        if (excludeSet.has(key)) continue;

        // Determine the React prop name (after rename)
        const reactKey = renameMap[key] ?? key;

        // Extract with the appropriate type converter
        if (booleanSet.has(key)) {
          props[reactKey] = extractValue.asOptionalBoolean(rawValue);
        } else if (numberSet.has(key)) {
          props[reactKey] = extractValue.asOptionalNumber(rawValue);
        } else if (stringSet.has(key)) {
          props[reactKey] = extractValue.asOptionalString(rawValue);
        } else {
          props[reactKey] = extractValue(rawValue);
        }
      }
    }

    return <Component {...props} />;
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
  const { booleanSet, numberSet, stringSet, eventMap, callbackMap, renameMap, excludeSet } =
    mergeWithMetadata(metadata, config);

  const specialProps = new Set([
    ...Object.keys(eventMap),
    ...Object.keys(callbackMap),
    "id",
  ]);

  const isStateful =
    config.stateful ??
    !!(metadata.props?.["initialValue"] || metadata.events?.["didChange"]);

  if (isStateful) {
    specialProps.add("initialValue");
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

  const MemoizedInner = React.memo(React.forwardRef((
    { __callbackRef, __initialValue, __value, ...nativeProps }: any,
    ref: any,
  ) => {
    const [localValue, setLocalValue] = React.useState(() =>
      config.parseInitialValue
        ? config.parseInitialValue(__initialValue, nativeProps)
        : __initialValue
    );

    // Initial state setup (once on mount)
    const initialized = React.useRef(false);
    React.useEffect(() => {
      if (!initialized.current && __callbackRef.current.__updateState && localValue !== undefined) {
        const stateValue = Array.isArray(localValue) && localValue.length === 1
          ? localValue[0] : localValue;
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
    const onChange = React.useCallback((newValue: any) => {
      setLocalValue(
        config.formatExternalValue
          ? config.formatExternalValue(newValue, nativeProps)
          : newValue
      );
      __callbackRef.current.__onDidChange?.(newValue);
    }, [__callbackRef]);

    // API registration: stable reference
    const registerApi = React.useCallback((apis: Record<string, any>) => {
      __callbackRef.current.__registerComponentApi?.(apis);
    }, [__callbackRef]);

    // Build stable wrappers for native event props (onFocus, onBlur, etc.)
    // Created once per event key, delegates to ref for current handler.
    const stableEvents = React.useRef<Record<string, (...args: any[]) => any>>({});
    for (const key of Object.keys(nativeProps)) {
      if (typeof nativeProps[key] === 'function' && !stableEvents.current[key]) {
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
  }), (prevProps, nextProps) => {
    // Custom comparison: skip function props and __callbackRef (ref identity is stable).
    // Only re-render when value-type props (className, enabled, placeholder, etc.) change.
    const allKeys = new Set([...Object.keys(prevProps), ...Object.keys(nextProps)]);
    for (const key of allKeys) {
      if (key === '__callbackRef') continue;
      if (typeof prevProps[key] === 'function' && typeof nextProps[key] === 'function') continue;
      if (prevProps[key] !== nextProps[key]) return false;
    }
    return true;
  });

  // CallbackSync: outer component that keeps the callback ref current.
  // NOT memoized — runs on every XMLUI evaluation (cheap, no DOM work).
  const CallbackSync = React.forwardRef((
    { __updateState, __initialValue, __registerComponentApi,
      __value, __onDidChange, ...nativeProps }: any,
    ref: any,
  ) => {
    const callbackRef = React.useRef<any>({ __onDidChange, __updateState, __registerComponentApi, _native: {} });

    // Sync all function props into the ref (runs every render of CallbackSync)
    callbackRef.current.__onDidChange = __onDidChange;
    callbackRef.current.__updateState = __updateState;
    callbackRef.current.__registerComponentApi = __registerComponentApi;

    // Sync native event handlers (onFocus, onBlur, etc.)
    for (const key of Object.keys(nativeProps)) {
      if (typeof nativeProps[key] === 'function') {
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
  });

  const StateWrapper = CallbackSync;

  StateWrapper.displayName = `${type}StateWrapper`;

  return createComponentRenderer(type, metadata, (context) => {
    const {
      node,
      extractValue,
      lookupEventHandler,
      lookupSyncCallback,
      className,
      updateState,
      state,
      registerComponentApi,
    } = context;

    const props: Record<string, any> = {};

    // --- Extract source location for trace enrichment ---
    const nodeSource = (node as any).debug?.source;
    const ownerFileId = nodeSource?.fileId;
    const ownerSource = nodeSource ? { start: nodeSource.start, end: nodeSource.end } : undefined;

    props.className = className;

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
      const traceKind = eventNameToTraceKind(xmluiName);

      if (xmluiName === "didChange" && isStateful) {
        // didChange is special: StateWrapper's onChange calls this.
        // It traces, calls updateState, and calls the XMLUI handler.
        props.__onDidChange = (...args: any[]) => {
          if (traceKind) {
            pushXsLog(createLogEntry(traceKind, {
              component: type,
              componentLabel: node.uid || node.testId || undefined,
              displayLabel: traceDisplayLabel(traceKind, xmluiName, args),
              eventName: xmluiName,
              ariaName: extractValue(node.props?.["aria-label"]) || extractValue(node.props?.["placeholder"]) || undefined,
              ownerFileId,
              ownerSource,
              ...extractFileMetadata(args),
            }));
          }
          updateState({ value: args[0] });
          if (handler) {
            return handler(...args);
          }
        };
      } else {
        // Non-didChange events (gotFocus, lostFocus) pass through as native props
        props[reactPropName] = (...args: any[]) => {
          if (traceKind) {
            pushXsLog(createLogEntry(traceKind, {
              component: type,
              componentLabel: node.uid || node.testId || undefined,
              displayLabel: traceDisplayLabel(traceKind, xmluiName, args),
              eventName: xmluiName,
              ariaName: extractValue(node.props?.["aria-label"]) || extractValue(node.props?.["placeholder"]) || undefined,
              ownerFileId,
              ownerSource,
              ...extractFileMetadata(args),
            }));
          }
          if (handler) {
            return handler(...args);
          }
        };
      }
    }

    // --- Sync callbacks ---
    for (const [xmluiName, reactPropName] of Object.entries(callbackMap)) {
      props[reactPropName] = lookupSyncCallback(node.props?.[xmluiName]);
    }

    // --- Dynamic native event capture (same as wrapComponent) ---
    if (config.captureNativeEvents || context.appContext?.appGlobals?.captureNativeEvents) {
      const xmluiId = node.uid || node.testId;
      props.onNativeEvent = (event: any) => {
        const eventType = event?.type || "unknown";
        const traceKind = `native:${eventType}`;
        pushXsLog(createLogEntry(traceKind, {
          componentType: type,
          componentLabel: xmluiId || type,
          displayLabel: event?.displayLabel || undefined,
          eventName: eventType,
          ariaName: extractValue(node.props?.["aria-label"]) || undefined,
          nativeEvent: event,
          ownerFileId,
          ownerSource,
        }));

        // Also fire as an XMLUI event if a handler is registered
        const handler = lookupEventHandler(eventType);
        if (handler) {
          handler(event);
        }
      };
    }

    // --- Forward all remaining node.props ---
    if (node.props) {
      for (const [key, rawValue] of Object.entries(node.props)) {
        if (specialProps.has(key)) continue;
        if (excludeSet.has(key)) continue;

        const reactKey = renameMap[key] ?? key;

        if (booleanSet.has(key)) {
          props[reactKey] = extractValue.asOptionalBoolean(rawValue);
        } else if (numberSet.has(key)) {
          props[reactKey] = extractValue.asOptionalNumber(rawValue);
        } else if (stringSet.has(key)) {
          props[reactKey] = extractValue.asOptionalString(rawValue);
        } else {
          props[reactKey] = extractValue(rawValue);
        }
      }
    }

    return <StateWrapper {...props} />;
  });
}
