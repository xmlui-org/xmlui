import type { ReactNode } from "react";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import type { ContainerDispatcher } from "./ComponentRenderer";
import type { ContainerState } from "../container/ContainerComponentDef";
import type { LookupAsyncFn } from "@abstractions/ActionDefs";
import type { ComponentDefNew, ComponentMetadata } from "@abstractions/ComponentDefs";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";

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
  hints?: ComponentDescriptor<any>;
}

export type LoaderInProgressChangedFn = (isInProgress: boolean) => void;
export type LoaderLoadedFn = (data: any, pageInfo?: any) => void;
export type LoaderErrorFn = (error: any) => void;

// The context in which a particular component is rendered
type RendererContext<TMd extends ComponentMetadata> = {
  // The definition of the loader
  loader: ComponentDefNew<TMd>;

  // Loader state
  state: ContainerState;

  // Dispatcher function to change the state of the component
  dispatch: ContainerDispatcher;

  registerComponentApi: RegisterComponentApiFn;
  lookupAction: LookupAsyncFn;

  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
};
