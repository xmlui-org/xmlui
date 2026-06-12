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
import {
  buildScopeGate,
  narrowCapabilities,
  parseCapabilityList,
  validateUdcPropReferences,
  type UdcContract,
  type UdcDiagnostic,
} from "./udc-sandbox";

// Tracks component types that have already emitted the layout-forward warning
// so the warning fires only once per type (development builds only).
const warnedLayoutForwardTypes = new Set<string>();

type CompoundComponentProps = {
  // Definition of the `component` part of the compound component
  compound: ComponentDef;
  // The API of the compound component
  api?: Record<string, any>;
  scriptCollected?: CollectedDeclarations;
  contract?: UdcContract;
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
      contract,
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
      typeof appContext?.xmluiConfig?.maxCompoundDepth === "number"
        ? appContext.xmluiConfig.maxCompoundDepth
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

    // Items-loop and context variables that must propagate through the UDC boundary.
    // The UDC container uses narrowing which blocks local context vars,
    // so $item/$itemIndex/$isFirst/$isLast/$context would otherwise be invisible inside the
    // UDC template and break logic (e.g. form bindings or context menus).
    const PROPAGATED_CONTEXT_VARS = ["$item", "$itemIndex", "$isFirst", "$isLast", "$context"] as const;

    const udcContract = contract ?? ((compound as any).contract as UdcContract | undefined);
    // W8-1 (plan #14): strict UDC sandbox is on by default.  Authors must
    // explicitly opt out with `strictUdcSandbox={false}` in `xmluiConfig`
    // to fall back to warn-only diagnostics.
    const strictUdcSandbox =
      appContext?.xmluiConfig?.strictUdcSandbox !== false ||
      (udcContract?.trust === "untrusted" && appContext?.xmluiConfig?.udcTrust === "strict");

    const emitUdcDiagnostic = useEvent((diagnostic: UdcDiagnostic) => {
      pushXsLog({
        ts: Date.now(),
        perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
        traceId: getCurrentTrace(),
        kind: "udc",
        trust: udcContract?.trust,
        ...diagnostic,
      });
      if (diagnostic.severity === "error") {
        console.error(`[XMLUI UDC] ${diagnostic.message}`);
      } else if (diagnostic.severity === "warn") {
        console.warn(`[XMLUI UDC] ${diagnostic.message}`);
      }
    });

    const effectiveContract = useMemo(() => {
      if (!udcContract) return undefined;
      const requestedCapabilities = node.props?.capabilities;
      if (typeof requestedCapabilities !== "string") {
        return udcContract;
      }
      const narrowed = narrowCapabilities(
        udcContract,
        parseCapabilityList(requestedCapabilities),
        strictUdcSandbox,
      );
      narrowed.diagnostics.forEach(emitUdcDiagnostic);
      return narrowed.contract;
    }, [udcContract, emitUdcDiagnostic, node.props?.capabilities, strictUdcSandbox]);

    if (effectiveContract) {
      validateUdcPropReferences(compound as any, strictUdcSandbox, emitUdcDiagnostic);
      if (effectiveContract.trust === "untrusted") {
        const trustMode = appContext?.xmluiConfig?.udcTrust;
        const missingDeclarations =
          effectiveContract.props.size === 0 &&
          effectiveContract.events.size === 0 &&
          effectiveContract.methods.size === 0 &&
          effectiveContract.slots.size === 0;
        if (
          trustMode === "review" ||
          trustMode === "strict" ||
          missingDeclarations ||
          !effectiveContract.capabilitiesDeclared
        ) {
          emitUdcDiagnostic({
            code: "udc-untrusted-violation",
            severity:
              trustMode === "strict" ||
              missingDeclarations ||
              !effectiveContract.capabilitiesDeclared
                ? "error"
                : "warn",
            udc: effectiveContract.name,
            message: `UDC "${effectiveContract.name}" is untrusted and requires review before use.`,
            data: {
              trust: effectiveContract.trust,
              capabilities: Array.from(effectiveContract.capabilities),
              missingDeclarations,
              capabilitiesDeclared: effectiveContract.capabilitiesDeclared === true,
            },
          });
        }
      }
    }

    const emitEvent = useEvent((eventName, ...args) => {
      const handler = lookupEventHandler(eventName);

      // Log emitEvent calls when inspector is enabled
      if (appContext?.xmluiConfig?.xsVerbose === true) {
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

    const propagatedContextVars = useMemo(() => {
      if (!contextVars) return undefined;
      const result: Record<string, any> = {};
      let hasAny = false;
      for (const key of PROPAGATED_CONTEXT_VARS) {
        if (key in contextVars) {
          result[key] = contextVars[key];
          hasAny = true;
        }
      }
      return hasAny ? result : undefined;
    }, [contextVars]);

    // --- Wrap the `component` part with a container that manages the
    const containerNode: ContainerWrapperDef = useMemo(() => {
      // Discard any stale `computedUses` from `compound` so the runtime restructure (wrap-in-Container)
      // doesn't propagate an obsolete static-analysis result. See computed-uses-specification.md §5.
      //
      // `computedGlobalUses` is LIFTED (not discarded). Unlike `computedUses`, it is NOT
      // stale after the restructure: Globals.xs lives in the global-vars layer regardless
      // of where local vars sit, so the set of globals the body reads is unchanged when
      // vars move to this wrapper. Forwarding the body's annotation onto the wrapper gives
      // UDC instances the same global-narrowing benefit as static containers — without
      // it, every UDC wrapper would receive ALL parentGlobalVars and re-render whenever
      // any unrelated global changes. See TODO-computedGlobalUses-improvements.md §8.
      const {
        loaders,
        vars,
        functions,
        scriptError,
        computedUses: _staleComputedUses,
        computedGlobalUses,
        ...rest
      } = compound;

      // Extract global variable keys from globalVars to set as 'uses'
      // This ensures the compound component only inherits globals, not parent's local vars
      const globalKeys = globalVars
        ? Object.keys(globalVars).filter((k) => !k.startsWith("__"))
        : undefined;

      const gate = effectiveContract
        ? buildScopeGate(
            effectiveContract,
            strictUdcSandbox,
            Object.keys(propagatedContextVars ?? {}),
          )
        : undefined;
      const scopeDiagnostics: UdcDiagnostic[] = [];
      const scopedGlobalKeys = globalKeys?.filter((key) => {
        if (!gate || gate.canRead(key)) return true;
        const diagnostic = gate.createDiagnostic(key);
        scopeDiagnostics.push(diagnostic);
        if (diagnostic.severity !== "error") return false;
        gate.assertCanRead(key);
        return false;
      });
      scopeDiagnostics.forEach(emitUdcDiagnostic);

      return {
        type: "Container",
        api,
        scriptCollected,
        loaders: loaders,
        vars,
        functions: functions,
        scriptError: scriptError,
        containerUid: uid,
        uses: scopedGlobalKeys, // Only inherit permitted globals, not local parent vars
        computedGlobalUses, // Lifted from body — see comment above
        udcContract: effectiveContract,
        props: {
          debug: (compound as any).debug || (compound.props as any)?.debug,
        },
        children: [rest],
      };
    }, [
      api,
      compound,
      effectiveContract,
      emitUdcDiagnostic,
      propagatedContextVars,
      scriptCollected,
      strictUdcSandbox,
      uid,
      globalVars,
    ]);

    const vars = useMemo(() => {
      return {
        $props: resolvedProps,
        ...propagatedContextVars,
        ...containerNode.vars,
        emitEvent,
        hasEventHandler,
        updateState,
      };
    }, [
      containerNode.vars,
      emitEvent,
      hasEventHandler,
      propagatedContextVars,
      resolvedProps,
      updateState,
    ]);
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
