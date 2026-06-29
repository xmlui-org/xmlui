import type { MediaBreakpointType } from "../../abstractions/AppContextDefs";
import { MediaBreakpointKeys } from "../../abstractions/AppContextDefs";

export type ParsedLayout = {
  property: string;
  part?: string;
  component?: string;
  screenSizes?: MediaBreakpointType[];
  states?: string[];
};

export function parseLayoutProperty(prop: string): ParsedLayout | string {
  if (!prop || typeof prop !== "string") {
    return "Property string cannot be empty";
  }

  const [mainPart, ...stateParts] = prop.split("--");
  const segments = mainPart.split("-").filter(Boolean);
  if (segments.length === 0) {
    return "CSS property name is required";
  }

  const property = segments[0];
  const screenSizes: MediaBreakpointType[] = [];
  for (const segment of segments.slice(1)) {
    if (MediaBreakpointKeys.includes(segment as MediaBreakpointType)) {
      screenSizes.push(segment as MediaBreakpointType);
    } else if (/^[A-Z]/.test(segment)) {
      return { property, component: segment };
    } else {
      return { property, part: segment };
    }
  }

  return {
    property,
    screenSizes: screenSizes.length > 0 ? screenSizes : undefined,
    states: stateParts.length > 0 ? stateParts : undefined,
  };
}
