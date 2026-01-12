import type { Dispatch, MutableRefObject, RefObject } from "react";

import type { AppContextObject } from "../../abstractions/AppContextDefs";
import type { LookupAsyncFnInner, LookupSyncFnInner } from "../../abstractions/ActionDefs";
import type { CodeDeclaration } from "../script-runner/ScriptingSourceTree";
import type { ComponentMetadata, ParentRenderContext } from "../../abstractions/ComponentDefs";
import type { ComponentRendererContextBase } from "../../abstractions/RendererDefs";
import type { ContainerState, RegisterComponentApiFnInner } from "../rendering/ContainerWrapper";
import type { ComponentApi } from "../../abstractions/ApiDefs";
import type { ContainerAction } from "../rendering/containers";

// This interface defines the renderer context for the XMLUI core framework
// components. Its implementations are used only within the component core.
export interface InnerRendererContext<T extends ComponentMetadata = ComponentMetadata>
  extends ComponentRendererContextBase<T> {
  // The dispatcher function to change the state of the component
  dispatch: ContainerDispatcher;

  // The function to register a component API
  registerComponentApi: RegisterComponentApiFnInner;

  // The function to obtain a synchronous action handler
  lookupSyncCallback: LookupSyncFnInner;

  // The function to obtain an async action handler
  lookupAction: LookupAsyncFnInner;

  // The memoized variables (with their values) used in the component
  memoedVarsRef: MutableRefObject<MemoedVars>;

  parentRenderContext?: ParentRenderContext;

  uidInfoRef?: RefObject<Record<string, any>>;
}

// This property is a redux-style dispatcher that manages state changes in a container.
export type ContainerDispatcher = Dispatch<ContainerAction>;

// This type represents a map of objects providing access to memoed variables within the
// container of a particular component. The key is an expression; the value is an
// accessor object.
export type MemoedVars = Map<
  any,
  {
    getDependencies: (
      value: string | CodeDeclaration,
      referenceTrackedApi: Record<string, ComponentApi>,
    ) => Array<string>;
    obtainValue: (
      expression: any,
      state: ContainerState,
      appContext: AppContextObject | undefined,
      strict: boolean | undefined,
      stateDeps: Record<string, any>,
      appContextDeps: Record<string, any>,
    ) => any;
  }
>;
