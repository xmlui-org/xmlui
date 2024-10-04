import type { ComponentDef, CompoundComponentDef } from "../../abstractions/ComponentDefs";
import type { Node } from "./syntax-node";
import type { ErrorCodes } from "./ParserError";
import type { ModuleResolver } from "@abstractions/scripting/modules";

import { SyntaxKind } from "./syntax-kind";
import { ParserError, errorMessages } from "./ParserError";
import { Parser } from "../scripting/Parser";
import { collectCodeBehindFromSource } from "../scripting/code-behind-collect";
import { CharacterCodes } from "./CharacterCodes";
import { GetText } from "./parser";

export const COMPOUND_COMP_ID = "Component";
export const UCRegex = /^[A-Z]/;
export const onPrefixRegex = /^on[A-Z]/;
const propAttrs = ["name", "value"];

const CDATA_PREFIX_LEN = 9;
const CDATA_POSTFIX_LEN = 3;

/** Nodes which got modified or added during transformation keep their own text,
 * since they are not present in the original source text */
interface TransformNode extends Node {
  text?: string;
}

export function nodeToComponentDef(
  node: Node,
  originalGetText: GetText,
  fileId: string | number,
  moduleResolver: ModuleResolver = () => "",
): ComponentDef | CompoundComponentDef | null {
  const getText = (node: TransformNode) => {
    return node.text ?? originalGetText(node);
  };
  // --- Check that the nodes contains exactly only a single component root element before the EoF token
  if (node.children!.length !== 2) {
    reportError("T001");
    return null;
  }

  // --- Ensure it's a component
  const element = node.children![0];
  if (element.kind !== SyntaxKind.ElementNode) {
    reportError("T001");
    return null;
  }

  const preppedElement = prepNode(element);
  const name = getTagName(element);
  if (!UCRegex.test(name)) {
    reportError("T002");
    return null;
  }
  const usesStack: Map<string, string>[] = [];
  return transformSingleElement(usesStack, preppedElement);

  function transformSingleElement(
    usesStack: Map<string, string>[],
    node: Node,
  ): ComponentDef | CompoundComponentDef | null {
    const name = getTagName(node);
    const attrs = getAttributes(node).map(segmentAttr);
    let component: ComponentDef | CompoundComponentDef;
    if (name === COMPOUND_COMP_ID) {
      // --- Validate component name
      const compoundName = attrs.find((attr) => attr.name === "name");
      if (!compoundName) {
        reportError("T003");
        return null;
      }
      if (!UCRegex.test(compoundName.value)) {
        reportError("T004");
        return null;
      }

      // --- Get "api" attributes
      let api: Record<string, any> | undefined;
      const apiAttrs = attrs.filter((attr) => refersToApi(attr.startSegment));
      if (apiAttrs.length > 0) {
        api = {};
        apiAttrs.forEach((attr) => {
          api![attr.name] = attr.value;
        });
      }

      // --- Get "var" attributes
      let vars: Record<string, any> | undefined;
      const varsAttrs = attrs.filter((attr) => attr.startSegment === "var");
      if (varsAttrs.length > 0) {
        vars = {};
        varsAttrs.forEach((attr) => {
          vars![attr.name] = attr.value;
        });
      }

      const children = getChildNodes(node);
      // --- Check for nested component
      const nestedCompound = children.find(
        (child) => child.kind === SyntaxKind.ElementNode && getTagName(child) === COMPOUND_COMP_ID,
      );
      if (nestedCompound) {
        reportError("T006");
        return null;
      }

      // --- Get the single component definition
      const nestedComponents = children.filter(
        (child) => child.kind === SyntaxKind.ElementNode && UCRegex.test(getTagName(child)),
      );
      if (nestedComponents.length === 0) {
        nestedComponents.push(createTextNodeElement(""));
      }

      const childrenToCollect: Node[] = [];
      const nestedVars: Node[] = [];
      for (let child of children) {
        if (child.kind === SyntaxKind.ElementNode) {
          const childName = getTagName(child);
          if (childName === "var") {
            nestedVars.push(child);
          } else if (!UCRegex.test(childName)) {
            childrenToCollect.push(child);
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

      let nestedComponent: ComponentDef = transformSingleElement(
        usesStack,
        element,
      )! as ComponentDef;

      component = {
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
      nestedComponent.debug = {
        source: {
          start: element.start,
          end: element.end,
          fileId,
        },
      };

      const nodeClone: Node = withNewChildNodes(node, childrenToCollect);
      collectTraits(usesStack, component, nodeClone);
      return component;
    }

    // --- Not a reusable component
    if (!UCRegex.test(name)) {
      reportError("T002");
      return null;
    }

    component = {
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

      const childName = getTagName(child);
      if (isCompound && child.kind === SyntaxKind.ElementNode && UCRegex.test(childName)) {
        // --- This is the single nested component definition of a compound component,
        // --- it is already processed
        return;
      }

      // --- Element name starts with an uppercase letter
      if (UCRegex.test(childName) && !isCompound) {
        // --- This must be a child component
        // maybe here or in the transformSingleElement function, after the compound comp check
        const childComponent = transformSingleElement(usesStack, child);
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
        case "prop":
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
              comp.events[name] = value;
            },
            (name) => {
              if (onPrefixRegex.test(name)) {
                reportError("T008", name);
              }
            },
          );
          return;

        case "var":
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
        case "api":
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

    if (!comp.script || comp.script.trim().length === 0) {
      // --- No (or whitespace only) script
      return;
    }

    // --- Run the parse and collect on scripts
    const parser = new Parser(comp.script);
    try {
      // --- We parse the module file to catch parsing errors
      parser.parseStatements();
      comp.scriptCollected = collectCodeBehindFromSource("Main", comp.script, moduleResolver);
    } catch (err) {
      if (parser.errors && parser.errors.length > 0) {
        comp.scriptError = parser.errors;
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
    const { startSegment, name, value } = segmentAttr(attr);

    const isCompound = !isComponent(comp);
    // --- Handle single-word attributes
    if (isCompound) {
      if (startSegment && !refersToApi(startSegment) && startSegment !== "var") {
        reportError("T021");
        return;
      }

      if (name === "name" && !startSegment) {
        // --- We already processed name
        return;
      }

      // --- Compound components do not have any other attributable props
      if (!startSegment && name) {
        reportError("T021", name);
      }
      return;
    }

    // --- Do not allow segmented attribute names
    if (name.indexOf(".") >= 0) {
      reportError("T007", name);
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
      default:
        if (startSegment === "var") {
          comp.vars ??= {};
          comp.vars[name] = value;
        } else if (refersToApi(startSegment)) {
          comp.api ??= {};
          comp.api[name] = value;
        } else if (startSegment === "event") {
          comp.events ??= {};
          comp.events[name] = value;
        } else if (onPrefixRegex.test(name)) {
          comp.events ??= {};
          const eventName = name[2].toLowerCase() + name.substring(3);
          comp.events[eventName] = value;
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
      const childName = getTagName(child);
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
    const elementName = getTagName(element);
    // --- Accept only "name", "value"
    const childNodes = getChildNodes(element);
    const nestedComponents = childNodes.filter(
      (c) => c.kind === SyntaxKind.ElementNode && UCRegex.test(getTagName(c)),
    );
    const nestedElements = childNodes.filter(
      (c) => c.kind === SyntaxKind.ElementNode && !UCRegex.test(getTagName(c)),
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
      const nestedComps = nestedComponents.map((nc) => transformSingleElement(usesStack, nc));
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

      const loaderDef = transformSingleElement(usesStack, loader) as ComponentDef;

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
  function collectUsesElements(comp: ComponentDef | CompoundComponentDef, uses: Node): void {
    // --- Compound component do not have a uses
    if (!isComponent(comp)) {
      reportError("T009", "uses");
      return;
    }

    const attributes = getAttributes(uses).map(segmentAttr);
    const valueAttr = attributes.find((attr) => attr.name === "value");
    if (!valueAttr?.value || attributes.length !== 1) {
      reportError("T015", "uses");
      return;
    }

    // --- Extract the value
    comp.uses ??= valueAttr.value.split(",").map((v) => v.trim());
  }

  function getTagName(node: Node) {
    const nameTokens = node.children!.find((c) => c.kind === SyntaxKind.TagNameNode)!.children!;
    const name = nameTokens[nameTokens.length - 1];
    return getText(name);
  }

  function segmentAttr(attr: Node) {
    let key = getText(attr.children![0]);
    const segments = key.split(".");
    if (segments.length > 2) {
      reportError("T007", attr, key);
    }

    let startSegment: string | undefined;
    let name = key;

    if (segments.length === 2) {
      startSegment = segments[0];
      name = segments[1];
      if (name.trim() === "") {
        reportError("T007", attr, name);
      }
    }
    const valueText = getText(attr.children![2]);
    const value = valueText.substring(1, valueText.length - 1);
    return { startSegment, name, value };
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
    const tagName = getTagName(node);
    const hasComponentName = UCRegex.test(tagName);
    const shouldUseTextNodeElement =
      hasComponentName || tagName === "prop" || tagName === "property";
    const shouldCollapseWhitespace = tagName !== "event" && !refersToApi(tagName);
    const attrs = getAttributes(node);

    desugarKeyOnlyAttrs(attrs);
    desugarQuotelessAttrs(attrs, getText);
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

    const helperNodes = childNodes.filter(
      (c) => c.kind === SyntaxKind.ElementNode && !UCRegex.test(getTagName(c)),
    );
    const otherNodes = childNodes.filter(
      (c) =>
        c.kind !== SyntaxKind.ElementNode ||
        (c.kind === SyntaxKind.ElementNode && UCRegex.test(getTagName(c))),
    );
    const hasComponentChild = otherNodes.some(
      (c) => c.kind === SyntaxKind.ElementNode && UCRegex.test(getTagName(c)),
    );

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
              { kind: SyntaxKind.Identifier, text: "value" },
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
              { kind: SyntaxKind.Identifier, text: "value" },
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
  return {
    ...node,
    children: [
      ...node.children!.slice(0, childrenListIdx),
      { ...node.children![childrenListIdx], children: newChildren },
      ...node.children!.slice(childrenListIdx),
    ],
  };
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
function desugarQuotelessAttrs(attrs: Node[], getText: GetText) {
  for (let attr of attrs) {
    const attrValue = attr.children?.[2] as TransformNode;
    if (attr.children?.[2]?.kind === SyntaxKind.Identifier) {
      attrValue.text = '"' + getText(attrValue) + '"';
    }
  }
}

/** Temporarily using 'method' as an alias to 'api'.
 * In the future, 'api' may be completely removed.*/
function refersToApi(word: string): boolean {
  return word === "api" || word === "method";
}
