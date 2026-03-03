/**
 * Loader Rendering Module
 * 
 * Handles loader component rendering with:
 * - UID uniqueness tracking
 * - Conditional rendering based on "when" expressions
 * - Fragment wrapping with keys
 * - Integration with LoaderComponent
 * 
 * Part of Container.tsx refactoring - Step 4
 */

import React, { Fragment, type MutableRefObject, type RefObject } from "react";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../../abstractions/ContainerDefs";
import type { AppContextObject } from "../../abstractions/AppContextDefs";
import type { MemoedVars, ContainerDispatcher } from "../abstractions/ComponentRenderer";
import type { LookupAsyncFnInner } from "../container/action-lookup";
import type { LookupSyncFnInner } from "../container/action-lookup";
import type { RegisterComponentApiFnInner, ComponentCleanupFn } from "../rendering/ContainerWrapper";
import { LoaderComponent } from "../LoaderComponent";
import { shouldKeep } from "../utils/extractParam";
import { EMPTY_ARRAY } from "../constants";

/**
 * Context object passed to renderLoaders function.
 * Contains all dependencies needed to render loader components.
 */
export interface LoaderRenderContext {
  /** Map tracking UIDs already used in this container */
  uidInfo: Record<string, string>;
  /** Reference to UID information store */
  uidInfoRef: RefObject<Record<string, any>>;
  /** Array of loader component definitions to render */
  loaders?: ComponentDef[];
  /** Current container state */
  componentState: ContainerState;
  /** Container dispatcher for state updates */
  dispatch: ContainerDispatcher;
  /** Application context object */
  appContext: AppContextObject;
  /** Function to register component APIs */
  registerComponentApi: RegisterComponentApiFnInner;
  /** Function to lookup async action handlers */
  lookupAction: LookupAsyncFnInner;
  /** Function to lookup sync callback handlers */
  lookupSyncCallback: LookupSyncFnInner;
  /** Function to cleanup component resources */
  cleanup: ComponentCleanupFn;
  /** Reference to memoized variables */
  memoedVarsRef: MutableRefObject<MemoedVars>;
}

/**
 * Renders loader components with UID tracking and conditional visibility.
 * 
 * Each loader is:
 * - Checked for UID uniqueness within the container
 * - Conditionally rendered based on its "when" expression
 * - Wrapped in a Fragment with a key for React reconciliation
 * 
 * @param context - Loader render context with all dependencies
 * @returns Array of rendered loader React nodes
 */
export function renderLoaders({
  uidInfo,
  uidInfoRef,
  loaders = EMPTY_ARRAY,
  componentState,
  dispatch,
  appContext,
  registerComponentApi,
  lookupAction,
  lookupSyncCallback,
  cleanup,
  memoedVarsRef,
}: LoaderRenderContext) {
  return loaders.map((loader: ComponentDef, index: number) => {
    // --- Check for the uniqueness of UIDs
    if (loader?.uid) {
      if (uidInfo[loader.uid]) {
        // --- We have a duplicated ID (another loader)
        throw new Error(
          `Another ${uidInfo[loader.uid]} definition in this container already uses the uid '${loader.uid}'`,
        );
      }
      uidInfo[loader.uid] = "loader";
      uidInfoRef.current[loader.uid] = {
        type: "loader",
        value: "loaderValue",
        uid: loader.uid,
      };
    }

    // --- Render the current loader
    const renderedLoader = renderLoader({
      loader,
      componentState,
      dispatch,
      appContext,
      registerComponentApi,
      lookupAction,
      lookupSyncCallback,
      memoedVarsRef,
      cleanup,
    });

    // --- Skip loaders with rendering errors
    if (renderedLoader === undefined) {
      return undefined;
    }

    // --- Take care to use a key property for the loader
    return <Fragment key={loader.uid ?? index}>{renderedLoader}</Fragment>;
  });
}

/**
 * Renders a single loader component.
 * 
 * Checks the loader's "when" condition and uses LoaderComponent for rendering.
 * 
 * @param params - Loader rendering parameters
 * @returns Rendered loader React node or null if not visible
 */
function renderLoader({
  loader,
  componentState,
  dispatch,
  appContext,
  registerComponentApi,
  lookupAction,
  lookupSyncCallback,
  cleanup,
  memoedVarsRef,
}: {
  loader: ComponentDef;
  componentState: ContainerState;
  dispatch: ContainerDispatcher;
  appContext: AppContextObject;
  registerComponentApi: RegisterComponentApiFnInner;
  lookupAction: LookupAsyncFnInner;
  lookupSyncCallback: LookupSyncFnInner;
  cleanup: ComponentCleanupFn;
  memoedVarsRef: MutableRefObject<MemoedVars>;
}) {
  // --- For the sake of avoiding further issues
  if (!loader) {
    return null;
  }

  // --- Evaluate "when" to decide if the loader should be rendered
  // --- Render only visible components
  if (!shouldKeep(loader.when, componentState, appContext)) {
    return null;
  }

  // --- Use the loader type's renderer function
  return (
    <LoaderComponent
      onUnmount={cleanup}
      node={loader}
      state={componentState}
      dispatch={dispatch}
      registerComponentApi={registerComponentApi}
      lookupAction={lookupAction}
      lookupSyncCallback={lookupSyncCallback}
      memoedVarsRef={memoedVarsRef}
      appContext={appContext}
    />
  );
}
