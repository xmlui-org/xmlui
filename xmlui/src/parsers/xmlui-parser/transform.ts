import type { ComponentDef, CompoundComponentDef } from "../../abstractions/ComponentDefs";
import { collectCodeBehindFromSource } from "../scripting/code-behind-collect";
import { Node } from "./syntax-node";
import type { ErrorCodes } from "./ParserError";
import { SyntaxKind } from "./syntax-kind";
import { ParserError, errorMessages } from "./ParserError";
import { Parser } from "../scripting/Parser";
import { CharacterCodes } from "./CharacterCodes";
import type { GetText } from "./parser";
import type { ParsedEventValue } from "../../abstractions/scripting/Compilation";

export const COMPOUND_COMP_ID = "Component";
export const UCRegex = /^[A-Z]/;
export const onPrefixRegex = /^on[A-Z]/;
const propAttrs = ["name", "value"];

const CDATA_PREFIX_LEN = 9;
const CDATA_POSTFIX_LEN = 3;
const COMPONENT_NAMESPACE_SCHEME = "component-ns";
const APP_NS_KEY = "app-ns";
const APP_NS_VALUE = "#app-ns";
const CORE_NS_KEY = "core-ns";
export const CORE_NAMESPACE_VALUE = "#xmlui-core-ns";

/** Nodes which got modified or added during transformation keep their own text,
 * since they are not present in the original source text */
interface TransformNode extends Node {
  text?: string;
}

const HelperNode = {
  property: "property",
  template: "template",
  event: "event",
  variable: "variable",
  loaders: "loaders",
  uses: "uses",
  method: "method",
  item: "item",
  field: "field",
} as const;

let lastParseId = 0;

