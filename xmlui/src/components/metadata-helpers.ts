export {
  createMetadata,
  dClick,
  dContextMenu,
  dGotFocus,
  dLostFocus,
} from "../component-core/metadata/helpers";

export function dOrientation(defaultValue?: string) {
  return {
    description: "This optional string determines the component orientation.",
    valueType: "string" as const,
    availableValues: ["horizontal", "vertical"],
    defaultValue,
  };
}
