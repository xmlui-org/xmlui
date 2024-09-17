import type { ComponentDef, CompoundComponentDef } from "@abstractions/ComponentDefs";

import { parseParameterString } from "./script-runner/ParameterParser";
import { Parser } from "@parsers/scripting/Parser";
import { layoutOptionKeys } from "./descriptorHelper";
import { viewportSizeNames } from "@components/abstractions";

type IsValidFunction<T> = (propKey: string, propValue: T) => string | string[] | undefined | null;

// --- This interface reperesent an object that can handle component metadata.
// --- As the metadata format may change in the futue, this interface is used to
// --- abstract the metadata handling.
export interface MetadataHandler {
  componentRegistered: (componentName: string) => boolean;
  getComponentProps: (componentName: string) => PropDescriptorHash;
  getComponentEvents: (componentName: string) => Record<string, any>;
  acceptArbitraryProps: (componentName: string) => boolean;
  getComponentValidator: (componentName: string) => ComponentValidator | void;
}

export type PropDescriptor = {
  type?: string;
  availableValues?: any[];
  defaultValue?: any;
  isValid?: IsValidFunction<any>;
};

export type PropDescriptorHash = Record<string, PropDescriptor>;

export type ComponentValidator = (instance: ComponentDef, devMode?: boolean) => string | string[] | null;

type VisitResult = { cancel?: boolean; abort?: boolean };

/**
 * This function checks the XMLUI markup for potential issues. It retrieves
 * a list of errors and warnings.
 * @param rootDef Root component definition
 * @param components Components referenced in the XMLUI markup
 * @param devMode Indicates if the check is performed in development mode
 * @returns List of errors and warnings
 */
