import { parseLayoutProperty } from "../../components-core/theming/parse-layout-props";

const FLOW_LAYOUT_PROPS = new Set(["width", "minWidth", "maxWidth"]);

type ExtractValueWithSize = ((v: any) => any) & { asSize?: (v: any) => any };

/**
 * Extracts responsive variants of width/minWidth/maxWidth from a node's props.
 * Returns a flat map like `{ "width-md": "50%", "maxWidth-lg": "400px" }` with
 * evaluated values. Returns undefined when no responsive variants are found.
 */
export function collectResponsiveWidthProps(
  props: Record<string, any> | undefined,
  extractValue: ExtractValueWithSize,
): Record<string, any> | undefined {
  if (!props) return undefined;
  let result: Record<string, any> | undefined;
  const resolve = extractValue.asSize ?? extractValue;
  for (const key of Object.keys(props)) {
    const parsed = parseLayoutProperty(key);
    if (typeof parsed === "string" || parsed.component || parsed.part) continue;
    if (
      FLOW_LAYOUT_PROPS.has(parsed.property) &&
      parsed.screenSizes &&
      parsed.screenSizes.length > 0
    ) {
      if (!result) result = {};
      result[key] = resolve(props[key]);
    }
  }
  return result;
}
