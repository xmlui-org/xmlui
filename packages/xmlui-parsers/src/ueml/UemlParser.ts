import type { ErrorCodes, ParserErrorMessage } from "./ParserError";
import type { BaseNode, UemlAttribute, UemlComment, UemlElement, UemlNode, UemlText } from "./source-tree";
import type { UemlToken } from "./UemlToken";
import type { ComponentDef, CompoundComponentDef } from "../abstractions/ComponentDefs";

import { UemlInputStream } from "./UemlInputStream.js";
import { HARD_LITERAL_END, HARD_LITERAL_START, SCRIPT_LITERAL_END, SCRIPT_LITERAL_START, UemlLexer } from "./UemlLexer.js";
import { UemlTokenType } from "./UemlToken.js";
import { errorMessages, ParserError } from "./ParserError.js";
import { COMPOUND_COMP_ID, onPrefixRegex, UCRegex } from "./UemlHelper.js";
import { Parser } from "../scripting/Parser.js";
import { collectCodeBehindFromSource } from "../scripting/code-behind-collect.js";
import { createEvalContext, ModuleResolver } from "../script-runner/BindingTreeEvaluationContext.js";

/**
 * This class parses a binding expression and transforms it into an evaluable expression tree
 */
export class UemlParser {
  // --- Keep track of error messages
  private _parseErrors: ParserErrorMessage[] = [];

  // --- Use this lexer
  private _lexer: UemlLexer;

  /**
   * Initializes the parser with the specified source code
   * @param source Source code to parse
   * @param moduleResolver
   */
  constructor(public readonly source: string, private readonly moduleResolver: ModuleResolver = () => "") {
    this._lexer = new UemlLexer(new UemlInputStream(source));
  }

  /**
   * The errors raised during the parse phase
   */
  get errors(): ParserErrorMessage[] {
    return this._parseErrors;
  }

  /**
   * Gets the current token
   */
  get current(): UemlToken {
    return this._lexer.peek();
  }

  /**
   * Checks if we're at the end of the expression
   */
  get isEof(): boolean {
    return this._lexer.peek().type === UemlTokenType.Eof;
  }

  /**
   * Parses a component element
   *
   * umlNode
   *   : umlComment* umlElement umlComment*
   *   ;
   *
   * umlComment:
   *   : "<!-- {any chars} -->"
   *   ;
   */
  parseComponentElement(): UemlNode[] | null {
    const nodes: UemlNode[] = [];
    let hasUmlElement = false;
    let startToken = this._lexer.peek();
    while (!this.isEof) {
      switch (startToken.type) {
        case UemlTokenType.Comment:
          const commentToken = this._lexer.get();
          nodes.push(
            this.createNode<UemlComment>(
              "Comment",
              {
                text: commentToken.text,
              },
              startToken
            )
          );
          break;
        case UemlTokenType.OpenNodeStart:
          if (hasUmlElement) {
            this.reportError("U002", startToken);
            return null;
          }
          const element = this.parseElement();
          if (!element) {
            return null;
          }
          nodes.push(element);
          hasUmlElement = true;
          break;
        default:
          this.reportError("U001", startToken, startToken.text);
          return null;
      }

      // --- Move to the next token
      startToken = this._lexer.peek();
    }

    if (!hasUmlElement) {
      this.reportError("U002", startToken);
      return null;
    }
    return nodes;
  }

  parseFragment(): UemlNode[] | null {
    const nodes: UemlNode[] = [];
    let startToken = this._lexer.peek();
    while (!this.isEof) {
      switch (startToken.type) {
        case UemlTokenType.Comment:
          const commentToken = this._lexer.get();
          nodes.push(
            this.createNode<UemlComment>(
              "Comment",
              {
                text: commentToken.text,
              },
              startToken
            )
          );
          break;
        case UemlTokenType.OpenNodeStart:
          const element = this.parseElement();
          if (!element) {
            return null;
          }
          nodes.push(element);
          break;
        default:
          this.reportError("U001", startToken, startToken.text);
          return null;
      }

      // --- Move to the next token
      startToken = this._lexer.peek();
    }

    return nodes;
  }

  /**
   * Transforms the provided nodes to their component definition
   * @param nodes Nodes to transform
   */
  transformToComponentDef(nodes?: UemlNode[]): ComponentDef | CompoundComponentDef | null {
    if (!nodes) {
      const parsedNodes = this.parseComponentElement();
      if (!parsedNodes) return null;
      nodes = parsedNodes;
    }

    // --- Check that the nodes contains exactly only a single component root element
    const rootElements = nodes.filter((e) => e.type === "Element");
    if (rootElements.length !== 1) {
      this.reportError("T001");
      return null;
    }

    // --- Search for the element, take a note of the preceding comment
    const index = nodes.findIndex((n) => n.type === "Element");
    const element = nodes[index] as UemlElement;
    const comment = index > 0 ? (nodes[index - 1] as UemlComment) : undefined;

    if (!UCRegex.test(element.id)) {
      this.reportError("T002");
      return null;
    }

    // --- Done
    const usesStack: Map<string, string>[] = [];
    return this.transformSingleElement(usesStack, element);
  }

