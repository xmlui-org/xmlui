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
    return args[0] != null ? String(args[0]) : undefined;
  }
  // For focus events, the arg is a FocusEvent object — not useful as a label
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
  const eventMap = normalizeEvents(config.events);
  const callbackMap = normalizeCallbacks(config.callbacks);
  const renameMap = config.rename ?? {};
  const booleanSet = new Set(config.booleans ?? []);
  const numberSet = new Set(config.numbers ?? []);
  const stringSet = new Set(config.strings ?? []);
  const excludeSet = new Set(config.exclude ?? []);

  // Collect all specially-handled XMLUI prop names so we can skip them
  // when forwarding the rest.
  const specialProps = new Set([
    ...Object.keys(eventMap),
    ...Object.keys(callbackMap),
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
      lookupEventHandler,
      lookupSyncCallback,
      className,
      updateState,
      state,
      registerComponentApi,
    } = context;

    const props: Record<string, any> = {};

    // --- Always pass through XMLUI plumbing ---
    props.className = className;
    props.registerComponentApi = registerComponentApi;

    if (isStateful) {
      props.updateState = updateState;
      props.value = state.value;
      props.initialValue = extractValue(node.props?.initialValue);
    }

    // --- Events (with auto-tracing) ---
    // Always emit a semantic behavioral trace event, regardless of whether
    // the XMLUI app defined a handler. This traces what the user did
    // (e.g. "slider moved to 75") not what code ran.
    for (const [xmluiName, reactPropName] of Object.entries(eventMap)) {
      const handler = lookupEventHandler(xmluiName);
      const traceKind = eventNameToTraceKind(xmluiName);
      props[reactPropName] = (...args: any[]) => {
        if (traceKind) {
          pushXsLog(createLogEntry(traceKind, {
            component: type,
            displayLabel: traceDisplayLabel(traceKind, xmluiName, args),
            eventName: xmluiName,
            ariaName: extractValue(node.props?.["aria-label"]) || undefined,
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
        }));

        // Also fire as an XMLUI event if a handler is registered
        // with the native event name (e.g., legendselectchanged in XMLUI)
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
  const eventMap = normalizeEvents(config.events);
  const callbackMap = normalizeCallbacks(config.callbacks);
  const renameMap = config.rename ?? {};
  const booleanSet = new Set(config.booleans ?? []);
  const numberSet = new Set(config.numbers ?? []);
  const stringSet = new Set(config.strings ?? []);
  const excludeSet = new Set(config.exclude ?? []);

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

  // StateWrapper: a React component that manages value state lifecycle,
  // then renders the user's RenderComponent with processed props.
  const StateWrapper = React.memo(React.forwardRef((
    { __updateState, __initialValue, __registerComponentApi,
      __value, __onDidChange, ...nativeProps }: any,
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
      if (!initialized.current && __updateState && localValue !== undefined) {
        // Unwrap single-element arrays for XMLUI state
        const stateValue = Array.isArray(localValue) && localValue.length === 1
          ? localValue[0] : localValue;
        __updateState({ value: stateValue }, { initial: true });
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

    // onChange: update local state, fire traced callback
    const onChange = React.useCallback((newValue: any) => {
      setLocalValue(
        config.formatExternalValue
          ? config.formatExternalValue(newValue, nativeProps)
          : newValue
      );
      __onDidChange?.(newValue);
    }, [__onDidChange]);

    // API registration helper
    const registerApi = React.useCallback((apis: Record<string, any>) => {
      __registerComponentApi?.(apis);
    }, [__registerComponentApi]);

    return (
      <RenderComponent
        ref={ref}
        {...nativeProps}
        value={localValue}
        onChange={onChange}
        registerApi={registerApi}
      />
    );
  }));

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
              displayLabel: traceDisplayLabel(traceKind, xmluiName, args),
              eventName: xmluiName,
              ariaName: extractValue(node.props?.["aria-label"]) || undefined,
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
              displayLabel: traceDisplayLabel(traceKind, xmluiName, args),
              eventName: xmluiName,
              ariaName: extractValue(node.props?.["aria-label"]) || undefined,
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
