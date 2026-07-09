import type { ComponentMetadata } from "../abstractions/ComponentDefs";
import type { ComponentExtension } from "../extensions";

export function createPropHolderComponent<TMd extends ComponentMetadata>(
  type: string,
  metadata?: TMd,
): ComponentExtension {
  return {
    name: type,
    description: metadata?.description,
    props: Object.keys(metadata?.props ?? {}),
    acceptsArbitraryProps: metadata?.allowArbitraryProps,
    allowsChildren: true,
    component: () => {
      throw new Error("Prop holder component, shouldn't render");
    },
  };
}
