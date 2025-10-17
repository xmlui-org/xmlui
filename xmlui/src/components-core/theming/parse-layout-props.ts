import type { MediaBreakpointType} from "../../abstractions/AppContextDefs";
import { MediaBreakpointKeys } from "../../abstractions/AppContextDefs";

export type ParsedLayout = {
  property: string;
  part?: string;
  component?: string;
  screenSizes?: MediaBreakpointType[];
  states?: string[];
}

/**
 * Mapping exceptions for camelCase property names to CSS property names.
 * These properties don't follow the standard camelCase-to-kebab-case conversion.
 */
export const CSS_PROPERTY_EXCEPTIONS: Record<string, string> = {
  textColor: "color",
  paddingVertical: "",
  paddingHorizontal: "",
  marginVertical: "",
  marginHorizontal: "",
  borderVertical: "",
  borderHorizontal: "",
};

export function parseLayoutProperty(prop: string, parseComponent: boolean = false): ParsedLayout | string {
  if (!prop || typeof prop !== 'string') {
    return "Property string cannot be empty";
  }

  // Split by '--' to separate states from the rest
  const parts = prop.split('--');
  const mainPart = parts[0];
  const stateParts = parts.slice(1);

  // Validate state names
  const states: string[] = [];
  for (const statePart of stateParts) {
    if (!statePart) {
      return "State name cannot be empty";
    }
    if (!isValidName(statePart)) {
      return `Invalid state name: ${statePart}`;
    }
    states.push(statePart);
  }

  // Split main part by '-' to get segments
  const segments = mainPart.split('-').filter(segment => segment.length > 0);
  
  if (segments.length === 0) {
    return "CSS property name is required";
  }

  // The first segment is always the CSS property name (camelCase, no dashes)
  const property = segments[0];
  
  // Validate CSS property name (camelCase)
  if (!isValidPropertyName(property)) {
    return `Invalid CSS property name: ${property}`;
  }

  const result: ParsedLayout = {
    property,
    states: states.length > 0 ? states : undefined
  };

  let segmentIndex = 1;
  const screenSizes: MediaBreakpointType[] = [];

  // Process remaining segments
  while (segmentIndex < segments.length) {
    const segment = segments[segmentIndex];
    
    // Check if it's a screen size
    if (isMediaBreakpoint(segment)) {
      screenSizes.push(segment as MediaBreakpointType);
      segmentIndex++;
      continue;
    }

    // Check if it's a component name (starts with uppercase)
    if (isComponentName(segment)) {
      if (!parseComponent) {
        return `Component names are not allowed when parseComponent is false: ${segment}`;
      }
      if (result.component) {
        return "Multiple component names found";
      }
      result.component = segment;
      segmentIndex++;
      continue;
    }

    // Check if it's a part name (starts with lowercase)
    if (isValidPartName(segment)) {
      if (result.part) {
        return "Multiple part names found";
      }
      result.part = segment;
      segmentIndex++;
      continue;
    }

    // If we reach here, the segment is invalid
    return `Invalid segment: ${segment}`;
  }

  // Set screen sizes if any were found
  if (screenSizes.length > 0) {
    result.screenSizes = screenSizes;
  }

  return result;
}

/**
 * Transforms a camelCase property name (as used in ParsedLayout.property) 
 * to its corresponding CSS style property name.
 * 
 * Handles special cases defined in CSS_PROPERTY_EXCEPTIONS, otherwise
 * converts camelCase to kebab-case (e.g., "fontSize" -> "font-size").
 * 
 * @param property - The camelCase property name from ParsedLayout
 * @returns The CSS property name in kebab-case or the mapped exception
 * 
 * @example
 * toCssPropertyName('fontSize') // returns 'font-size'
 * toCssPropertyName('textColor') // returns 'color' (exception)
 * toCssPropertyName('backgroundColor') // returns 'background-color'
 */
export function toCssPropertyName(property: string): string {
  // Check if there's a mapping exception
  if (property in CSS_PROPERTY_EXCEPTIONS) {
    return CSS_PROPERTY_EXCEPTIONS[property];
  }

  // Convert camelCase to kebab-case
  return property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function isValidPropertyName(name: string): boolean {
  // CSS property names in camelCase - start with lowercase letter, can contain letters and numbers
  return /^[a-z][a-zA-Z0-9]*$/.test(name);
}

function isValidName(name: string): boolean {
  // Names start with a letter and can contain letters, numbers, or underscores
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);
}

function isValidPartName(name: string): boolean {
  // Part names start with lowercase letter and can contain letters, numbers, or underscores
  return /^[a-z][a-zA-Z0-9_]*$/.test(name);
}

function isComponentName(name: string): boolean {
  // Component names start with uppercase letter
  return /^[A-Z][a-zA-Z0-9_]*$/.test(name);
}

function isMediaBreakpoint(value: string): boolean {
  return MediaBreakpointKeys.includes(value as MediaBreakpointType);
}

