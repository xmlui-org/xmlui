import React, { forwardRef, isValidElement, useMemo } from "react";
import type { LayoutContext } from "../abstractions/RendererDefs";
import { composeRefs } from "@radix-ui/react-compose-refs";

import type { ComponentDef } from "../abstractions/ComponentDefs";
import { pushXsLog, getCurrentTrace } from "./inspector/inspectorUtils";
import type { ContainerWrapperDef } from "./rendering/ContainerWrapper";
import type { CollectedDeclarations } from "./script-runner/ScriptingSourceTree";
import type { RendererContext } from "../abstractions/RendererDefs";
import { isArrowExpressionObject } from "../abstractions/InternalMarkers";
import { useEvent } from "./utils/misc";
import { useShallowCompareMemoize } from "./utils/hooks";
import { isArray, isObject } from "lodash-es";
import { mergeProps } from "./utils/mergeProps";
import { layoutOptionKeys } from "./descriptorHelper";
import {
  CompoundDepthContext,
  CompoundRecursionError,
  DEFAULT_MAX_COMPOUND_DEPTH,
  extractMinimalCycle,
  useCompoundDepth,
} from "./CompoundComponentDepthContext";

// Tracks component types that have already emitted the layout-forward warning
// so the warning fires only once per type (development builds only).
const warnedLayoutForwardTypes = new Set<string>();

type CompoundComponentProps = {
  // Definition of the `component` part of the compound component
  compound: ComponentDef;
  // The API of the compound component
  api?: Record<string, any>;
  scriptCollected?: CollectedDeclarations;
} & RendererContext;