export function checkXmlUiMarkup(
  rootDef: ComponentDef | null,
  components: CompoundComponentDef[],
  metadataHandler: MetadataHandler,
  devMode?: boolean,
): MarkupCheckResult[] {
  const errorsCollected: MarkupCheckResult[] = [];

  // --- Initialize the check
  const continuation: VisitResult = {};
  const componentIdsCollected = new Set<string>();
  const compoundIdsCollected = new Set<string>();

  // --- Visit the root component
  if (rootDef) {
    visitComponent(rootDef, null, componentDefVisitor, continuation);
  }

  // --- Visit the compound components
  if (!continuation.abort) {
    for (const component of components) {
      // --- Rule: Compound component name must be a valid JavaScript identifier
      if (!isValidIdentifier(component.name)) {
        reportError("M007", "Component", component.name);
      }
      // --- Rule: Compound component name cannot be 'Component'
      if (component.name === "Component") {
        reportError("M008", "Component", component.name);
      }

      // --- Rule: Compound component must not have the name of a registered component
      if (metadataHandler.componentRegistered(component.name)) {
        reportError("M009", "Component", component.name);
      }

      // --- Rule: Compound component name must be unique
      if (compoundIdsCollected.has(component.name)) {
        reportError("M010", "Component", component.name);
      } else {
        compoundIdsCollected.add(component.name);
      }

      // --- Reset component ID scope
      componentIdsCollected.clear();
      // --- Visit the compount component's definition
      visitComponent(component.component as ComponentDef, null, componentDefVisitor, continuation);
    }
  }

  // --- Done.
  return errorsCollected;

  // --- This visitor checks the rules for a particular component
  function componentDefVisitor(
    def: ComponentDef,
    parent: ComponentDef | null | undefined,
    before: boolean,
    continuation: VisitResult,
  ): void {
    // --- This is the visitor function to check a ComponentDef markup
    if (!before) {
      // --- Do not visit the component definition ater its children have been visited
      return;
    }

    // --- Rule: Component name must be registered
    if (!metadataHandler.componentRegistered(def.type)) {
      reportError("M001", parent?.type ?? "Root", def.type);
      continuation.cancel = true;
      return;
    }

    // --- Rule: an ID must be a valid JavaScript identifier
    if (def.uid) {
      if (!isValidIdentifier(def.uid)) {
        reportError("M002", def.type, def.type, def.uid);
      } else if (componentIdsCollected.has(def.uid)) {
        reportError("M003", def.type, def.uid);
      } else {
        componentIdsCollected.add(def.uid);
      }
    }

    // --- Check all props of the component
    const propDescriptors = metadataHandler.getComponentProps(def.type) ?? {};
    const currentProps = def.props ?? {};
    for (const propName of Object.keys(currentProps)) {
      const propDescriptor = propDescriptors[propName];

      // --- Rule: The property must be defined in the component descriptor or be a layout option
      // --- or the component must accept arbitrary properties
      if (propDescriptor) {
        // --- The property has a descriptor, so it is allowed.
        // --- Rule: The property value must be parseable
        const propValue = currentProps[propName];
        if (typeof propValue === "string") {
          try {
            parseParameterString(propValue);
          } catch (error) {
            reportError("M006", def.type, propName, (error as any).message);
          }
        }
      } else {
        // --- The property has no descriptor.
        const propParts = propName.split("-");

        // --- Check for a layout property
        const validProp =
          // --- Layout property
          (propParts.length === 1 && layoutOptionKeys.includes(propName)) ||
          // --- Layout property with viewport size
          (propParts.length === 2 &&
            layoutOptionKeys.includes(propParts[0]) &&
            viewportSizeNames.includes(propParts[1])) ||
          // --- Arbitrary property is allowed
          metadataHandler.acceptArbitraryProps(def.type);

        if (!validProp) {
          // --- The component does not accept arbitrary properties and
          // --- the property is not a layout option
          reportError("M005", def.type, def.type, propName);
        }
      }
    }

    // --- Check all events of the component
    const eventDescriptors = metadataHandler.getComponentEvents(def.type) ?? {};
    const currentEvents = def.events ?? {};
    for (const eventName of Object.keys(currentEvents)) {
      const eventDescriptor = eventDescriptors[eventName];

      // --- Rule: The event must be defined in the component descriptor
      if (eventDescriptor) {
        // --- The event has a descriptor, so it is allowed.
        const eventValue = currentEvents[eventName];
        if (typeof eventValue === "string") {
          // --- Rule: The event value must be parseable
          const parser = new Parser(eventValue);
          try {
            parser.parseStatements();
            if (parser.errors.length > 0) {
              reportError("M012", def.type, eventName, parser.errors[0].text);
            }
          } catch (error) {
            reportError("M012", def.type, eventName, (error as any).message);
          }
        }
      } else {
        reportError("M011", def.type, def.type, eventName);
      }
    }

    // --- Check the component validator
    const componentValidator = metadataHandler.getComponentValidator(def.type);
    if (componentValidator) {
      const validationErrors = componentValidator(def, devMode);
      if (validationErrors) {
        if (Array.isArray(validationErrors)) {
          for (const error of validationErrors) {
            reportError("M013", def.type, error);
          }
        } else {
          reportError("M013", def.type, validationErrors);
        }
      }
    }
  }

  // --- This function visits a component, its nested components and children
  function visitComponent(
    def: ComponentDef,
    parent: ComponentDef | null | undefined,
    visitor: (
      def: ComponentDef,
      parent: ComponentDef | null | undefined,
      before: boolean,
      continuation: VisitResult,
    ) => void,
    continuation: VisitResult,
  ): void {
    // --- Visit the component (before)
    visitor(def, parent, true, continuation);
    if (continuation.abort || continuation.cancel) {
      // --- Stop the visit
      return;
    }

    // --- Visit the properties with "ComponentDef" value
    const propDescriptors = metadataHandler.getComponentProps(def.type) ?? {};
    const currentProps = def.props ?? {};
    for (const propName in Object.keys(currentProps)) {
      const propDescriptor = propDescriptors[propName];
      if (!propDescriptor) {
        // --- No descriptor for the property, skip it
        continue;
      }

      const propValue = currentProps[propName];
      if (propDescriptor.type === "ComponentDef" && propValue.type) {
        // --- This property holds a nested component, visit it
        visitComponent(propValue, def, visitor, continuation);
        if (continuation.abort || continuation.cancel) {
          // --- Stop the visit
          return;
        }
      }
    }

    // --- Visit events with nested components
    const eventDescriptors = metadataHandler.getComponentEvents(def.type) ?? {};
    const currentEvents = def.events ?? {};
    for (const eventName of Object.keys(currentEvents)) {
      const eventDescriptor = eventDescriptors[eventName];
      if (!eventDescriptor) {
        // --- No descriptor for the events, skip it
        continue;
      }

      const eventValue = currentEvents[eventName];
      if (typeof eventValue === "object" && eventValue.type) {
        // --- This event holds a nested component, visit it
        visitComponent(eventValue, def, visitor, continuation);
        if (continuation.abort) {
          // --- Stop visiting this component
          return;
        }
        if (continuation.cancel) {
          // --- Skip the remaining items
          break;
        }
      }
    }

    // --- Visit the component children
    if (def.children) {
      for (const child of def.children) {
        visitComponent(child, def, visitor, continuation);
        if (continuation.abort) {
          // --- Stop visiting this component
          return;
        }
        if (continuation.cancel) {
          // --- Skip the remaining items
          break;
        }
      }
    }

    // --- Visit the component (after)
    visitor(def, undefined, false, continuation);
  }

  /**
   * Checks if a string is a valid JavaScript identifier.
   * @param identifier The string to check.
   * @returns True if the string is a valid identifier, false otherwise.
   */
  function isValidIdentifier(identifier: string): boolean {
    const identifierRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    return identifierRegex.test(identifier);
  }

  function reportError(code: ErrorCode, name: string, ...args: any) {
    _reportError(code, name, false, ...args);
  }

  function reportWarning(code: ErrorCode, name: string, ...args: any) {
    _reportError(code, name, true, ...args);
  }

  function _reportError(code: ErrorCode, name: string, isWarning: boolean, ...args: any) {
    let errorText: string = errorMessages[code] ?? "Unkonwn error";
    if (args) {
      args.forEach((a: string, idx: number) => (errorText = replace(errorText, `{${idx}}`, args[idx].toString())));
    }

    errorsCollected.push({ name, code, message: errorText, isWarning });

    function replace(input: string, placeholder: string, replacement: string): string {
      do {
        input = input.replace(placeholder, replacement);
      } while (input.includes(placeholder));
      return input;
    }
  }
}

