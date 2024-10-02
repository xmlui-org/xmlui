import React, { forwardRef, isValidElement, useMemo } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";

import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ContainerComponentDef } from "@components-core/container/ContainerComponentDef";
import type { CollectedDeclarations } from "@abstractions/scripting/ScriptingSourceTree";
import type { RendererContext } from "@abstractions/RendererDefs";

import { useEvent } from "@components-core/utils/misc";
import { useShallowCompareMemoize } from "./utils/hooks";
import { isArray, isObject } from "lodash-es";

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

    // --- NI
    const flattenedPropsInner = useMemo(() => {
      const resolvedProps: any = {};
      if (node.props) {
        Object.entries(node.props).forEach(([key, value]) => {
          const extractedProp = extractValue(value, true);
          if (extractedProp?._ARROW_EXPR_) {
            // --- Ensure arrow functions are called synchronously
            resolvedProps[`$${key}`] = lookupSyncCallback(extractedProp);
          } else {
            resolvedProps[`$${key}`] = extractedProp;
          }
        });
      }
      return resolvedProps;
    }, [extractValue, lookupSyncCallback, node.props]);

    const resolvedProps = useShallowCompareMemoize(resolvedPropsInner);

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
          debug: (compound.props as any)?.debug,
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
      if ((!node.children || node.children.length === 0) && !hasTemplateProps) {
        return undefined;
      }
      return {
        renderChild,
        props: node.props,
        children: node.children,
      };
    }, [hasTemplateProps, node.children, node.props, renderChild]);

    //we remove the wrapChild prop from layout context, because that wrapping already happened for the compound component instance
    const safeLayoutContext = layoutContext
      ? { ...layoutContext, wrapChild: undefined }
      : layoutContext;
    const ret = renderChild(nodeWithPropsAndEvents, safeLayoutContext, memoedParentRenderContext);
    if (forwardedRef && ret && isValidElement(ret)) {
      return React.cloneElement(ret, {
        ref: composeRefs(forwardedRef, (ret as any).ref),
      } as any);
    }
    return React.isValidElement(ret) ? ret : <>{ret}</>;
  },
);
CompoundComponent.displayName = "CompoundComponent";
