import type { ReactNode } from "react";

import type { RendererContext } from "../../abstractions/RendererDefs";
import type { ComponentDef, ComponentMetadata } from "../../abstractions/ComponentDefs";

/**
 * Defines the shape of a component behavior that can wrap a component with
 * additional functionality.
 */
export interface Behavior {
  /**
   * The name of the behavior (e.g., "tooltip", "animation").
   */
  name: string;

  /**
   * A function that determines if the behavior should be applied based on the
   * component's context and props.
   * @param context The renderer context of the component.
   * @param node The component definition.
   * @param metadata The metadata of the component.
   * @returns True if the behavior can be attached, otherwise false.
   */
  canAttach: (context: RendererContext<any>, node: ComponentDef, metadata: ComponentMetadata) => boolean;

  /**
   * A function that attaches the behavior to the component's React node.
   * @param context The renderer context of the component.
   * @param node The React node to attach.
   * @param metadata The metadata of the component.
   * @returns The attached React node.
   */
  attach: (context: RendererContext<any>, node: ReactNode, metadata?: ComponentMetadata) => ReactNode;
}
