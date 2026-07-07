import stackStyles from "../components/Stack/Stack.module.scss";

export function useContentAlignment(
  orientation: string | undefined,
  horizontalAlignment: string | undefined,
  verticalAlignment: string | undefined,
) {
  const normalizedOrientation = orientation === "horizontal" ? "horizontal" : "vertical";
  return {
    horizontal: alignmentClass("horizontal", normalizedOrientation, horizontalAlignment),
    vertical: alignmentClass("vertical", normalizedOrientation, verticalAlignment),
  };
}

function alignmentClass(
  axis: "horizontal" | "vertical",
  orientation: "horizontal" | "vertical",
  value?: string,
): string | undefined {
  const normalized = alignmentValue(value);
  if (!normalized) {
    return undefined;
  }
  const isMainAxis =
    (axis === "horizontal" && orientation === "horizontal") ||
    (axis === "vertical" && orientation === "vertical");
  return stackStyles[`${isMainAxis ? "justify" : "align"}Items${normalized}`];
}

function alignmentValue(value?: string): "Start" | "Center" | "Stretch" | "End" | "Baseline" | undefined {
  switch (value) {
    case "start":
      return "Start";
    case "center":
      return "Center";
    case "stretch":
      return "Stretch";
    case "end":
      return "End";
    case "baseline":
      return "Baseline";
    default:
      return undefined;
  }
}