export type MarkupCheckResult = {
  name: string;
  code: ErrorCode;
  message: string;
  isWarning?: boolean;
};

// --- Available error codes
type ErrorCode =
  | "M001"
  | "M002"
  | "M003"
  | "M004"
  | "M005"
  | "M006"
  | "M007"
  | "M008"
  | "M009"
  | "M010"
  | "M011"
  | "M012"
  | "M013";

// --- Error message type description
type ErrorText = Record<string, string>;

// --- The error messages of error codes
const errorMessages: ErrorText = {
  M001: "The component '{0}' is not registered",
  M002: "The '{0}' element has an invalid id: '{1}'",
  M003: "Invalid component identifier: '{0}'",
  M004: "Duplicated component identifier: '{0}'",
  M005: "The '{0}' element has an invalid property: '{1}'",
  M006: "Parsing property value of '{0}' failed: {1}",
  M007: "The name of a reusable component is invalid: '{0}'",
  M008: "The name of a reusable component must not be '{0}', as it is a reserved name",
  M009: "A reusable component cannot have the name of a registered component: '{0}'",
  M010: "Duplicated reusable component name: '{0}'",
  M011: "The '{0}' element has an invalid event: '{1}'",
  M012: "Parsing event value of '{0}' failed: {1}",
  M013: "Component validation failed: '{0}'",
};
