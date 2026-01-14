import type { ComponentDef, CompoundComponentDef } from "../../abstractions/ComponentDefs";
import { collectCodeBehindFromSource } from "../scripting/code-behind-collect";
import { Node } from "./syntax-node";
import { SyntaxKind } from "./syntax-kind";
import { Parser } from "../scripting/Parser";
import { CharacterCodes } from "./CharacterCodes";
import type { GetText } from "./parser";
import type { ParsedEventValue } from "../../abstractions/scripting/Compilation";
import { DIAGS_TRANSFORM, TransformDiag, type TransformDiagPositionless } from "./diagnostics";

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
    hoistScriptCollectedFromFragments(component);
    return component;
  }

  function transformInnerElement(
    usesStack: Map<string, string>[],
    node: Node,
  ): ComponentDef | CompoundComponentDef | null {
    const name = getNamespaceResolvedComponentName(node, getText, namespaceStack);

    if (name === COMPOUND_COMP_ID) {
      reportError(DIAGS_TRANSFORM.nestedCompDefs);
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
    hoistScriptCollectedFromFragments(component);
    return component;
  }

  function collectCompoundComponent(node: Node) {
    const attrs = getAttributes(node).map(segmentAttr);
    // --- Validate component name
    const compoundName = attrs.find((attr) => attr.name === "name");
    if (!compoundName) {
      reportError(DIAGS_TRANSFORM.compDefNameExp);
    }

    if (!UCRegex.test(compoundName.value)) {
      reportError(DIAGS_TRANSFORM.compDefNameUppercase);
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

    let hasScriptNode = false;
    // --- Process child nodes
    childNodes.forEach((child: Node) => {
      if (child.kind === SyntaxKind.Script) {
        if (hasScriptNode) {
          reportError(DIAGS_TRANSFORM.multipleScriptTags, child.pos, child.end);
        }
        processScriptTag(comp, child, getText);
        hasScriptNode = true;
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
            (name, value, nodeScriptContent) => {
              if (!isComponent(comp)) return;
              comp.events ??= {};
              comp.events[name] = parseEvent(value, nodeScriptContent);
            },
            (name) => {
              if (onPrefixRegex.test(name)) {
                reportError(DIAGS_TRANSFORM.eventNoOnPrefix(name));
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
          reportError(DIAGS_TRANSFORM.invalidNodeName(childName));
          return;
      }
    });

    namespaceStack.pop();
  }

  function collectAttribute(comp: ComponentDef | CompoundComponentDef, attr: Node) {
    const {
      namespace,
      startSegment,
      name,
      value,
      unsegmentedName: nameFullKey,
    } = segmentAttr(attr);

    const attrValueStringNode = attr.children![2];

    if (namespace === "xmlns") {
      return addToNamespaces(namespaceStack, comp, nameFullKey, value);
    }

    const isCompound = !isComponent(comp);
    // --- Handle single-word attributes
    if (isCompound) {
      if (startSegment && startSegment !== "method" && startSegment !== "var") {
        reportError(DIAGS_TRANSFORM.invalidReusableCompAttr(nameFullKey));
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
        reportError(DIAGS_TRANSFORM.invalidReusableCompAttr(name));
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
          comp.events[name] = parseEvent(value, attrValueStringNode);
        } else if (onPrefixRegex.test(name)) {
          comp.events ??= {};
          const eventName = name[2].toLowerCase() + name.substring(3);
          comp.events[eventName] = parseEvent(value, attrValueStringNode);
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
        reportError(DIAGS_TRANSFORM.onlyFieldOrItemChild);
        return;
      }

      if (childName === "field") {
        if (!nestedElementType) {
          // --- First nested element is "field", so we have an object
          nestedElementType = childName;
          result = {};
        } else if (nestedElementType !== childName) {
          reportError(DIAGS_TRANSFORM.cannotMixFieldItem);
          return;
        }
      } else if (childName === "item") {
        if (!nestedElementType) {
          // --- First nested element is "item", so we have an array
          nestedElementType = childName;
          result = [];
        } else if (nestedElementType !== childName) {
          reportError(DIAGS_TRANSFORM.cannotMixFieldItem);
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
  ): { name?: string; value: any; valueContentNode?: Node } | null {
    const elementName = getComponentName(element, getText);
    // --- Accept only "name", "value"
    const childNodes = getChildNodes(element);
    const nestedComponents = childNodes.filter(
      (c) => c.kind === SyntaxKind.ElementNode && UCRegex.test(getComponentName(c, getText)),
    );
    const nestedHelpers = childNodes.filter(
      (c) => c.kind === SyntaxKind.ElementNode && !UCRegex.test(getComponentName(c, getText)),
    );
    const attrNodes = getAttributes(element);
    const attrsSegmented = attrNodes.map(segmentAttr);

    const attrProps = attrsSegmented.filter((attr) => propAttrs.indexOf(attr.name) >= 0);
    if (attrsSegmented.length > attrProps.length) {
      reportError(DIAGS_TRANSFORM.onlyNameValueAttrs(elementName));
      return null;
    }

    // --- Validate the "name" usage
    const nameAttr = attrProps.find((attr) => attr.name === "name");
    if (allowName) {
      if (!nameAttr?.value) {
        reportError(DIAGS_TRANSFORM.nameAttrRequired(elementName));
        return null;
      }
    } else {
      if (nameAttr) {
        reportError(DIAGS_TRANSFORM.cantHaveNameAttr(elementName));
        return null;
      }
    }
    const name = nameAttr?.value;

    // --- Get the value attribute
    const valueAttr = attrProps.find((attr) => attr.name === "value");
    if (valueAttr && valueAttr.value === undefined) {
      reportError(DIAGS_TRANSFORM.valueAttrRequired(elementName));
      return null;
    }

    // --- Let's handle a special case, when the value is a component definition
    if (name && nestedComponents.length >= 1) {
      if (nestedHelpers.length > 0) {
        reportError(DIAGS_TRANSFORM.cannotMixCompNonComp);
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
      const valueAttrIdx = attrProps.findIndex((attr) => attr.name === "value");
      const valueAttrNode = attrNodes[valueAttrIdx];
      return { name, value, valueContentNode: valueAttrNode };
    }

    let valueContentNode: Node;
    if (childNodes?.[0]?.kind === SyntaxKind.TextNode) {
      valueContentNode = childNodes[0];
    }
    return { name, value: collectObjectOrArray(usesStack, childNodes), valueContentNode };
  }

  function collectLoadersElements(
    usesStack: Map<string, string>[],
    comp: ComponentDef | CompoundComponentDef,
    loaders: Node,
  ): void {
    if (!isComponent(comp)) {
      reportError(DIAGS_TRANSFORM.invalidNodeName("loaders"));
      return;
    }

    const children = getChildNodes(loaders);
    //todo: this check seems not necesarry
    if (children.length === 0) {
      comp.loaders ??= [];
    }

    const hasAttribute = loaders.children?.some((c) => c.kind === SyntaxKind.AttributeListNode);
    if (hasAttribute) {
      reportError(DIAGS_TRANSFORM.loaderCantHave("attributes"));
      return;
    }

    children.forEach((loader) => {
      // --- Test is not supported
      if (loader.kind === SyntaxKind.TextNode) {
        reportError(DIAGS_TRANSFORM.noTextChild("loader"));
        return;
      }

      // todo: is this needed?
      // --- Just for the sake of being sure...
      // if (loader.type !== "Element") return;

      const loaderDef = transformInnerElement(usesStack, loader) as ComponentDef;

      // --- Get the uid value
      if (!loaderDef.uid) {
        reportError(DIAGS_TRANSFORM.loaderIdRequired);
        return;
      }

      // --- Check props that a loader must not have
      if ((loaderDef as any).vars) {
        reportError(DIAGS_TRANSFORM.loaderCantHave("vars"));
        return;
      }

      if ((loaderDef as any).loaders) {
        reportError(DIAGS_TRANSFORM.loaderCantHave("loaders"));
        return;
      }

      if ((loaderDef as any).uses) {
        reportError(DIAGS_TRANSFORM.loaderCantHave("uses"));
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
    setter: (name: string, value: string, valueNode?: Node) => void,
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
      setter(name, mergeValue(getter(name), value), valueInfo.valueContentNode);
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
      reportError(DIAGS_TRANSFORM.invalidNodeName("uses"));
      return;
    }

    const attributes = getAttributes(usesNode).map(segmentAttr);
    const valueAttr = attributes.find((attr) => attr.name === "value");
    if (!valueAttr?.value || attributes.length !== 1) {
      reportError(DIAGS_TRANSFORM.usesValueOnly);
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
      reportError(DIAGS_TRANSFORM.invalidAttrName(unsegmentedName));
    }

    let name: string | undefined;
    let startSegment: string | undefined;

    if (segments.length === 2) {
      startSegment = segments[0];
      name = segments[1];
      if (name.trim() === "") {
        reportError(DIAGS_TRANSFORM.invalidAttrName(name));
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
    const shouldUseTextNodeElement =
      hasComponentName || tagName === "property" || tagName === "template";
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
          pos: child.pos,
          end: child.end,
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
          pos: node.pos,
          end: nextNode.end,
          kind: SyntaxKind.CData,
          text: getText(node).slice(1, -1) + getText(nextNode),
        } as TransformNode;
        childNodes.pop();
      } else if (node.kind === SyntaxKind.CData && nextNode.kind === SyntaxKind.StringLiteral) {
        childNodes[i - 1] = {
          pos: node.pos,
          end: nextNode.end,
          kind: SyntaxKind.CData,
          text: getText(node) + getText(nextNode).slice(1, -1),
        } as TransformNode;
        childNodes.pop();
      } else if (node.kind === SyntaxKind.CData && nextNode.kind === SyntaxKind.TextNode) {
        childNodes[i - 1] = {
          pos: node.pos,
          end: nextNode.end,
          kind: SyntaxKind.CData,
          text: getText(node) + getText(nextNode),
        } as TransformNode;
        childNodes.pop();
      } else if (node.kind === SyntaxKind.CData && nextNode.kind === SyntaxKind.CData) {
        childNodes[i - 1] = {
          pos: node.pos,
          end: nextNode.end,
          kind: SyntaxKind.CData,
          text: getText(node) + getText(nextNode),
        } as TransformNode;
        childNodes.pop();
      } else if (node.kind === SyntaxKind.TextNode && nextNode.kind === SyntaxKind.TextNode) {
        if (getText(node).endsWith(" ") && getText(nextNode).startsWith(" ")) {
          node.text = getText(node).trimEnd();
        }
        childNodes[i - 1] = {
          pos: node.pos,
          end: nextNode.end,
          kind: SyntaxKind.TextNode,
          text: getText(node) + getText(nextNode),
        } as TransformNode;
        childNodes.pop();
      } else if (node.kind === SyntaxKind.TextNode && nextNode.kind === SyntaxKind.CData) {
        childNodes[i - 1] = {
          pos: node.pos,
          end: nextNode.end,
          kind: SyntaxKind.CData,
          text: getText(node) + getText(nextNode),
        } as TransformNode;
        childNodes.pop();
      }
    }
  }

  function parseEvent(value: any, nodeContainingValue: Node): any {
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
        const diag = {
          code: errMsg.code,
          message: errMsg.text,
        };
        if (nodeContainingValue) {
          let diagPos: number;
          let diagEnd: number;
          if (nodeContainingValue.kind === SyntaxKind.StringLiteral) {
            const afterQuotePos = nodeContainingValue.pos + 1;
            diagPos = afterQuotePos + errMsg.position;
            diagEnd = afterQuotePos + errMsg.end;
          } else if (nodeContainingValue.kind === SyntaxKind.TextNode) {
            diagPos = nodeContainingValue.pos + errMsg.position;
            diagEnd = nodeContainingValue.pos + errMsg.end;
          }
          reportError(diag, diagPos, diagEnd);
        } else {
          reportError(diag);
        }
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

function reportError(
  diagnostic: TransformDiagPositionless,
  pos?: number,
  end?: number,
  contextPos?: number,
  contextEnd?: number,
): void {
  throw new TransformDiag(diagnostic, pos, end, contextPos, contextEnd);
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

/**
 * Hoists scriptCollected from immediate Fragment children to the parent component.
 * This handles the case where script tags cause the parser to wrap children in a Fragment.
 * Only hoists if the script doesn't reference context variables (starting with $).
 */
function hoistScriptCollectedFromFragments(component: ComponentDef): void {
  if (!component.children || !Array.isArray(component.children)) {
    return;
  }

  for (const child of component.children) {
    if (child.type === "Fragment" && child.scriptCollected) {
      // Check if the script references context variables (like $item, $itemIndex, etc.)
      const hasContextVarReferences = child.script?.includes("$");

      // Only hoist if there are no context variable references
      // Context variables are component-specific and should remain at the iteration level
      if (!hasContextVarReferences) {
        // Merge the Fragment's scriptCollected into the parent
        if (!component.scriptCollected) {
          component.scriptCollected = child.scriptCollected;
        } else {
          // Merge vars and functions from the Fragment into the parent
          component.scriptCollected.vars = {
            ...component.scriptCollected.vars,
            ...child.scriptCollected.vars,
          };
          component.scriptCollected.functions = {
            ...component.scriptCollected.functions,
            ...child.scriptCollected.functions,
          };
        }
        // Remove scriptCollected from the Fragment since we've hoisted it
        delete child.scriptCollected;
      }
    }
  }
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
    return reportError(
      DIAGS_TRANSFORM.nsValueIncorrect(value, "Namespace cannot contain multiple ':' (colon)."),
    );
  }

  let nsValue = value;
  if (nsCommaSeparated.length === 2) {
    if (nsCommaSeparated[0] != COMPONENT_NAMESPACE_SCHEME) {
      return reportError(DIAGS_TRANSFORM.nsSchemeIncorrect(value, COMPONENT_NAMESPACE_SCHEME));
    }
    nsValue = nsCommaSeparated[1];
  }

  if (nsValue.includes("#")) {
    return reportError(
      DIAGS_TRANSFORM.nsValueIncorrect(nsValue, "Namespace cannot contain character '#'."),
    );
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
    return reportError(DIAGS_TRANSFORM.duplXmlns(nsKey));
  }
  compNamespaces.set(nsKey, nsValue);
}

function getTopLvlElement(node: Node, getText: GetText): Node {
  // --- Check that the nodes contains exactly only a single component root element before the EoF token
  if (node.children!.length !== 2) {
    reportError(DIAGS_TRANSFORM.singleRootElem);
  }

  // --- Ensure it's a component
  const element = node.children![0];
  if (element.kind !== SyntaxKind.ElementNode) {
    reportError(DIAGS_TRANSFORM.singleRootElem);
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
    reportError(DIAGS_TRANSFORM.rootCompNoNamespace);
  }

  let resolvedNamespace = undefined;
  for (let i = namespaceStack.length - 1; i >= 0; --i) {
    resolvedNamespace = namespaceStack[i].get(namespace);
    if (resolvedNamespace !== undefined) {
      break;
    }
  }
  if (resolvedNamespace === undefined) {
    reportError(DIAGS_TRANSFORM.nsNotFound(namespace));
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

/**
 * Parse the script tag and add it to its containing componenet's definition.
 * Reports errors encountered during script parsing.
 * @param comp The component containing the script tag
 */
function processScriptTag(
  comp: ComponentDef | CompoundComponentDef,
  scriptTag: Node,
  getText: GetText,
) {
  if (getAttributes(scriptTag).length > 0) {
    reportError(DIAGS_TRANSFORM.scriptNoAttrs);
  }
  const scriptText = getText(scriptTag);
  const scriptContentPos = scriptText.indexOf(">") + 1;
  const scriptContent = scriptText.slice(scriptContentPos, scriptText.lastIndexOf("</"));

  if (scriptContent.trim().length === 0) {
    return;
  }

  comp.script = scriptContent;
  // --- Run the parse and collect on scripts
  const parser = new Parser(scriptContent);
  try {
    // --- We parse the module file to catch parsing errors
    parser.parseStatements();
    comp.scriptCollected = collectCodeBehindFromSource("Main", scriptContent);
    if (comp.scriptCollected.hasInvalidStatements) {
      comp.scriptError = new Error(
        `Only reactive variable and function definitions are allowed in a code-behind module.`,
      );
    }
  } catch (err) {
    if (parser.errors && parser.errors.length > 0) {
      const errMsg = parser.errors[0];
      const diag: TransformDiagPositionless = {
        code: errMsg.code,
        message: errMsg.text,
      };
      const errPos = scriptTag.pos + scriptContentPos + errMsg.position;
      const errEnd = scriptTag.pos + scriptContentPos + errMsg.end;
      reportError(diag, errPos, errEnd);
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