  /**
   * Transforms the provided nodes to their component definition
   * @param usesStack "Uses" stack
   * @param nodes Nodes to transform
   */
  transformToObject(nodes?: UemlNode[], usesStack: Map<string, string>[] = []): any {
    if (!nodes) {
      const parsedNodes = this.parseFragment();
      if (!parsedNodes) return null;
      nodes = parsedNodes;
    }

    const root: UemlElement = {
      type: "Element",
      id: "root",
      attributes: [
        {
          type: "Attribute",
          name: "name",
          value: "object",
        } as UemlAttribute,
      ],
      childNodes: nodes,
    } as UemlElement;

    // --- Done
    return this.collectValue(usesStack, root)?.value;
  }

  // ==================================================================================================================
  // Transform methods

  private transformSingleElement(
    usesStack: Map<string, string>[],
    node: UemlElement
  ): ComponentDef | CompoundComponentDef | null {
    let component: ComponentDef | CompoundComponentDef;
    if (node.id === COMPOUND_COMP_ID) {
      // --- Validate component name
      const compoundName = (node.attributes ?? []).find((attr) => attr.name === "name");
      if (!compoundName) {
        this.reportError("T003");
        return null;
      }
      if (!UCRegex.test(compoundName.value)) {
        this.reportError("T004");
        return null;
      }

      // --- Get "api" attributes
      let api: Record<string, any> | undefined;
      const apiAttrs = (node.attributes ?? []).filter((attr) => attr.startSegment === "api");
      if (apiAttrs.length > 0) {
        api = {};
        apiAttrs.forEach((attr) => {
          api![attr.name] = attr.value;
        });
      }

      // --- Get "var" attributes
      let vars: Record<string, any> | undefined;
      const varsAttrs = (node.attributes ?? []).filter((attr) => attr.startSegment === "var");
      if (varsAttrs.length > 0) {
        vars = {};
        varsAttrs.forEach((attr) => {
          vars![attr.name] = attr.value;
        });
      }

      // --- Check for nested component
      const nestedCompound = (node.childNodes ?? []).find(
        (child) => child.type === "Element" && child.id === COMPOUND_COMP_ID
      );
      if (nestedCompound) {
        this.reportError("T006");
        return null;
      }

      // --- Get the single component definition
      const nestedComponents = (node.childNodes ?? []).filter(
        (child) => child.type === "Element" && UCRegex.test(child.id)
      );
      if (nestedComponents.length === 0) {
        nestedComponents.push({
          type: "Element",
          id: "TextNode",
          attributes: [
            {
              type: "Attribute",
              name: "value",
              value: "",
            } as UemlAttribute,
          ],
        } as UemlElement);
      }

      const nestedVars = (node.childNodes ?? []).filter((child) => child.type === "Element" && child.id === "var");
      const childrenToCollect = (node.childNodes ?? []).filter(
        (child) => child.type === "Element" && !UCRegex.test(child.id) && child.id !== "var"
      );

      // --- Should we use a Fragment?
      if (nestedComponents.length > 1 || nestedVars.length > 0) {
        // --- Wrap the children in a Fragment
        const fragmentElement: UemlElement = {
          type: "Element",
          id: "Fragment",
          childNodes: [...nestedVars, ...nestedComponents],
        } as UemlElement;
        const nestedFragment = this.transformSingleElement(usesStack, fragmentElement)!;
        component = {
          name: compoundName.value,
          component: nestedFragment,
        };
        if (api) {
          component.api = api;
        }
        if (vars) {
          (nestedFragment as ComponentDef).vars = { ...(nestedFragment as ComponentDef).vars, ...vars };
        }
      } else {
        // --- Search for the element, take a note of the preceding comment
        const element = nestedComponents[0] as UemlElement;
        const nestedComponent = this.transformSingleElement(usesStack, element)!;

        // --- Create the component
        component = {
          name: compoundName.value,
          component: nestedComponent as ComponentDef,
        };
        if (api) {
          component.api = api;
        }
        if (vars) {
          (nestedComponent as ComponentDef).vars = { ...(nestedComponent as ComponentDef).vars, ...vars };
        }
      }

      const nodeClone = { ...node };
      nodeClone.childNodes = childrenToCollect;
      this.collectTraits(usesStack, component, nodeClone);
      return component;
    }

    // --- Not a reusable component
    if (!UCRegex.test(node.id)) {
      this.reportError("T002");
      return null;
    }

    component = {
      type: node.id,
    };

    // --- Done
    this.collectTraits(usesStack, component, node);
    return component;
  }

