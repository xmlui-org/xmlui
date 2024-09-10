import React, { forwardRef, isValidElement, useMemo } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";

import type { ComponentDef, DynamicChildComponentDef } from "@abstractions/ComponentDefs";
import type { ContainerComponentDef } from "@components-core/container/ContainerComponentDef";
import type { CollectedDeclarations } from "@abstractions/scripting/ScriptingSourceTree";
import type { RendererContext } from "@abstractions/RendererDefs";

import { useEvent } from "@components-core/utils/misc";
import { useShallowCompareMemoize } from "./utils/hooks";

type CompoundComponentProps<T extends ComponentDef> = {
  // Definition of the `component` part of the compound component
  compound: ComponentDef;
  // The API of the compound component
  api?: Record<string, string>;
  scriptCollected?: CollectedDeclarations;
} & RendererContext<T>;

// Acts as a bridge between a compound component definition and its renderer.
export const CompoundComponent = forwardRef(
  <T extends ComponentDef>(
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
    }: CompoundComponentProps<T>,
    forwardedRef: React.ForwardedRef<any>,
  ) => {
    // --- Extract property values (resolve binding expressions)
    const resolvedPropsInner = useMemo(() => {
      const resolvedProps: any = {};
      if (node.props) {
        Object.entries(node.props).forEach(([key, value]) => {
          const extractedProp = extractValue(value, true);
          if (extractedProp?._ARROW_EXPR_) {
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

    // --- Resolve child definition (allow children injected through binding expressions)
    const dynamicChildren = useMemo(() => {
      if (Array.isArray(node.children)) {
        return node.children.map((child) => {
          const ret: DynamicChildComponentDef = {
            ...child,
            renderChild,
            childToRender: child,
          };
          return ret;
        });
      }
    }, [node.children, renderChild]);

    const dynamicSlots = useMemo(()=>{
      if (node.slots) {
        const ret = {};
        Object.entries(node.slots).forEach(([key, value]) => {
          ret[key] = value.map((val)=>{
            return {
              ...val,
              renderChild,
              childToRender: val,
            }
          });
        });
        return ret;
      }
    }, [node.slots, renderChild]);

    // --- Wrap the `component` part with a container that manages the
    const containerNode: ContainerComponentDef = useMemo(() => {
      const { loaders, vars, functions, scriptError, ...rest } = compound;
      return {
        type: "Container",
        uses: [],
        api,
        scriptCollected,
        loaders: loaders,
        vars: vars,
        functions: functions,
        scriptError: scriptError,
        containerUid: uid,
        props: {
          debug: compound.props?.debug,
        },
        children: [rest],
      };
    }, [api, compound, scriptCollected, uid]);

    const emitEvent = useEvent((eventName, ...args) => {
      const handler = lookupEventHandler(eventName);

      if (handler) {
        return handler(...args);
      }
    });

    const hasEventHandler = useEvent((eventName) => !!lookupEventHandler(eventName));

    const vars = useMemo(() => {
      return {
        $props: resolvedProps,
        emitEvent,
        hasEventHandler,
        ...containerNode.vars,
      };
    }, [containerNode.vars, emitEvent, hasEventHandler, resolvedProps]);
    const stableVars = useShallowCompareMemoize(vars);

    // --- Inject implicit variable into the container of the compound component
    const nodeWithPropsAndEventsInner = useMemo(() => {
      return {
        ...containerNode,
        vars: stableVars,
      };
    }, [containerNode, stableVars]);

    const nodeWithPropsAndEvents = useShallowCompareMemoize(nodeWithPropsAndEventsInner);

    //we remove the wrapChild prop from layout context, because that wrapping already happened for the compound component instance
    const safeLayoutContext = layoutContext ? { ...layoutContext, wrapChild: undefined } : layoutContext;
    const ret = renderChild(nodeWithPropsAndEvents, safeLayoutContext, dynamicChildren, dynamicSlots);
    if (forwardedRef && ret && isValidElement(ret)) {
      return React.cloneElement(ret, {
        ref: composeRefs(forwardedRef, (ret as any).ref),
      } as any);
    }
    return React.isValidElement(ret) ? ret : <>{ret}</>;
  },
);
CompoundComponent.displayName = "CompoundComponent";