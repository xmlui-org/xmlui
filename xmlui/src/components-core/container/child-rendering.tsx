/**
 * Child Rendering Module
 * 
 * Handles child component rendering with:
 * - Recursive child rendering with proper ref composition
 * - Fragment wrapping for multiple children
 * - Key management for React reconciliation
 * - Props merging for single child elements
 * 
 * Part of Container.tsx refactoring - Step 4
 */

import React, { Fragment, isValidElement, useCallback } from "react";
import { isArray } from "lodash-es";
import { composeRefs } from "@radix-ui/react-compose-refs";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../../abstractions/ContainerDefs";
import type { RenderChildFn, LayoutContext } from "../../abstractions/RendererDefs";
import type { AppContextObject } from "../../abstractions/AppContextDefs";
import type { ParentRenderContext } from "../../abstractions/ComponentDefs";
import type { MemoedVars } from "../abstractions/ComponentRenderer";
import type { LookupAsyncFnInner } from "./action-lookup";
import type { LookupSyncFnInner } from "./action-lookup";
import type { RegisterComponentApiFnInner, ComponentCleanupFn } from "../rendering/ContainerWrapper";
import type { ContainerDispatcher } from "../abstractions/ComponentRenderer";
import { renderChild as renderChildUtil } from "../rendering/renderChild";
import { mergeProps } from "../utils/mergeProps";

/**
 * Configuration for child renderer
 */
export interface ChildRendererConfig {
  // Current component state
  componentState: ContainerState;
  // Global variables available to children
  globalVars?: Record<string, any>;
  // Dispatcher for state updates
  dispatch: ContainerDispatcher;
  // Application context
  appContext: AppContextObject;
  // Function to lookup async actions
  lookupAction: LookupAsyncFnInner;
  // Function to lookup sync callbacks
  lookupSyncCallback: LookupSyncFnInner;
  // Function to register component APIs
  registerComponentApi: RegisterComponentApiFnInner;
  // Callback when state part changes
  statePartChanged: (path: string[], value: any, target: string, action: any) => void;
  // Reference to memoized variables
  memoedVarsRef: React.MutableRefObject<MemoedVars>;
  // Cleanup function
  cleanup: ComponentCleanupFn;
}

/**
 * Creates a stable child renderer function
 */
export function createChildRenderer(config: ChildRendererConfig) {
  const {
    componentState,
    globalVars,
    dispatch,
    appContext,
    lookupAction,
    lookupSyncCallback,
    registerComponentApi,
    statePartChanged,
    memoedVarsRef,
    cleanup,
  } = config;

  const stableRenderChild: RenderChildFn = useCallback(
    (childNode, lc, pRenderContext, uidInfoRef, ref, rest) => {
      // TODO: Check if this is a valid use case
      if (typeof childNode === "string") {
        throw Error("should be resolved for now");
      }

      // --- Make children an array if it's not
      const children = isArray(childNode) ? childNode : [childNode];

      if (!children || !children.length) {
        // --- No child, nothing to render
        return null;
      }

      // --- If there are multiple children, we need to add a `key` to each of them
      const wrapWithFragment = children.length > 1;

      // --- Render each child
      const renderedChildren = children.map((child, childIndex) => {
        if (!child) {
          // --- No child, nothing to render: Should not happen
          return undefined;
        }

        // --- Invoke the renderChild function to render the child. Note that
        // --- in the context, we pass the `stableRenderChild` function, so the child can
        // --- render its children recursively.
        const renderedChild = renderChildUtil({
          node: child,
          state: componentState,
          globalVars,
          dispatch,
          appContext,
          lookupAction,
          lookupSyncCallback,
          registerComponentApi,
          renderChild: stableRenderChild,
          statePartChanged: statePartChanged,
          layoutContext: lc,
          parentRenderContext: pRenderContext,
          memoedVarsRef,
          cleanup,
          uidInfoRef,
        });

        if (renderedChild === undefined) {
          // --- No displayable child, nothing to render
          return undefined;
        }

        // --- Let's process the rendered child
        let rendered = renderedChild;
        const key = `${childIndex}_${child.uid}`;

        if (wrapWithFragment) {
          // --- Add the `key` attribute to the child
          if (React.isValidElement(renderedChild)) {
            // --- React can display this element
            rendered = React.cloneElement(renderedChild, { key });
          } else {
            // --- A simple text node (or alike). We need to wrap it in a `Fragment`
            rendered = <Fragment key={key}>{renderedChild}</Fragment>;
          }
        }

        // --- Done.
        return rendered;
      });

      // --- At this point we have a React node for each child
      if (renderedChildren.length === 1) {
        // --- If we have a single (and valid React element) child, we compose its
        // --- `ref` with the parent's `ref`. This allows the parent to access the child's
        // --- DOM node. Otherwise, we use the child as is.
        return ref && renderedChildren[0] && isValidElement(renderedChildren[0])
          ? React.cloneElement(renderedChildren[0], {
              ref: composeRefs(ref, (renderedChildren[0] as any).ref),
              ...mergeProps(renderedChildren[0].props, rest),
            } as any)
          : renderedChildren[0];
      }

      // --- Done.
      return renderedChildren;
    },
    [
      componentState,
      globalVars,
      dispatch,
      appContext,
      lookupAction,
      lookupSyncCallback,
      registerComponentApi,
      statePartChanged,
      memoedVarsRef,
      cleanup,
    ],
  );

  return {
    stableRenderChild,
  };
}