// Acts as a bridge between a compound component definition and its renderer.
export const CompoundComponent = forwardRef(
  (
    {
      node,
      lookupSyncCallback,
      lookupEventHandler,
      compound,
      api,
      scriptCollected,
      renderChild,
      extractValue,
      layoutContext,
      uid,
      updateState,
      registerComponentApi,
      extractResourceUrl,
      appContext,
      state,
      lookupAction,
      contextVars, // Extract contextVars to prevent it from being passed to DOM elements
      globalVars,
      // Strip XMLUI-internal props that must never be forwarded to inner DOM elements
      logInteraction: _logInteraction,
      classes: _classes,
      ...restProps
    }: CompoundComponentProps,
    forwardedRef: React.ForwardedRef<any>,
  ) => {
    // --- Defence-in-depth: cap nested UDC rendering before the browser locks
    // up on unbounded recursion (a UDC referencing itself or forming a cycle
    // with another UDC without a terminating `when`). The configured limit
    // can be overridden by the runtime via `appGlobals.maxCompoundDepth`.
    const parentDepthInfo = useCompoundDepth();
    const myType = node?.type ?? compound?.type ?? "<anonymous>";
    const maxDepth =
      typeof appContext?.appGlobals?.maxCompoundDepth === "number"
        ? appContext.appGlobals.maxCompoundDepth
        : DEFAULT_MAX_COMPOUND_DEPTH;
    const nextDepth = parentDepthInfo.depth + 1;
    if (nextDepth > maxDepth) {
      // Extract the minimal cycle from the full chain so the message is short
      // and readable (e.g. "MyButton → MyText → MyButton") rather than 256
      // repeated entries.
      const fullChain = [...parentDepthInfo.stack, myType];
      throw new CompoundRecursionError(extractMinimalCycle(fullChain));
    }
    const nextDepthInfo = useMemo(
      () => ({ stack: [...parentDepthInfo.stack, myType], depth: nextDepth }),
      [parentDepthInfo.stack, myType, nextDepth],
    );

    // --- Extract property values (resolve binding expressions)
    const resolvedPropsInner = useMemo(() => {
      const resolvedProps: any = {};
      if (node.props) {
        Object.entries(node.props).forEach(([key, value]) => {
          const extractedProp = extractValue(value, true);
          if (isArrowExpressionObject(extractedProp)) {
            // --- Ensure arrow functions are called synchronously
            resolvedProps[key] = lookupSyncCallback(extractedProp);
          } else {
            resolvedProps[key] = extractedProp;
          }
        });
      }
      return resolvedProps;
    }, [extractValue, lookupSyncCallback, node.props]);

    const resolvedProps = useShallowCompareMemoize(resolvedPropsInner);

    // --- Wrap the `component` part with a container that manages the
    const containerNode: ContainerWrapperDef = useMemo(() => {
      const { loaders, vars, functions, scriptError, ...rest } = compound;

      // Extract global variable keys from globalVars to set as 'uses'
      // This ensures the compound component only inherits globals, not parent's local vars
      const globalKeys = globalVars
        ? Object.keys(globalVars).filter((k) => !k.startsWith("__"))
        : undefined;

      return {
        type: "Container",
        api,
        scriptCollected,
        loaders: loaders,
        vars,
        functions: functions,
        scriptError: scriptError,
        containerUid: uid,
        uses: globalKeys, // Only inherit global variables, not local parent vars
        props: {
          debug: (compound as any).debug || (compound.props as any)?.debug,
        },
        children: [rest],
      };
    }, [api, compound, scriptCollected, uid, globalVars]);

    const emitEvent = useEvent((eventName, ...args) => {
      const handler = lookupEventHandler(eventName);

      // Log emitEvent calls when inspector is enabled
      if (appContext?.appGlobals?.xsVerbose === true) {
        pushXsLog({
          ts: Date.now(),
          perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
          traceId: getCurrentTrace(),
          kind: "emitEvent",
          eventName,
          componentType: compound?.type,
          componentLabel: uid?.description,
          eventArgs: args?.length ? args : undefined,
        });
      }

      if (handler) {
        return handler(...args);
      }
    });

    const hasEventHandler = useEvent((eventName) => !!lookupEventHandler(eventName));

    const vars = useMemo(() => {
      return {
        $props: resolvedProps,
        ...containerNode.vars,
        emitEvent,
        hasEventHandler,
        updateState,
      };
    }, [containerNode.vars, emitEvent, hasEventHandler, resolvedProps, updateState]);
    const stableVars = useShallowCompareMemoize(vars);

    // --- Inject implicit variable into the container of the compound component
    const nodeWithPropsAndEventsInner = useMemo(() => {
      return {
        ...containerNode,
        vars: stableVars,
      };
    }, [containerNode, stableVars]);

    const nodeWithPropsAndEvents = useShallowCompareMemoize(nodeWithPropsAndEventsInner);

    const hasTemplateProps = useMemo(() => {
      return Object.entries(node.props).some(([key, value]) => {
        return (
          //TODO this is a hack, we should have a better way to detect template props
          key.endsWith("Template") ||
          (isObject(value) && (value as any).type !== undefined) ||
          (isArray(value) && (value as any)[0]?.type !== undefined)
        );
      });
    }, [node.props]);

    const memoedParentRenderContext = useMemo(() => {
      if (!hasTemplateProps && (!node.children || node.children.length === 0)) {
        return undefined;
      }
      return {
        renderChild,
        props: node.props,
        children: node.children,
      };
    }, [hasTemplateProps, node.children, node.props, renderChild]);

    // Remove the wrapChild prop from layout context, because that wrapping already happened
    // for the compound component instance. When the compound component has a layout className
    // (e.g. width="200px"), pass it as extraClassName so ComponentAdapter of the single root
    // child can include it in its own className — making layout props flow automatically.
    const extraClassName = restProps.className;
    const safeLayoutContext: LayoutContext | undefined = extraClassName
      ? { ...(layoutContext ?? {}), wrapChild: undefined, extraClassName }
      : layoutContext
        ? { ...layoutContext, wrapChild: undefined }
        : layoutContext;
    const ret = renderChild(nodeWithPropsAndEvents, safeLayoutContext, memoedParentRenderContext);

    // Development warning: layout props on the call site cannot be forwarded when the
    // compound component's template produces multiple root children.
    // The parser wraps multiple root children in a synthetic "Fragment" node,
    // so compound.type === "Fragment" reliably indicates this case.
    if (import.meta.env.DEV && extraClassName) {
      if (compound.type === "Fragment") {
        const usedLayoutProps = layoutOptionKeys.filter((key) => key in node.props);
        if (usedLayoutProps.length > 0 && !warnedLayoutForwardTypes.has(node.type)) {
          warnedLayoutForwardTypes.add(node.type);
          console.warn(
            `[XMLUI] Component '${node.type}' has layout props (${usedLayoutProps.join(", ")}) ` +
              `but its template has multiple root children — layout props cannot be forwarded. ` +
              `Wrap the template content in a single root element to enable layout forwarding.`,
          );
        }
      }
    }

    if (forwardedRef && ret && isValidElement(ret)) {
      return (
        <CompoundDepthContext.Provider value={nextDepthInfo}>
          {React.cloneElement(ret, {
            ref: composeRefs(forwardedRef, (ret as any).ref),
            ...mergeProps(ret.props, restProps),
          } as any)}
        </CompoundDepthContext.Provider>
      );
    }
    return (
      <CompoundDepthContext.Provider value={nextDepthInfo}>
        {React.isValidElement(ret) ? ret : <>{ret}</>}
      </CompoundDepthContext.Provider>
    );
  },
);

// --- Display a name for the component in developer tools
CompoundComponent.displayName = "CompoundComponent";