export function nodeToComponentDef(
  node: Node,
  originalGetText: GetText,
  fileId: string | number,
): ComponentDef | CompoundComponentDef | null {
  const getText = (node: TransformNode) => {
    return node.text ?? originalGetText(node);
  };

  const element = getTopLvlElement(node, getText);
  const preppedElement = prepNode(element);
  const usesStack: Map<string, string>[] = [];
  const namespaceStack: Map<string, string>[] = [];
  return transformTopLvlElement(usesStack, preppedElement);

  function transformTopLvlElement(
    usesStack: Map<string, string>[],
    node: Node,
  ): ComponentDef | CompoundComponentDef | null {
    const name = getNamespaceResolvedComponentName(node, getText, namespaceStack);

    if (name === COMPOUND_COMP_ID) {
      return collectCompoundComponent(node);
    }

    let component: ComponentDef = {
      type: name,
      debug: {
        source: {
          start: node.start,
          end: node.end,
          fileId,
        },
      },
    };

    // --- Done
    collectTraits(usesStack, component, node);
    return component;
  }

  function transformInnerElement(
    usesStack: Map<string, string>[],
    node: Node,
  ): ComponentDef | CompoundComponentDef | null {
    const name = getNamespaceResolvedComponentName(node, getText, namespaceStack);

    if (name === COMPOUND_COMP_ID) {
      reportError("T006");
    }

    let component: ComponentDef = {
      type: name,
      debug: {
        source: {
          start: node.start,
          end: node.end,
          fileId,
        },
      },
    };

    // --- Done
    collectTraits(usesStack, component, node);
    return component;
  }

  function collectCompoundComponent(node: Node) {
    const attrs = getAttributes(node).map(segmentAttr);
    // --- Validate component name
    const compoundName = attrs.find((attr) => attr.name === "name");
    if (!compoundName) {
      reportError("T003");
    }
    if (!UCRegex.test(compoundName.value)) {
      reportError("T004");
    }

    const codeBehind = attrs.find((attr) => attr.name === "codeBehind");

    // --- Get "method" attributes
    let api: Record<string, any> | undefined;
    const apiAttrs = attrs.filter((attr) => attr.startSegment === "method");
    if (apiAttrs.length > 0) {
      api = {};
      apiAttrs.forEach((attr) => {
        api![attr.name] = attr.value;
      });
    }

    // --- Get var attributes
    let vars: Record<string, any> | undefined;
    const varsAttrs = attrs.filter((attr) => attr.startSegment === "var");
    if (varsAttrs.length > 0) {
      vars = {};
      varsAttrs.forEach((attr) => {
        vars![attr.name] = attr.value;
      });
    }

    const children = getChildNodes(node);

    // --- Get the single component definition
    const nestedComponents = children.filter(
      (child) =>
        child.kind === SyntaxKind.ElementNode && !(getComponentName(child, getText) in HelperNode),
    );
    if (nestedComponents.length === 0) {
      nestedComponents.push(createTextNodeElement(""));
    }

    const nonVarHelperNodes: Node[] = [];
    const nestedVars: Node[] = [];
    for (let child of children) {
      if (child.kind === SyntaxKind.ElementNode) {
        const childName = getComponentName(child, getText);
        if (childName === HelperNode.variable) {
          nestedVars.push(child);
        } else if (childName in HelperNode) {
          nonVarHelperNodes.push(child);
        }
      }
    }

    // --- Should we wrap with a Fragment?
    let element: Node;
    if (nestedComponents.length > 1 || nestedVars.length > 0) {
      element = wrapWithFragment([...nestedVars, ...nestedComponents]);
    } else {
      element = nestedComponents[0];
    }

    namespaceStack.push(new Map());
    // --- Get collect namespace attributes
    const nsAttrs = attrs
      .filter((attr) => attr.namespace === "xmlns")
      .forEach((attr) => {
        addToNamespaces(namespaceStack, element, attr.unsegmentedName, attr.value);
      });

    let nestedComponent: ComponentDef = transformInnerElement(usesStack, element)! as ComponentDef;
    namespaceStack.pop();

    const component: CompoundComponentDef = {
      name: compoundName.value,
      component: nestedComponent,
      debug: {
        source: {
          start: node.start,
          end: node.end,
          fileId,
        },
      },
    };

    if (api) {
      component.api = api;
    }
    if (vars) {
      nestedComponent.vars = { ...nestedComponent.vars, ...vars };
    }
    if (codeBehind) {
      component.codeBehind = codeBehind.value;
    }

    nestedComponent.debug = {
      source: {
        start: element.start,
        end: element.end,
        fileId,
      },
    };

    const nodeClone: Node = withNewChildNodes(node, nonVarHelperNodes);
    collectTraits(usesStack, component, nodeClone);
    return component;
  }

  /**
   * Collects component traits from attributes and child elements
   * @param comp Component definition
   * @param element Component element
   */
  function collectTraits(
    usesStack: Map<string, string>[],
    comp: ComponentDef | CompoundComponentDef,
    element: Node,
  ): void {
    const isCompound = !isComponent(comp);

    const attributes = getAttributes(element);

    namespaceStack.push(new Map());
    // --- Process attributes
    attributes.forEach((attr: Node) => {
      // --- Process the attribute
      collectAttribute(comp, attr);
    });
    const childNodes = getChildNodes(element);

    // --- Process child nodes
    childNodes.forEach((child: Node) => {
      if (child.kind === SyntaxKind.Script) {
        if (getAttributes(child).length > 0) {
          reportError("T022");
        }
        const scriptText = getText(child);
        const scriptContent = scriptText.slice(
          scriptText.indexOf(">") + 1,
          scriptText.lastIndexOf("</"),
        );

        comp.script ??= "";
        if (comp.script.length > 0) {
          comp.script += "\n";
        }
        comp.script += scriptContent;
        return;
      }

      // --- Single text element, consider it a child name
      if (child.kind === SyntaxKind.TextNode && !isCompound) {
        comp.children = mergeValue(comp.children, getText(child));
        return;
      }

      const childName = getComponentName(child, getText);
      if (isCompound && child.kind === SyntaxKind.ElementNode && !(childName in HelperNode)) {
        // --- This is the single nested component definition of a compound component,
        // --- it is already processed
        return;
      }

      // --- Element name starts with an uppercase letter
      if (!(childName in HelperNode) && !isCompound) {
        // if (UCRegex.test(childName) && !isCompound) {
        // --- This must be a child component
        // maybe here or in the transformInnerElement function, after the compound comp check
        const childComponent = transformInnerElement(usesStack, child);
        if (childComponent) {
          if (!comp.children) {
            comp.children = [childComponent as ComponentDef];
          } else {
            if (typeof comp.children === "string") {
              comp.children = [comp.children as any, childComponent];
            } else if (Array.isArray(comp.children)) {
              comp.children.push(childComponent as any);
            }
          }
        }
        return;
      }

      // --- Element with a lowercase start letter, it must be some traits of the host component
      switch (childName) {
        case "property":
        case "template":
          collectElementHelper(
            usesStack,
            comp,
            child,

            (name) => (isComponent(comp) ? comp.props?.[name] : undefined),
            (name, value) => {
              if (!isComponent(comp)) return;
              comp.props ??= {};
              comp.props[name] = value;
            },
          );
          return;

        case "event":
          collectElementHelper(
            usesStack,
            comp,
            child,

            (name) => (isComponent(comp) ? comp.events?.[name] : undefined),
            (name, value) => {
              if (!isComponent(comp)) return;
              comp.events ??= {};
              comp.events[name] = parseEvent(value);
            },
            (name) => {
              if (onPrefixRegex.test(name)) {
                reportError("T008", name);
              }
            },
          );
          return;

        case HelperNode.variable:
          collectElementHelper(
            usesStack,
            comp,
            child,

            (name) => (isComponent(comp) ? comp.vars?.[name] : undefined),
            (name, value) => {
              if (!isComponent(comp)) return;
              comp.vars ??= {};
              comp.vars[name] = value;
            },
          );
          return;

        case "loaders":
          collectLoadersElements(usesStack, comp, child);
          return;

        case "uses":
          collectUsesElements(comp, child);
          return;

        case "method":
          collectElementHelper(
            usesStack,
            comp,
            child,

            (name) => (isComponent(comp) ? comp.api?.[name] : undefined),
            (name, value) => {
              comp.api ??= {};
              comp.api[name] = value;
            },
          );
          return;

        default:
          reportError("T009", childName);
          return;
      }
    });

    namespaceStack.pop();

    if (!comp.script || comp.script.trim().length === 0) {
      // --- No (or whitespace only) script
      return;
    }

    // --- Run the parse and collect on scripts
    const parser = new Parser(comp.script);
    try {
      // --- We parse the module file to catch parsing errors
      parser.parseStatements();
      comp.scriptCollected = collectCodeBehindFromSource("Main", comp.script);
      if (comp.scriptCollected.hasInvalidStatements) {
        comp.scriptError = new Error(`Only reactive variable and function definitions are allowed in a code-behind module.`)
      }
    } catch (err) {
      if (parser.errors && parser.errors.length > 0) {
        const errMsg = parser.errors[0];
        throw new ParserError(`${errMsg.text} [${errMsg.line}: ${errMsg.column}]`, errMsg.code);
      } else {
        comp.scriptError = err;
      }
    }

    // --- We may have module parsing/execution errors
    const moduleErrors = comp.scriptCollected?.moduleErrors ?? {};
    if (Object.keys(moduleErrors).length > 0) {
      comp.scriptError = moduleErrors;
    }
  }

  function collectAttribute(comp: ComponentDef | CompoundComponentDef, attr: Node) {
    const { namespace, startSegment, name, value, unsegmentedName: nsKey } = segmentAttr(attr);

    if (namespace === "xmlns") {
      return addToNamespaces(namespaceStack, comp, nsKey, value);
    }

    const isCompound = !isComponent(comp);
    // --- Handle single-word attributes
    if (isCompound) {
      if (startSegment && startSegment !== "method" && startSegment !== "var") {
        reportError("T021");
        return;
      }

      if (name === "name" && !startSegment) {
        // --- We already processed name
        return;
      }

      if (name === "codeBehind" && !startSegment) {
        // --- We already processed codeBehind
        return;
      }

      // --- Compound components do not have any other attributable props
      if (!startSegment && name) {
        reportError("T021", name);
      }
      return;
    }

    // --- Recognize special attributes by component definition type
    switch (name) {
      case "id":
        comp.uid = value;
        return;
      case "testId":
        comp.testId = value;
        return;
      case "when":
        comp.when = value;
        return;
      case "uses":
        comp.uses = splitUsesValue(value);
        return;
      default:
        if (startSegment === "var") {
          comp.vars ??= {};
          comp.vars[name] = value;
        } else if (startSegment === "method") {
          comp.api ??= {};
          comp.api[name] = value;
        } else if (startSegment === "event") {
          comp.events ??= {};
          comp.events[name] = parseEvent(value);
        } else if (onPrefixRegex.test(name)) {
          comp.events ??= {};
          const eventName = name[2].toLowerCase() + name.substring(3);
          comp.events[eventName] = parseEvent(value);
        } else {
          comp.props ??= {};
          comp.props[name] = value;
        }
        return;
    }
  }

  function collectObjectOrArray(usesStack: Map<string, string>[], children?: Node[]): any {
    let result: any = null;

    // --- No children, it's a null object
    if (!children) return result;
    let nestedElementType: string | null = null;

    children.forEach((child) => {
      if (child.kind === SyntaxKind.TextNode) {
        result = mergeValue(result, getText(child));
        return;
      }

      if (child.kind !== SyntaxKind.ElementNode) return;
      const childName = getComponentName(child, getText);
      // --- The only element names we accept are "field" or "item"
      if (childName !== "field" && childName !== "item") {
        reportError("T016");
        return;
      }

      if (childName === "field") {
        if (!nestedElementType) {
          // --- First nested element is "field", so we have an object
          nestedElementType = childName;
          result = {};
        } else if (nestedElementType !== childName) {
          reportError("T017");
          return;
        }
      } else if (childName === "item") {
        if (!nestedElementType) {
          // --- First nested element is "item", so we have an array
          nestedElementType = childName;
          result = [];
        } else if (nestedElementType !== childName) {
          reportError("T017");
          return;
        }
      }

      // --- Get the field value
      let valueInfo = collectValue(usesStack, child, childName === "field");
      if (!valueInfo) {
        return null;
      }

      // --- Does the field have a value?
      if (nestedElementType === "field") {
        result[valueInfo.name!] = valueInfo.value;
      } else {
        result.push(valueInfo.value);
      }
    });
    return result;
  }

  function collectValue(
    usesStack: Map<string, string>[],
    element: Node,
    allowName = true,
  ): { name?: string; value: any } | null {
    const elementName = getComponentName(element, getText);
    // --- Accept only "name", "value"
    const childNodes = getChildNodes(element);
    const nestedComponents = childNodes.filter(
      (c) => c.kind === SyntaxKind.ElementNode && UCRegex.test(getComponentName(c, getText)),
    );
    const nestedElements = childNodes.filter(
      (c) => c.kind === SyntaxKind.ElementNode && !UCRegex.test(getComponentName(c, getText)),
    );
    const attributes = getAttributes(element).map(segmentAttr);

    const attrProps = attributes.filter((attr) => propAttrs.indexOf(attr.name) >= 0);
    if (attributes.length > attrProps.length) {
      reportError("T011", elementName);
      return null;
    }

    // --- Validate the "name" usage
    const nameAttr = attrProps.find((attr) => attr.name === "name");
    if (allowName) {
      if (!nameAttr?.value) {
        reportError("T012", elementName);
        return null;
      }
    } else {
      if (nameAttr) {
        reportError("T018", elementName);
        return null;
      }
    }
    const name = nameAttr?.value;

    // --- Get the value attribute
    const valueAttr = attrProps.find((attr) => attr.name === "value");
    if (valueAttr && valueAttr.value === undefined) {
      reportError("T019", elementName);
      return null;
    }

    // --- Let's handle a special case, when the value is a component definition
    if (name && nestedComponents.length >= 1) {
      if (nestedElements.length > 0) {
        reportError("T020");
        return null;
      }
      // --- We expect a component definition here!
      const nestedComps = nestedComponents.map((nc) => transformInnerElement(usesStack, nc));
      return {
        name,
        value: nestedComps.length === 1 ? nestedComps[0] : nestedComps,
      };
    }

    // --- At this point, all attributes are ok, let's get the value.
    let value = valueAttr?.value;

    if (value === null) {
      return null;
    }

    if (typeof value === "string") {
      return { name, value };
    }

    return { name, value: collectObjectOrArray(usesStack, childNodes) };
  }

  function collectLoadersElements(
    usesStack: Map<string, string>[],
    comp: ComponentDef | CompoundComponentDef,
    loaders: Node,
  ): void {
    if (!isComponent(comp)) {
      reportError("T009", "loaders");
      return;
    }

    const children = getChildNodes(loaders);
    //todo: this check seems not necesarry
    if (children.length === 0) {
      comp.loaders ??= [];
    }

    const hasAttribute = loaders.children?.some((c) => c.kind === SyntaxKind.AttributeListNode);
    if (hasAttribute) {
      reportError("T014", "attributes");
      return;
    }

    children.forEach((loader) => {
      // --- Test is not supported
      if (loader.kind === SyntaxKind.TextNode) {
        reportError("T010", "loader");
        return;
      }

      // todo: is this needed?
      // --- Just for the sake of being sure...
      // if (loader.type !== "Element") return;

      const loaderDef = transformInnerElement(usesStack, loader) as ComponentDef;

      // --- Get the uid value
      if (!loaderDef.uid) {
        reportError("T013");
        return;
      }

      // --- Check props that a loader must not have
      if ((loaderDef as any).vars) {
        reportError("T014", "vars");
        return;
      }

      if ((loaderDef as any).loaders) {
        reportError("T014", "loaders");
        return;
      }

      if ((loaderDef as any).uses) {
        reportError("T014", "uses");
        return;
      }

      // --- Store this loader
      comp.loaders ??= [];
      comp.loaders.push(loaderDef);
    });
  }

  function collectElementHelper(
    usesStack: Map<string, string>[],
    comp: ComponentDef | CompoundComponentDef,
    child: Node,
    getter: (name: string) => any,
    setter: (name: string, value: string) => void,
    nameValidator?: (name: string) => void,
  ): void {
    // --- Compound component do not have a uses

    // --- Get the value
    const valueInfo = collectValue(usesStack, child);
    if (!valueInfo) {
      return;
    }

    // --- Extra name validation, if required so
    nameValidator?.(valueInfo?.name ?? "");

    const name = valueInfo.name!;
    const value = valueInfo.value;
    if (valueInfo?.value !== undefined) {
      setter(name, mergeValue(getter(name), value));
    } else {
      // --- Consider the value to be null; check optional child items
      const children = getChildNodes(child);
      const itemValue = collectObjectOrArray(usesStack, children);
      let updatedValue = getter(name);
      updatedValue = mergeValue(updatedValue, itemValue);
      setter(name, updatedValue);
    }
  }

  function collectUsesElements(comp: ComponentDef | CompoundComponentDef, usesNode: Node): void {
    // --- Compound component do not have a uses
    if (!isComponent(comp)) {
      reportError("T009", "uses");
      return;
    }

    const attributes = getAttributes(usesNode).map(segmentAttr);
    const valueAttr = attributes.find((attr) => attr.name === "value");
    if (!valueAttr?.value || attributes.length !== 1) {
      reportError("T015", "uses");
      return;
    }

    // --- Extract the value
    const usesValues = splitUsesValue(valueAttr.value);
    if (comp.uses) {
      comp.uses.push(...usesValues);
    } else {
      comp.uses = usesValues;
    }
  }

  function segmentAttr(attr: Node): {
    namespace?: string;
    startSegment?: string;
    name?: string;
    value: string;
    unsegmentedName: string;
  } {
    let key = attr.children![0];
    const hasNamespace = key.children!.length === 3;
    let namespace: undefined | string;
    if (hasNamespace) {
      namespace = getText(key.children![0]);
    }
    let unsegmentedName = getText(key.children![key.children!.length - 1]);
    const segments = unsegmentedName.split(".");
    if (segments.length > 2) {
      reportError("T007", attr, key);
    }

    let name: string | undefined;
    let startSegment: string | undefined;

    if (segments.length === 2) {
      startSegment = segments[0];
      name = segments[1];
      if (name.trim() === "") {
        reportError("T007", attr, name);
      }
    } else {
      //TODO: remove asigning name when name === unsegmentedName. It is there for backwards compat
      name = unsegmentedName;
    }
    const valueText = getText(attr.children![2]);
    const value = valueText.substring(1, valueText.length - 1);
    return { namespace, startSegment, name, value, unsegmentedName };
  }

  function parseEscapeCharactersInAttrValues(attrs: Node[]) {
    for (let attr of attrs) {
      const attrValue = attr.children![attr.children!.length - 1] as TransformNode;
      const escapedText = tryEscapeEntities(getText(attrValue));
      if (escapedText !== null) {
        attrValue.text = escapedText;
      }
    }
  }

  function prepNode(node: Node): Node {
    const childNodes: TransformNode[] = getChildNodes(node);
    const tagName = getComponentName(node, getText);
    const hasComponentName = !(tagName in HelperNode);
    const shouldUseTextNodeElement = hasComponentName || tagName === "property" || tagName === "template";
    const shouldCollapseWhitespace = tagName !== "event" && tagName !== "method";
    const attrs = getAttributes(node);

    desugarKeyOnlyAttrs(attrs);
    parseEscapeCharactersInAttrValues(attrs);
    parseEscapeCharactersInContent(childNodes);

    mergeConsecutiveTexts(childNodes, shouldCollapseWhitespace);
    let shouldUseCData = false;
    let hasScriptChild = false;

    for (let i = 0; i < childNodes.length; ++i) {
      const child = childNodes[i];
      let newChild: TransformNode;

      if (child.kind == SyntaxKind.Script) {
        hasScriptChild = true;
        continue;
      }
      if (child.kind === SyntaxKind.ElementNode) {
        newChild = prepNode(child);
        childNodes[i] = newChild;
        continue;
      }

      let textValue = getText(child);

      if (child.kind === SyntaxKind.StringLiteral) {
        textValue = textValue.slice(1, -1);
      } else if (child.kind === SyntaxKind.CData) {
        shouldUseCData = true;
      } else if (child.kind === SyntaxKind.TextNode) {
      }

      if (shouldUseTextNodeElement) {
        if (shouldUseCData) {
          newChild = createTextNodeCDataElement(textValue);
        } else {
          newChild = createTextNodeElement(textValue);
        }
      } else {
        newChild = {
          kind: SyntaxKind.TextNode,
          text: textValue,
        } as TransformNode;
      }
      childNodes[i] = newChild;
    }

    const helperNodes = [];
    const otherNodes = [];
    let hasComponentChild = false;
    for (const child of childNodes) {
      if (child.kind === SyntaxKind.ElementNode) {
        let compName: string = getComponentName(child, getText) ?? undefined;
        if (compName in HelperNode) {
          helperNodes.push(child);
          continue;
        }
        hasComponentChild = true;
      }
      otherNodes.push(child);
    }

    if (hasScriptChild && hasComponentChild) {
      const fragment = wrapWithFragment(otherNodes);
      helperNodes.push(fragment);
      return withNewChildNodes(node, helperNodes);
    }

    return node;
  }

  function collapseWhitespace(childNodes: TransformNode[]) {
    for (let i = 0; i < childNodes.length; ++i) {
      if (
        childNodes[i].kind === SyntaxKind.StringLiteral ||
        childNodes[i].kind === SyntaxKind.TextNode
      ) {
        //the union is the same as \s , but took \u00a0 (non breaking space) out
        //source https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Cheatsheet
        const allSubsequentWsExceptNonBreakingSpace =
          /[\f\n\r\t\v\u0020\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g;
        childNodes[i].text = getText(childNodes[i]).replace(
          allSubsequentWsExceptNonBreakingSpace,
          " ",
        );
      }
    }
  }

  function stripCDataWrapper(childNodes: TransformNode[]) {
    for (let i = 0; i < childNodes.length; ++i) {
      if (childNodes[i].kind === SyntaxKind.CData) {
        childNodes[i].text = getText(childNodes[i]).slice(CDATA_PREFIX_LEN, -CDATA_POSTFIX_LEN);
      }
    }
  }

  function parseEscapeCharactersInContent(childNodes: TransformNode[]) {
    for (let node of childNodes) {
      if (node.kind === SyntaxKind.StringLiteral || node.kind === SyntaxKind.TextNode) {
        const escapedText = tryEscapeEntities(getText(node));
        if (escapedText !== null) {
          node.text = escapedText;
        }
      }
    }
  }

  function tryEscapeEntities(text: string): string | null {
    let newText = "";
    let startOfSubstr = 0;
    for (let i = 0; i < text.length; ++i) {
      if (text.charCodeAt(i) === CharacterCodes.ampersand) {
        switch (text.charCodeAt(i + 1)) {
          //&a
          case CharacterCodes.a:
            switch (text.charCodeAt(i + 2)) {
              //am
              case CharacterCodes.m:
                //amp;
                if (
                  text.charCodeAt(i + 3) === CharacterCodes.p &&
                  text.charCodeAt(i + 4) === CharacterCodes.semicolon
                ) {
                  newText = newText + text.substring(startOfSubstr, i) + "&";
                  i += 4;
                  startOfSubstr = i + 1;
                }
                break;
              //ap
              case CharacterCodes.p:
                //apos;
                if (
                  text.charCodeAt(i + 3) === CharacterCodes.o &&
                  text.charCodeAt(i + 4) === CharacterCodes.s &&
                  text.charCodeAt(i + 5) === CharacterCodes.semicolon
                ) {
                  newText = newText + text.substring(startOfSubstr, i) + "'";
                  i += 5;
                  startOfSubstr = i + 1;
                }
                break;
            }
            break;
          //&g
          case CharacterCodes.g:
            //\gt;
            if (
              text.charCodeAt(i + 2) === CharacterCodes.t &&
              text.charCodeAt(i + 3) === CharacterCodes.semicolon
            ) {
              newText = newText + text.substring(startOfSubstr, i) + ">";
              i += 3;
              startOfSubstr = i + 1;
            }
            break;
          //&l
          case CharacterCodes.l:
            //&lt;
            if (
              text.charCodeAt(i + 2) === CharacterCodes.t &&
              text.charCodeAt(i + 3) === CharacterCodes.semicolon
            ) {
              newText = newText + text.substring(startOfSubstr, i) + "<";
              i += 3;
              startOfSubstr = i + 1;
            }
            break;
          //&q
          case CharacterCodes.q:
            //&quot;
            if (
              text.charCodeAt(i + 2) === CharacterCodes.u &&
              text.charCodeAt(i + 3) === CharacterCodes.o &&
              text.charCodeAt(i + 4) === CharacterCodes.t &&
              text.charCodeAt(i + 5) === CharacterCodes.semicolon
            ) {
              newText = newText + text.substring(startOfSubstr, i) + '"';
              i += 5;
              startOfSubstr = i + 1;
            }
            break;
          //&n
          case CharacterCodes.n:
            //&nbsp;
            if (
              text.charCodeAt(i + 2) === CharacterCodes.b &&
              text.charCodeAt(i + 3) === CharacterCodes.s &&
              text.charCodeAt(i + 4) === CharacterCodes.p &&
              text.charCodeAt(i + 5) === CharacterCodes.semicolon
            ) {
              newText = newText + text.substring(startOfSubstr, i) + "\xa0";
              i += 5;
              startOfSubstr = i + 1;
            }
            break;
        }
      }
    }
    if (startOfSubstr === 0) {
      return null;
    }
    newText += text.substring(startOfSubstr);
    return newText;
  }

  function mergeConsecutiveTexts(childNodes: TransformNode[], shouldCollapseWs: boolean) {
    if (shouldCollapseWs) {
      collapseWhitespace(childNodes);
    }
    stripCDataWrapper(childNodes);

    for (let i = childNodes.length - 1; i > 0; --i) {
      const node = childNodes[i - 1];
      const nextNode = childNodes[i];

      if (node.kind === SyntaxKind.StringLiteral && nextNode.kind === SyntaxKind.CData) {
        childNodes[i - 1] = {
          kind: SyntaxKind.CData,
          text: getText(node).slice(1, -1) + getText(nextNode),
        } as TransformNode;
        childNodes.pop();
      } else if (node.kind === SyntaxKind.CData && nextNode.kind === SyntaxKind.StringLiteral) {
        childNodes[i - 1] = {
          kind: SyntaxKind.CData,
          text: getText(node) + getText(nextNode).slice(1, -1),
        } as TransformNode;
        childNodes.pop();
      } else if (node.kind === SyntaxKind.CData && nextNode.kind === SyntaxKind.TextNode) {
        childNodes[i - 1] = {
          kind: SyntaxKind.CData,
          text: getText(node) + getText(nextNode),
        } as TransformNode;
        childNodes.pop();
      } else if (node.kind === SyntaxKind.CData && nextNode.kind === SyntaxKind.CData) {
        childNodes[i - 1] = {
          kind: SyntaxKind.CData,
          text: getText(node) + getText(nextNode),
        } as TransformNode;
        childNodes.pop();
      } else if (node.kind === SyntaxKind.TextNode && nextNode.kind === SyntaxKind.TextNode) {
        if (getText(node).endsWith(" ") && getText(nextNode).startsWith(" ")) {
          node.text = getText(node).trimEnd();
        }
        childNodes[i - 1] = {
          kind: SyntaxKind.TextNode,
          text: getText(node) + getText(nextNode),
        } as TransformNode;
        childNodes.pop();
      } else if (node.kind === SyntaxKind.TextNode && nextNode.kind === SyntaxKind.CData) {
        childNodes[i - 1] = {
          kind: SyntaxKind.CData,
          text: getText(node) + getText(nextNode),
        } as TransformNode;
        childNodes.pop();
      }
    }
  }

  function parseEvent(value: any): any {
    if (typeof value !== "string") {
      // --- It must be a component definition in the event code
      return value;
    }

    // --- Parse the event code
    const parser = new Parser(value);
    try {
      const statements = parser.parseStatements();
      return {
        __PARSED: true,
        statements,
        parseId: ++lastParseId,
        // TODO: retrieve the event source code only in dev mode
        source: value,
      } as ParsedEventValue;
    } catch {
      if (parser.errors.length > 0) {
        const errMsg = parser.errors[0];
        throw new ParserError(`${errMsg.text} [${errMsg.line}: ${errMsg.column}]`, errMsg.code);
      }
    }
  }
}

function createTextNodeCDataElement(textValue: string): Node {
  return {
    kind: SyntaxKind.ElementNode,
    children: [
      { kind: SyntaxKind.OpenNodeStart },
      {
        kind: SyntaxKind.TagNameNode,
        children: [{ kind: SyntaxKind.Identifier, text: "TextNodeCData" }],
      },
      {
        kind: SyntaxKind.AttributeListNode,
        children: [
          {
            kind: SyntaxKind.AttributeNode,
            children: [
              {
                kind: SyntaxKind.AttributeKeyNode,
                children: [{ kind: SyntaxKind.Identifier, text: "value" }],
              },
              { kind: SyntaxKind.Equal },
              { kind: SyntaxKind.Identifier, text: `"${textValue}"` },
            ],
          },
        ],
      },
      { kind: SyntaxKind.NodeClose },
    ],
  } as Node;
}

function createTextNodeElement(textValue: string): Node {
  return {
    kind: SyntaxKind.ElementNode,
    children: [
      { kind: SyntaxKind.OpenNodeStart },
      {
        kind: SyntaxKind.TagNameNode,
        children: [{ kind: SyntaxKind.Identifier, text: "TextNode" }],
      },
      {
        kind: SyntaxKind.AttributeListNode,
        children: [
          {
            kind: SyntaxKind.AttributeNode,
            children: [
              {
                kind: SyntaxKind.AttributeKeyNode,
                children: [{ kind: SyntaxKind.Identifier, text: "value" }],
              },
              { kind: SyntaxKind.Equal },
              { kind: SyntaxKind.Identifier, text: `"${textValue}"` },
            ],
          },
        ],
      },
      { kind: SyntaxKind.NodeClose },
    ],
  } as Node;
}

/**
 * Reports the specified error
 * @param errorCode Error code
 * @param options Error message options
 */
function reportError(errorCode: ErrorCodes, ...options: any[]): void {
  let errorText: string = errorMessages[errorCode] ?? "Unknown error";
  if (options) {
    options.forEach((o, idx) => (errorText = replace(errorText, `{${idx}}`, o.toString())));
  }
  throw new ParserError(errorText, errorCode);

  function replace(input: string, placeholder: string, replacement: string): string {
    do {
      input = input.replace(placeholder, replacement);
    } while (input.includes(placeholder));
    return input;
  }
}

function isComponent(obj: ComponentDef | CompoundComponentDef): obj is ComponentDef {
  return (obj as any).type;
}

function mergeValue(oldValue: any, itemValue: any): any {
  if (oldValue) {
    if (Array.isArray(oldValue)) {
      if (typeof oldValue === "string") {
        return [oldValue, itemValue];
      } else {
        oldValue.push(itemValue);
        return oldValue;
      }
    } else {
      return [oldValue, itemValue];
    }
  } else {
    return itemValue;
  }
}

function wrapWithFragment(wrappedChildren: Node[]): TransformNode {
  const nameNode = {
    kind: SyntaxKind.TagNameNode,
    children: [{ kind: SyntaxKind.Identifier, text: "Fragment" }],
  };
  return {
    kind: SyntaxKind.ElementNode,
    start: wrappedChildren[0].start,
    pos: wrappedChildren[0].pos,
    end: wrappedChildren[wrappedChildren.length - 1].end,
    children: [
      { kind: SyntaxKind.OpenNodeStart },
      nameNode,
      { kind: SyntaxKind.NodeEnd },
      { kind: SyntaxKind.ContentListNode, children: wrappedChildren },
      { kind: SyntaxKind.CloseNodeStart },
      nameNode,
      { kind: SyntaxKind.NodeEnd },
    ],
  } as TransformNode;
}

function getAttributes(node: Node): Node[] {
  return node.children?.find((c) => c.kind === SyntaxKind.AttributeListNode)?.children ?? [];
}

function getChildNodes(node: Node): Node[] {
  return node.children?.find((c) => c.kind === SyntaxKind.ContentListNode)?.children ?? [];
}

function withNewChildNodes(node: Node, newChildren: Node[]) {
  const childrenListIdx = node.children?.findIndex((c) => c.kind === SyntaxKind.ContentListNode);
  if (childrenListIdx === undefined || childrenListIdx === -1) {
    return node;
  }
  const contentListChild = node.children![childrenListIdx];
  return new Node(node.kind, node.pos ?? 0, node.end ?? 0, node.triviaBefore, [
    ...node.children!.slice(0, childrenListIdx),
    new Node(
      contentListChild.kind,
      contentListChild.pos ?? 0,
      contentListChild.end ?? 0,
      undefined,
      newChildren,
    ),
    ...node.children!.slice(childrenListIdx),
  ]);
}

function desugarKeyOnlyAttrs(attrs: Node[]) {
  for (let attr of attrs) {
    if (attr.children?.length === 1) {
      const eq = {
        kind: SyntaxKind.Equal,
      } as Node;
      const value = {
        kind: SyntaxKind.StringLiteral,
        text: '"true"',
      } as TransformNode;
      attr.children!.push(eq, value);
    }
  }
}

function addToNamespaces(
  namespaceStack: Map<string, string>[],
  comp: any,
  nsKey: string,
  value: string,
) {
  let nsCommaSeparated = value.split(":");
  if (nsCommaSeparated.length > 2) {
    return reportError("T028", value, "Namespace cannot contain multiple ':' (colon).");
  }

  let nsValue = value;
  if (nsCommaSeparated.length === 2) {
    if (nsCommaSeparated[0] != COMPONENT_NAMESPACE_SCHEME) {
      return reportError("T029", value, COMPONENT_NAMESPACE_SCHEME);
    }
    nsValue = nsCommaSeparated[1];
  }

  if (nsValue.includes("#")) {
    return reportError("T028", nsValue, "Namespace cannot contain character '#'.");
  }

  switch (nsValue) {
    case COMPONENT_NAMESPACE_SCHEME:
      nsValue = nsKey;
      break;
    case APP_NS_KEY:
      nsValue = APP_NS_VALUE;
      break;
    case CORE_NS_KEY:
      nsValue = CORE_NAMESPACE_VALUE;
      break;
  }

  const compNamespaces = namespaceStack[namespaceStack.length - 1];
  if (compNamespaces.has(nsKey)) {
    return reportError("T025", nsKey);
  }
  compNamespaces.set(nsKey, nsValue);
}

function getTopLvlElement(node: Node, getText: GetText): Node {
  // --- Check that the nodes contains exactly only a single component root element before the EoF token
  if (node.children!.length !== 2) {
    reportError("T001");
  }

  // --- Ensure it's a component
  const element = node.children![0];
  if (element.kind !== SyntaxKind.ElementNode) {
    reportError("T001");
  }
  return element;
}

function getComponentName(node: Node, getText: GetText) {
  const nameTokens = node.children!.find((c) => c.kind === SyntaxKind.TagNameNode)!.children!;
  const name = getText(nameTokens.at(-1));
  return name;
}

function getNamespaceResolvedComponentName(
  node: Node,
  getText: GetText,
  namespaceStack: Map<string, string>[],
) {
  const nameTokens = node.children!.find((c) => c.kind === SyntaxKind.TagNameNode)!.children!;
  const name = getText(nameTokens.at(-1));

  if (nameTokens.length === 1) {
    return name;
  }

  const namespace = getText(nameTokens[0]);

  if (namespaceStack.length === 0) {
    reportError("T026");
  }

  let resolvedNamespace = undefined;
  for (let i = namespaceStack.length - 1; i >= 0; --i) {
    resolvedNamespace = namespaceStack[i].get(namespace);
    if (resolvedNamespace !== undefined) {
      break;
    }
  }
  if (resolvedNamespace === undefined) {
    reportError("T027", namespace);
  }

  return resolvedNamespace + "." + name;
}

/**
 * @param name - The name of the event in camelCase, with "on" prefix.
 */
export function stripOnPrefix(name: string) {
  return name[2].toLowerCase() + name.substring(3);
}

function splitUsesValue(value: string) {
  return value.split(",").map((v) => v.trim());
}