  /**
   * Collects component traits from attributes and child elements
   * @param usesStack "Uses" stack
   * @param comp Component definition
   * @param element Component element
   */
  private collectTraits(
    usesStack: Map<string, string>[],
    comp: ComponentDef | CompoundComponentDef,
    element: UemlElement
  ): void {
    const isCompound = !isComponent(comp);

    // --- Process attributes
    (element.attributes ?? []).forEach((attr) => {
      // --- Process the attribute
      if (attr.namespace) {
        this.reportError("T021");
        return;
      }
      this.collectAttribute(comp, attr.startSegment, attr.name, attr.value);
    });

    let lastComment: UemlComment | null = null;

    // --- Process child nodes
    (element.childNodes ?? []).forEach((child) => {
      if (child.type === "Comment") {
        lastComment = child;
      }

      if (isCompound && child.type === "Element" && UCRegex.test(child.id)) {
        // --- This is the single nested component definition of a compound component,
        // --- it is already processed
        return;
      }

      // --- Single text element, consider it a child name
      if (child.type === "Text" && !isCompound) {
        comp.children = this.mergeValue(comp.children, child.text);
      }

      // --- It should not happen, but just for being safe...
      if (child.type !== "Element") return;

      // --- Element name starts with an uppercase letter
      if (UCRegex.test(child.id) && !isCompound) {
        // --- This must be a child component
        const childComponent = this.transformSingleElement(usesStack, child);
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
      switch (child.id) {
        case "prop":
          this.collectElementHelper(
            usesStack,
            comp,
            child,
            (name) => (isComponent(comp) ? comp.props?.[name] : undefined),
            (name, value) => {
              if (!isComponent(comp)) return;
              comp.props ??= {};
              comp.props[name] = value;
            }
          );
          return;

        case "event":
          this.collectElementHelper(
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
                this.reportError("T008", undefined, name);
              }
            }
          );
          return;

        case "var":
          this.collectElementHelper(
            usesStack,
            comp,
            child,
            (name) => (isComponent(comp) ? comp.vars?.[name] : undefined),
            (name, value) => {
              if (!isComponent(comp)) return;
              comp.vars ??= {};
              comp.vars[name] = value;
            }
          );
          return;

        case "loaders":
          this.collectLoadersElements(usesStack, comp, child);
          return;

        case "uses":
          this.collectUsesElements(comp, child);
          return;

        case "api":
          this.collectElementHelper(
            usesStack,
            comp,
            child,
            (name) => (isComponent(comp) ? comp.api?.[name] : undefined),
            (name, value) => {
              comp.api ??= {};
              comp.api[name] = value;
            }
          );
          return;

        case "script":
          if (child.attributes && child.attributes.length > 0) {
            this.reportError("T022");
            return;
          }
          if (!child.childNodes || !child.childNodes.length) {
            // --- No children, no script
            return;
          }

          if (child.childNodes.length === 1 && child.childNodes[0].type === "Text") {
            // --- We have a single text child
            comp.script ??= "";
            if (comp.script.length > 0) {
              comp.script += "\n";
            }
            comp.script += child.childNodes[0].text;
          } else {
            this.reportError("T023");
          }
          return;

        case "metadata":
          this.collectMetadataElements(comp);
          return;
        default:
          this.reportError("T009", undefined, child.id);
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

      const evalContext = createEvalContext({});
      comp.scriptCollected = collectCodeBehindFromSource("Main", comp.script, this.moduleResolver, evalContext);
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

  /**
   * Process a single component attribute
   * @param comp Component definition to merge the attribute into
   * @param startSegment Starts segment name
   * @param name Attribute name
   * @param value Attribute value
   */
  private collectAttribute(
    comp: ComponentDef | CompoundComponentDef,
    startSegment: string | undefined,
    name: string,
    value: string
  ): void {
    const isCompound = !isComponent(comp);
    // --- Handle single-word attributes
    if (isCompound) {
      if (startSegment && startSegment !== "api" && startSegment !== "var") {
        this.reportError("T021");
        return;
      }

      if (name === "name" && !startSegment) {
        // --- We already processed name
        return;
      }

      // --- Compound components do not have any other attributable props
      if (!startSegment && !startSegment) {
        this.reportError("T021", undefined, name);
      }
      return;
    }

    // --- Do not allow segmented attribute names
    if (name.indexOf(".") >= 0) {
      this.reportError("T007", undefined, name);
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
        } else if (startSegment === "api") {
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

  private collectElementHelper(
    usesStack: Map<string, string>[],
    comp: ComponentDef | CompoundComponentDef,
    child: UemlElement,
    getter: (name: string) => any,
    setter: (name: string, value: string) => void,
    nameValidator?: (name: string) => void
  ): void {
    // --- Compound component do not have a uses

    // --- Get the value
    const valueInfo = this.collectValue(usesStack, child);
    if (!valueInfo) {
      return;
    }

    // --- Extra name validation, if required so
    nameValidator?.(valueInfo?.name ?? "");

    const name = valueInfo.name!;
    const value = valueInfo.value;
    if (valueInfo?.value !== undefined) {
      setter(name, this.mergeValue(getter(name), value));
    } else {
      // --- Consider the value to be null; check optional child items
      const itemValue = this.collectObjectOrArray(usesStack, child.childNodes);
      let updatedValue = getter(name);
      updatedValue = this.mergeValue(updatedValue, itemValue);
      setter(name, updatedValue);
    }
  }

  private collectValue(
    usesStack: Map<string, string>[],
    element: UemlElement,
    allowName = true
  ): { name?: string; value: any } | null {
    // --- Accept only "name", "value"
    const nestedComponents = (element.childNodes ?? []).filter((c) => c.type === "Element" && UCRegex.test(c.id));
    const nestedElements = (element.childNodes ?? []).filter((c) => c.type === "Element" && !UCRegex.test(c.id));
    const attrProps = (element.attributes ?? []).filter((attr) => propAttrs.indexOf(attr.name) >= 0);
    if ((element.attributes ?? []).length > attrProps.length) {
      this.reportError("T011", undefined, element.id);
      return null;
    }

    // --- Validate the "name" usage
    const nameAttr = attrProps.find((attr) => attr.name === "name");
    if (allowName) {
      if (!nameAttr?.value) {
        this.reportError("T012", undefined, element.id);
        return null;
      }
    } else {
      if (nameAttr) {
        this.reportError("T018", undefined, element.id);
        return null;
      }
    }
    const name = nameAttr?.value;

    // --- Get the value attribute
    const valueAttr = attrProps.find((attr) => attr.name === "value");
    if (valueAttr && valueAttr.value === undefined) {
      this.reportError("T019", undefined, element.id);
      return null;
    }

    // --- Let's handle a special case, when the value is a component definition
    if (name && nestedComponents.length >= 1) {
      if (nestedElements.length > 0) {
        this.reportError("T020");
        return null;
      }
      // --- We expect a component definition here!
      const nestedComps = nestedComponents.map((nc) => this.transformSingleElement(usesStack, nc as UemlElement));
      return { name, value: nestedComps.length === 1 ? nestedComps[0] : nestedComps };
    }

    // --- At this point, all attributes are ok, let's get the value.
    let value = valueAttr?.value;

    if (value === null) {
      return null;
    }

    if (typeof value === "string") {
      return { name, value };
    }

    return { name, value: this.collectObjectOrArray(usesStack, element.childNodes) };
  }

  private collectLoadersElements(
    usesStack: Map<string, string>[],
    comp: ComponentDef | CompoundComponentDef,
    loaders: UemlElement
  ): void {
    if (!isComponent(comp)) {
      this.reportError("T009", undefined, "loaders");
      return;
    }

    if (isComponent(comp) && (loaders?.childNodes?.length ?? 0) === 0) {
      comp.loaders ??= [];
    }

    // --- Loaders element must not have attributes
    if ((loaders.attributes ?? []).length > 0) {
      this.reportError("T012", undefined, "loaders");
      return;
    }

    // --- Iterate through child elements
    let lastComment: UemlComment | null = null;
    (loaders.childNodes ?? []).forEach((loader) => {
      // --- Take a note of the last comment
      if (loader.type === "Comment") {
        lastComment = loader;
        return;
      }

      // --- Test is not supported
      if (loader.type === "Text") {
        this.reportError("T010", undefined, "loader");
        return;
      }

      // --- Just for the sake of being sure...
      if (loader.type !== "Element") return;

      const loaderDef = this.transformSingleElement(usesStack, loader) as ComponentDef;

      // --- Get the uid value
      if (!loaderDef.uid) {
        this.reportError("T013");
        return;
      }

      // --- Check props that a loader must not have
      if ((loaderDef as any).vars) {
        this.reportError("T014", undefined, "vars");
        return;
      }

      if ((loaderDef as any).loaders) {
        this.reportError("T014", undefined, "loaders");
        return;
      }

      if ((loaderDef as any).uses) {
        this.reportError("T014", undefined, "uses");
        return;
      }

      // --- Store this loader
      comp.loaders ??= [];
      comp.loaders.push(loaderDef);
    });
  }

  private collectUsesElements(comp: ComponentDef | CompoundComponentDef, uses: UemlElement): void {
    // --- Compound component do not have a uses
    if (!isComponent(comp)) {
      this.reportError("T009", undefined, "uses");
      return;
    }

    const valueAttr = (uses.attributes ?? []).find((attr) => attr.name === "value");
    if (!valueAttr?.value || (uses.attributes?.length ?? 0) !== 1) {
      this.reportError("T015", undefined, "uses");
      return;
    }

    // --- Extract the value
    comp.uses ??= valueAttr.value.split(",").map((v) => v.trim());
  }

  private collectMetadataElements(comp: ComponentDef | CompoundComponentDef): void {
    if (isComponent(comp)) {
      this.reportError("T009", undefined, "meadata");
      return;
    }
  }

  private collectObjectOrArray(usesStack: Map<string, string>[], children?: UemlNode[]): any {
    let result: any = null;

    // --- No children, it's a null object
    if (!children) return result;
    let nestedElementType: string | null = null;

    children.forEach((child) => {
      if (child.type === "Text") {
        result = this.mergeValue(result, child.text);
        return;
      }

      if (child.type !== "Element") return;

      // --- The only element names we accept are "field" or "item"
      if (child.id !== "field" && child.id !== "item") {
        this.reportError("T016");
        return;
      }

      if (child.id === "field") {
        if (!nestedElementType) {
          // --- First nested element is "field", so we have an object
          nestedElementType = child.id;
          result = {};
        } else if (nestedElementType !== child.id) {
          this.reportError("T017");
          return;
        }
      } else if (child.id === "item") {
        if (!nestedElementType) {
          // --- First nested element is "item", so we have an array
          nestedElementType = child.id;
          result = [];
        } else if (nestedElementType !== child.id) {
          this.reportError("T017");
          return;
        }
      }

      // --- Get the field value
      let valueInfo = this.collectValue(usesStack, child, child.id === "field");
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

  private mergeValue(oldValue: any, itemValue: any): any {
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

  // ==================================================================================================================
  // Parsing methods

  /**
   * Parses an UEML elements
   *
   * uemlElement
   *   : "<" id uemlAttribute* ">" (uemlLiteral? | uemlElement*) "</" id ">"
   *   | "<" id uemlAttribute* "/>"
   *   ;
   *
   */
  private parseElement(): UemlElement | null {
    let startToken = this._lexer.peek();
    let attributes: UemlAttribute[] = [];

    // --- Test the open node start token
    if (startToken.type !== UemlTokenType.OpenNodeStart) {
      this.reportError("U003", startToken);
      return null;
    }

    // --- Get the node id
    this._lexer.get();
    let namespace = "";
    let idToken = this._lexer.peek();
    if (idToken.type !== UemlTokenType.Identifier) {
      this.reportError("U004", idToken);
      return null;
    }

    // --- Check for namespace
    this._lexer.get();
    if (this._lexer.peek().type === UemlTokenType.Colon) {
      this._lexer.get();
      namespace = idToken.text;
      idToken = this._lexer.peek();
      if (idToken.type !== UemlTokenType.Identifier) {
        this.reportError("U004", idToken);
        return null;
      }
      this._lexer.get();
    }

    // --- Parse attributes
    let nextToken = this._lexer.peek();

    // --- Skip comment
    while (nextToken.type === UemlTokenType.Comment) {
      this._lexer.get();
      nextToken = this._lexer.peek();
    }

    // --- Get the next attribute
    while (nextToken.type === UemlTokenType.Identifier) {
      // --- Seems to be an attribute value
      const attribute = this.parseAttribute();
      if (attribute) {
        if (attributes.find((attr) => attr.name === attribute.name)) {
          this.reportError("U012", nextToken, attribute.name);
          return null;
        }
        if (UCRegex.test(attribute.name)) {
          this.reportError("U013");
          return null;
        }
        attributes.push(attribute);
      }

      nextToken = this._lexer.peek();
      // --- Skip comment
      while (nextToken.type === UemlTokenType.Comment) {
        this._lexer.get();
        nextToken = this._lexer.peek();
      }
    }

    // --- Test the closing of the node
    if (nextToken.type === UemlTokenType.NodeClose) {
      // --- This node is closed, return it
      this._lexer.get();
      return this.createNode<UemlElement>(
        "Element",
        {
          id: idToken.text,
          namespace,
          attributes,
        },
        nextToken
      );
    }

    // --- Check the closing token of the node
    if (nextToken.type !== UemlTokenType.NodeEnd) {
      this.reportError("U006", nextToken);
      return null;
    }
    this._lexer.get();

    // --- Get the nested children or text
    const isComponentElement = UCRegex.test(idToken.text);
    const shouldUseTextNode = isComponentElement || idToken.text === "prop";
    const shouldPreserveWhitespace = idToken.text === "event" || idToken.text === "api" || idToken.text === "script";
    let childNodes = this.parseElementChildren(shouldPreserveWhitespace, shouldUseTextNode);
    if (!childNodes) {
      return null;
    }

    // --- Separate helper nodes from <script> and component children
    const helperNodes = childNodes.filter((n) => n.type === "Element" && !UCRegex.test(n.id) && n.id !== "script");
    const otherNodes = childNodes.filter((n) => helperNodes.indexOf(n) < 0);
    const hasScript = otherNodes.some((n) => n.type === "Element" && n.id === "script");
    const hasComponent = otherNodes.some((n) => n.type === "Element" && UCRegex.test(n.id));

    // --- Wrap with fragment if needed
    if (hasComponent && hasScript) {
      const fragmentElement: UemlElement = {
        type: "Element",
        id: "Fragment",
        childNodes: otherNodes,
      } as UemlElement;
      childNodes = [...helperNodes, fragmentElement];
    }

    // --- Get the start token of the closing tag
    const closeToken = this._lexer.peek();
    if (closeToken.type !== UemlTokenType.CloseNodeStart) {
      this.reportError("U005", closeToken);
      return null;
    }

    // --- Test closing node identifier
    this._lexer.get();
    let closeNamespace = "";
    let closeIdToken = this._lexer.peek();
    if (closeIdToken.type !== UemlTokenType.Identifier) {
      this.reportError("U004", closeIdToken);
      return null;
    }

    // --- Check for closing namespace
    this._lexer.get();
    if (this._lexer.peek().type === UemlTokenType.Colon) {
      this._lexer.get();
      closeNamespace = closeIdToken.text;
      closeIdToken = this._lexer.peek();
      if (closeIdToken.type !== UemlTokenType.Identifier) {
        this.reportError("U004", closeIdToken);
        return null;
      }
      this._lexer.get();
    }

    // --- The start end closing namespace must match
    if (namespace !== closeNamespace) {
      this.reportError("U014", closeIdToken, namespace, closeNamespace);
      return null;
    }

    // --- The start end closing ID must match
    if (idToken.text !== closeIdToken.text) {
      this.reportError("U007", closeIdToken, idToken.text, closeIdToken.text);
      return null;
    }

    // --- Check the element's final token
    const finalToken = this._lexer.peek();

    if (finalToken.type !== UemlTokenType.NodeEnd) {
      this.reportError("U008", finalToken);
      return null;
    }

    // --- Done.
    this._lexer.get();
    return this.createNode<UemlElement>(
      "Element",
      {
        id: idToken.text,
        namespace,
        attributes,
        childNodes,
      },
      startToken
    );
  }

  /**
   * Parses an UEML attribute
   *
   * uemlAttribute
   *   : id "=" (singleWord | stringLiteral)
   *   ;
   */
  private parseAttribute(): UemlAttribute | null {
    let namespace: string | undefined;
    let name: string | undefined;
    const startToken = this._lexer.peek();
    if (startToken.type !== UemlTokenType.Identifier) {
      this.reportError("U009", startToken);
      return null;
    }
    name = startToken.text;

    // --- Check for type spec
    this._lexer.get();
    let nextToken = this._lexer.peek();
    if (nextToken.type === UemlTokenType.Colon) {
      this._lexer.get();
      namespace = name;
      const nameToken = this._lexer.peek();
      if (nameToken.type !== UemlTokenType.Identifier) {
        this.reportError("U009", nameToken);
        return null;
      }
      name = nameToken.text;
      this._lexer.get();
      nextToken = this._lexer.peek();
    }

    // --- Check segments
    const segments = name.split(".");
    if (segments.length > 2) {
      this.reportError("T007", startToken, name);
      return null;
    }

    let startSegment: string | undefined;
    if (segments.length === 2) {
      startSegment = segments[0];
      name = segments[1];
      if (name.trim() === "") {
        this.reportError("T007", startToken, name);
        return null;
      }
    }

    // --- ID ok, check for "="
    let value: string | undefined;
    if (nextToken.type === UemlTokenType.Equal) {
      // --- Get the value
      this._lexer.get();
      const valueToken = this._lexer.peek();
      if (valueToken.type === UemlTokenType.StringLiteral) {
        value = this.parseStringLiteral(valueToken.text);
      } else {
        this.reportError("U011", valueToken);
        return null;
      }
      this._lexer.get();
    } else {
      this.reportError("U010", nextToken);
      return null;
    }

    // --- Done
    return this.createNode<UemlAttribute>(
      "Attribute",
      {
        namespace,
        startSegment,
        name,
        value,
      },
      startToken
    );
  }

  // --- Parses the nested children of an element
  private parseElementChildren(preserveWhitespace: boolean, useTextNode: boolean): UemlNode[] | null {
    const childNodes: UemlNode[] = [];
    let found = false;
    let disallowTextLike = false;
    while (true) {
      let nextToken = this._lexer.peekNested();
      if (nextToken.type === UemlTokenType.Eof) {
        return childNodes;
      }

      let textAsHardLiteral = false;

      switch (nextToken.type) {
        case UemlTokenType.CloseNodeStart:
          // --- No more nested child to parse
          found = true;
          break;

        case UemlTokenType.Comment:
          childNodes.push(this.createNode<UemlComment>("Comment", { text: nextToken.text.trim() }, nextToken));
          this._lexer.get();
          disallowTextLike = false;
          break;

        case UemlTokenType.OpenNodeStart:
          const childNode = this.parseElement();
          if (childNode) {
            childNodes.push(childNode);
          }
          disallowTextLike = false;
          break;

        case UemlTokenType.ScriptLiteral: {
          this._lexer.get();
          let text = nextToken.text.trim();
          text = text.substring(SCRIPT_LITERAL_START.length, text.length - SCRIPT_LITERAL_END.length);
          childNodes.push(
            this.createNode<UemlElement>(
              "Element",
              {
                id: "script",
                attributes: [],
                childNodes: [
                  this.createNode<UemlText>(
                    "Text",
                    {
                      text,
                    },
                    nextToken,
                    nextToken
                  ),
                ],
              },
              nextToken
            )
          );
          break;
        }

        case UemlTokenType.HardLiteral:
        case UemlTokenType.NestedText:
        case UemlTokenType.StringLiteral:
        case UemlTokenType.Identifier:
          if (disallowTextLike && nextToken.type !== UemlTokenType.HardLiteral) {
            this.reportError("U015", nextToken, nextToken.text?.trim()?.substring(1, 100) ?? "");
            return null;
          }
          disallowTextLike =
            nextToken.type === UemlTokenType.StringLiteral || nextToken.type === UemlTokenType.NestedText;
          let text = nextToken.text;
          if (nextToken.type === UemlTokenType.StringLiteral) {
            let literalText = nextToken.text;
            if (!preserveWhitespace) {
              literalText = literalText.trim();
              literalText = literalText.substring(1, literalText.length - 1).replace(/\s+/g, " ");
            }
            const wrapper = nextToken.text.trim()[0];
            text = this.parseStringLiteral(`${wrapper}${literalText}${wrapper}`);
          } else if (nextToken.type === UemlTokenType.HardLiteral) {
            if (!preserveWhitespace) {
              text = nextToken.text.trim();
              text = text.substring(HARD_LITERAL_START.length, text.length - HARD_LITERAL_END.length);
            }
            textAsHardLiteral = true;
          } else {
            if (!preserveWhitespace) {
              text = text.replace(/\s+/g, " ");
            }
          }
          childNodes.push(
            useTextNode
              ? this.createNode<UemlElement>(
                  "Element",
                  {
                    id: textAsHardLiteral ? "TextNodeCData" : "TextNode",
                    attributes: [
                      {
                        type: "Attribute",
                        name: "value",
                        value: text,
                      },
                    ],
                  },
                  nextToken
                )
              : this.createNode<UemlText>(
                  "Text",
                  {
                    text,
                  },
                  nextToken
                )
          );
          this._lexer.get();
          break;

        default:
          found = true;
          break;
      }

      if (found) {
        // --- No more nested element to parse
        break;
      }
    }

    // --- Preprocess text-like children
    const processedChildNodes: UemlNode[] = [];
    let text = "";
    let useCData = false;
    for (const childNode of childNodes) {
      if (childNode.type === "Element" && (childNode.id === "TextNode" || childNode.id === "TextNodeCData")) {
        // --- This is a TextNode, it behaves just like text
        text += childNode.attributes![0].value;
        useCData = childNode.id === "TextNodeCData";
      } else if (childNode.type === "Element" || childNode.type === "Comment") {
        // --- This is a component/helper node or a comment, so store the previously collected text
        storeText(false);

        // --- Store the node
        processedChildNodes.push(childNode);
      } else if (childNode.type === "Text") {
        // --- Append the text
        text += childNode.text;
      }
    }

    // --- We may have a pending (not stored text node)
    storeText(useCData);

    // --- Done.
    return processedChildNodes;

    // --- Store the processed text
    function storeText(useCData: boolean): void {
      if (text) {
        processedChildNodes.push(
          useTextNode
            ? ({
                type: "Element",
                id: useCData ? "TextNodeCData" : "TextNode",
                attributes: [
                  {
                    type: "Attribute",
                    name: "value",
                    value: text,
                  } as UemlAttribute,
                ],
              } as UemlElement)
            : ({
                type: "Text",
                text: text,
              } as UemlText)
        );
        text = "";
      }
    }
  }

  // ==========================================================================
  // Helpers

  /**
   * Reports the specified error
   * @param errorCode Error code
   * @param token Token that represents the error's position
   * @param options Error message options
   */
  private reportError(errorCode: ErrorCodes, token?: UemlToken, ...options: any[]): void {
    let errorText: string = errorMessages[errorCode] ?? "Unknown error";
    if (options) {
      options.forEach((o, idx) => (errorText = replace(errorText, `{${idx}}`, o.toString())));
    }
    if (!token) {
      token = this._lexer.peek();
    }
    this._parseErrors.push({
      code: errorCode,
      text: errorText,
      line: token.location.startLine,
      column: token.location.startColumn,
      position: token.location.startPosition,
    });
    throw new ParserError(errorText, errorCode);

    function replace(input: string, placeholder: string, replacement: string): string {
      do {
        input = input.replace(placeholder, replacement);
      } while (input.includes(placeholder));
      return input;
    }
  }

  /**
   * Creates an expression node
   * @param type Expression type
   * @param stump Stump properties
   * @param startToken The token that starts the expression
   * @param endToken The token that ends the expression
   * @param source Expression source code to store to the node
   */
  private createNode<T extends BaseNode>(
    type: BaseNode["type"],
    stump: any,
    startToken: UemlToken,
    endToken?: UemlToken,
    source?: string
  ): T {
    // if (!endToken) {
    //   endToken = this._lexer.peek();
    // }
    const startPosition = startToken.location.startPosition;
    const endPosition = endToken ? endToken.location.startPosition : this._lexer.input.position;
    return Object.assign({}, stump, {
      type,
      startPosition,
      endPosition,
      startLine: startToken.location.startLine,
      startColumn: startToken.location.startColumn,
      endLine: endToken ? endToken.location.endLine : this._lexer.input.line,
      endColumn: endToken ? endToken.location.endColumn : this._lexer.input.column,
      source: source ?? this.getSource(startToken, endToken),
    } as BaseNode);
  }

  /**
   * Gets the source code for the specified token range
   * @param start Start token
   * @param end Optional end token
   * @returns The source code for the token range
   */
  private getSource(start: UemlToken, end?: UemlToken): string {
    return this.source.substring(
      start.location.startPosition,
      end ? end.location.startPosition : this._lexer.input.position
    );
  }

  /**
   * Converts a string token to intrinsic string
   * @param text Literal text to parse
   */
  private parseStringLiteral(text: string): string {
    const input = text.length < 2 ? "" : text.substring(1, text.length - 1);
    let result = "";
    let state: StrParseState = StrParseState.Normal;
    let collect = 0;
    for (const ch of input) {
      switch (state) {
        case StrParseState.Normal:
          if (ch === "\\") {
            state = StrParseState.Backslash;
          } else {
            result += ch;
          }
          break;

        case StrParseState.Backslash:
          state = StrParseState.Normal;
          switch (ch) {
            case "b":
              result += "\b";
              break;
            case "f":
              result += "\f";
              break;
            case "n":
              result += "\n";
              break;
            case "r":
              result += "\r";
              break;
            case "t":
              result += "\t";
              break;
            case "v":
              result += "\v";
              break;
            case "S":
              result += "\xa0";
              break;
            case "0":
              result += String.fromCharCode(0x00);
              break;
            case "'":
              result += "'";
              break;
            case '"':
              result += '"';
              break;
            case "\\":
              result += "\\";
              break;
            case "x":
              state = StrParseState.X;
              break;
            case "u":
              state = StrParseState.UX1;
              break;
            default:
              result += "\\" + ch;
              break;
          }
          break;

        case StrParseState.X:
          if (isHexadecimal(ch)) {
            collect = parseInt(ch, 16);
            state = StrParseState.Xh;
          } else {
            result += "x";
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.Xh:
          if (isHexadecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            result += String.fromCharCode(collect);
            state = StrParseState.Normal;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.UX1:
          if (ch === "{") {
            state = StrParseState.Ucp1;
            break;
          }
          if (isHexadecimal(ch)) {
            collect = parseInt(ch, 16);
            state = StrParseState.UX2;
          } else {
            result += "x";
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.UX2:
          if (isHexadecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            state = StrParseState.UX3;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.UX3:
          if (isHexadecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            state = StrParseState.UX4;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.UX4:
          if (isHexadecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            result += String.fromCharCode(collect);
            state = StrParseState.Normal;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.Ucp1:
          if (isHexadecimal(ch)) {
            collect = parseInt(ch, 16);
            state = StrParseState.Ucp2;
          } else {
            result += "x";
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.Ucp2:
          if (isHexadecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            state = StrParseState.Ucp3;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.Ucp3:
          if (isHexadecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            state = StrParseState.Ucp4;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.Ucp4:
          if (isHexadecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            state = StrParseState.Ucp5;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.Ucp5:
          if (isHexadecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            state = StrParseState.Ucp6;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.Ucp6:
          if (isHexadecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            state = StrParseState.UcpTail;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.UcpTail:
          result += String.fromCharCode(collect);
          if (ch !== "}") {
            result += ch;
          }
          state = StrParseState.Normal;
          break;
      }
    }

    // --- Handle the final machine state
    switch (state) {
      case StrParseState.Backslash:
        result += "\\";
        break;
      case StrParseState.X:
        result += "x";
        break;
      case StrParseState.Xh:
        result += String.fromCharCode(collect);
        break;
    }

    // --- Done
    return result;

    function isHexadecimal(ch: string): boolean {
      return (ch >= "0" && ch <= "9") || (ch >= "a" && ch <= "f") || (ch >= "A" && ch <= "F");
    }
  }
}

/**
 * States of the string parsing
 */
enum StrParseState {
  Normal,
  Backslash,
  X,
  Xh,
  UX1,
  UX2,
  UX3,
  UX4,
  Ucp1,
  Ucp2,
  Ucp3,
  Ucp4,
  Ucp5,
  Ucp6,
  UcpTail,
}

const propAttrs = ["name", "value"];

// --- Gets the content text of a comment element
function getCommentText(comment: UemlComment): string {
  return comment.text.substring("<!--".length, comment.text.length - "-->".length);
}

function isComponent(obj: ComponentDef | CompoundComponentDef): obj is ComponentDef {
  return (obj as any).type;
}
