import type {
  ComponentDef,
  ComponentMetadata,
  CompoundComponentDef,
} from "../abstractions/ComponentDefs";
import type {
  ComponentRendererFn,
  ComponentRendererDef,
  CompoundComponentRendererInfo,
} from "../abstractions/RendererDefs";
import type { LoaderRenderer, LoaderRendererDef } from "./abstractions/LoaderRenderer";
import { compoundComponentDefFromSource } from "./utils/compound-utils";
import { Parser } from "../parsers/scripting/Parser";
import {
  collectCodeBehindFromSource,
} from "../parsers/scripting/code-behind-collect";

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

/**
 * This helper function creates a user defined component renderer definition from its arguments.
 * @param metadata The metadata of the user-defined component
 * @param componentMarkup The XMLUI markup that defines the user-defined component
 * @param codeBehind Optional code-behind script that contains variable and function definitions 
 * used by the component
 * @returns The view renderer definition composed of the arguments
 */
export function createUserDefinedComponentRenderer<TMd extends ComponentMetadata>(
  metadata: TMd,
  componentMarkup: string,
  codeBehind?: string,
): CompoundComponentRendererInfo {
  // --- Parse the component definition from the markup
  const componentDef = compoundComponentDefFromSource("component", componentMarkup);
  if (!isCompoundComponent(componentDef)) {
    throw new Error("The parsed markup is not a user-defined component.");
  }

  // --- Parse the optional code-behind script
  if (codeBehind && codeBehind.trim().length > 0) {
    const parser = new Parser(codeBehind);
    try {
      parser.parseStatements();
    } catch (e) {
      throw new Error(`Error parsing code-behind script: ${(e as Error).message}`);
    }

    try {
      const collected = collectCodeBehindFromSource("component", codeBehind);
      if (Object.keys(collected.moduleErrors ?? {}).length > 0) {
        throw new Error("Error collecting from code-behind script");
      }

      if (collected.vars) {
        componentDef.component.vars ??= {};
        componentDef.component.vars = { ...componentDef.component.vars, ...collected.vars };
      }
      if (collected.functions) {
        componentDef.component.functions ??= {};
        componentDef.component.functions = { ...componentDef.component.functions, ...collected.functions };
      }
    } catch (e) {
      throw new Error("Error collecting from code-behind script");
    }
  }

  // --- Done.
  return {
    compoundComponentDef: componentDef,
    metadata,
  };
}

function isCompoundComponent(obj: any): obj is CompoundComponentDef {
  return obj && obj.name && typeof obj.name === "string" && obj.component;
}
