import type { ComponentDef, ComponentMetadata } from "../abstractions/ComponentDefs";
import type { ComponentRendererFn, ComponentRendererDef } from "../abstractions/RendererDefs";
import type { LoaderRenderer, LoaderRendererDef } from "./abstractions/LoaderRenderer";

/**
 * This helper function creates a component renderer definition from its arguments.
 * @param type The unique identifier of the component definition
 * @param renderer The function that renders the component definition into a React node
 * @param metadata Optional hints to help fix the rendering errors coming from invalid component property definitions
 * @returns The view renderer definition composed of the arguments
 */
export function createComponentRenderer<TMd extends ComponentMetadata>(
  type: string,
  metadata: TMd,
  renderer: ComponentRendererFn<ComponentDef<any>>,
): ComponentRendererDef {
  return {
    type,
    renderer,
    metadata,
  };
}

/**
 * Create a non-visual component used for encapsulating property values
 * @param type Component type
 * @param metadata Component metadata
 */
export function createPropHolderComponent<TMd extends ComponentMetadata>(
  type: string,
  metadata?: TMd,
) {
  return createComponentRenderer(type, metadata, () => {
    throw new Error("Prop holder component, shouldn't render");
  });
}

/**
 * AppEngine uses React as its UI framework to declare and render loaders. This type declares a function that renders
 * a particular loader definition into its React representation.
 *
 * The type parameter of the function refers to the loader definition the function is about to render.
 * @param type The unique ID of the loader
 * @param renderer The function that renders the loader
 * @param hints Optional hints to help fix the rendering errors coming from invalid component property definitions
 */
export function createLoaderRenderer<TMd extends ComponentMetadata>(
  type: string,
  renderer: LoaderRenderer<TMd>,
  hints?: TMd,
): LoaderRendererDef {
  return {
    type,
    renderer,
    hints,
  };
}
