import type { ReactNode } from "react";

import type { LookupAsyncFn, LookupSyncFn } from "../../abstractions/ActionDefs";
import type { ComponentDef, ComponentMetadata } from "../../abstractions/ComponentDefs";
import type { RegisterComponentApiFn, ValueExtractor } from "../../abstractions/RendererDefs";
import type { ContainerState } from "../rendering/ContainerWrapper";
import type { ContainerDispatcher } from "./ComponentRenderer";

// This function renders a loader definition into a React component
export type LoaderRenderer<TMd extends ComponentMetadata> = (
  context: RendererContext<TMd>,
) => ReactNode;

// Defines the traits of a loader renderer
export interface LoaderRendererDef {
  // The loader's type identifier
  type: string;

  // The renderer function of the loader
  renderer: LoaderRenderer<any>;

  // Loader descriptor
  hints?: ComponentMetadata;
}

export type LoaderInProgressChangedFn = (isInProgress: boolean) => void;
export type LoaderLoadedFn = (data: any, pageInfo?: any) => void;
export type LoaderErrorFn = (error: any) => void;
export type TransformResultFn = (data: any) => any;

// The context in which a particular component is rendered
type RendererContext<TMd extends ComponentMetadata> = {
  // The definition of the loader
  loader: ComponentDef<TMd>;

  // Loader state
  state: ContainerState;

  // Dispatcher function to change the state of the component
  dispatch: ContainerDispatcher;

  registerComponentApi: RegisterComponentApiFn;
  extractValue: ValueExtractor;
  lookupAction: LookupAsyncFn;
  lookupSyncCallback: LookupSyncFn;

  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderIsRefetchingChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
};
