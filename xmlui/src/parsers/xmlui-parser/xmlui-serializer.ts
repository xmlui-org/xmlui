import type { ComponentDef, CompoundComponentDef } from "../../abstractions/ComponentDefs";
import type {
  XmlUiAttribute,
  XmlUiComment,
  XmlUiElement,
  XmlUiFragment,
  XmlUiNode,
} from "./xmlui-tree";
import { COMPOUND_COMP_ID } from "./transform";

const attrBreakRegex = /[\r\n<>'"&]/;

/**
 * Helper class for XMLUI serialization and parsing
 */
export class XmlUiHelper {
  /**
   * Serialize the specified XML fragment into a string
   * @param xml XML fragment to serialize
   * @param options Formatting options to use
   */
  serialize(xml: XmlUiFragment, options?: XmluiSerializationOptions): string {
    const fragment = Array.isArray(xml) ? xml : [xml];
    return serializeFragment(fragment, 0);

    function serializeFragment(nodes: XmlUiNode[], depth: number): string {
      return nodes
        .map((n) => serializeNode(n, depth))
        .join(options?.prettify ? "\n" + getIndent(depth) : "");
    }

    function serializeNode(node: XmlUiNode, depth: number): string {
      switch (node.type) {
        case "XmlUiComment":
          return serializeXmlComment(node, depth);
        case "XmlUiElement":
          return serializeXmlElement(node, depth);
        default:
          return "";
      }
    }

    function getIndent(depth: number): string {
      return options?.prettify ? "".padEnd((options?.indents ?? 2) * depth, " ") : "";
    }

    function serializeXmlComment(node: XmlUiComment, depth: number): string {
      return `${getIndent(depth)}<!--${node.text}-->`;
    }

    function serializeXmlElement(node: XmlUiElement, depth: number): string {
      let elementStr = `${getIndent(depth)}<${nodeName()}`;
      const hasAttrs = (node.attributes?.length ?? 0) > 0;
      const hasChildren = (node.childNodes?.length ?? 0) > 0;
      if (node.text || hasAttrs || hasChildren) {
        // --- Indicate that the node has not yet been broken into multiple lines
        if (hasAttrs) {
          // --- Render attributes
          const attrTexts = node.attributes!.map((a) => serializeXmlAttribute(a));
          if (!options?.prettify) {
            elementStr += " " + attrTexts.join(" ");
          } else {
            // --- Check line overflow
            const nodeLength =
              elementStr.length +
              1 + // --- Space after
              attrTexts.join(" ").length + // --- Attributes total length
              (hasChildren ? 1 : (options?.useSpaceBeforeClose ?? false) ? 3 : 2); // --- Closing token length
            if (nodeLength > (options?.lineLength ?? 80)) {
              // --- Too long, break attributes into new lines
              attrTexts.forEach((text) => {
                elementStr += "\n" + getIndent(depth + 1) + text;
              });
              if (options?.breakClosingTag ?? false) {
                elementStr += "\n" + getIndent(depth);
              }
            } else {
              // --- Attributes fit into the line
              elementStr += " " + attrTexts.join(" ");
            }
          }
        }
        if (node.text || hasChildren) {
          // --- Close the opening tag
          elementStr += ">";

          // --- Render the text
          if (node.text) {
            const textContents = node.preserveSpaces
              ? serializeQuotedText(node.text)
              : serializeText(node.text);
            if (
              options?.prettify &&
              elementStr.length + textContents.length + node.name.length + 3 >
                (options?.lineLength ?? 80)
            ) {
              // --- break text
              elementStr += "\n" + getIndent(depth + 1) + textContents + "\n";
            } else {
              elementStr += textContents;
            }
          }

          // --- Render child nodes
          if (hasChildren) {
            const childrenTexts = node.childNodes!.map((c) => serializeNode(c, depth + 1));
            if (!options?.prettify) {
              elementStr += childrenTexts.join("");
            } else {
              childrenTexts.forEach((text) => {
                elementStr += "\n" + text;
              });
              elementStr += "\n";
            }
          }

          // --- Render the closing tag
          elementStr += `${getIndent(depth)}</${node.name}>`;
        } else {
          elementStr += ((options?.useSpaceBeforeClose ?? false) ? " " : "") + "/>";
        }
      } else {
        elementStr += ((options?.useSpaceBeforeClose ?? false) ? " " : "") + "/>";
        if (node.text === "") {
          elementStr += `""</${nodeName()}>`;
        }
      }

      return elementStr;

      function nodeName(): string {
        return node.namespace ? `${node.namespace}:${node.name}` : node.name;
      }
    }

    function serializeXmlAttribute(node: XmlUiAttribute): string {
      // --- Handle valueless attributes
      if (node.value === undefined || node.value === null) {
        return `${nodeName()}`;
      }

      // --- Use quotes when required so
      if (node.preserveSpaces) {
        return `${nodeName()}=${serializeQuotedText(node.value)}`;
      }

      // --- Do the rest
      const value = node.value ?? "";
      return `${nodeName()}=${serializeQuotedText(value)}`;

      function nodeName(): string {
        return node.namespace ? `${node.namespace}:${node.name}` : node.name;
      }
    }

    function serializeText(text: string): string {
      return options?.useQuotes || attrBreakRegex.test(text) ? serializeQuotedText(text) : text;
    }

    function serializeQuotedText(text: string): string {
      const containsQuote = text.indexOf("'") >= 0;
      const containsDQuote = text.indexOf('"') >= 0;
      if ((!containsQuote && !containsDQuote) || (containsQuote && !containsDQuote)) {
        return `"${text.replaceAll("`", "\\`")}"`;
      }
      if (containsDQuote && !containsQuote) {
        return `'${text.replaceAll("`", "\\`")}'`;
      }
      return `\`${text.replaceAll("`", "\\`")}\``;
    }
  }

  /**
   * Transform the specified component definition into an XMLUI node
   * @param def Component definitions
   * @param options Transformation options
   */
  transformComponentDefinition(
    def: ComponentDef | CompoundComponentDef,
    options?: XmlUiTransformOptions,
  ): XmlUiFragment {
    return (def as any).type
      ? this.transformSimpleComponentDefinition(def as ComponentDef, options)
      : this.transformCompoundComponentDefinition(def as CompoundComponentDef, options);
  }

  /**
   * Transform the specified object into an XMLUI nodes
   * @param def Object definition
   * @param options Transformation options
   */
  transformObject(def: Record<string, any>, options?: XmlUiTransformOptions): XmlUiNode[] | null {
    const transformed = this.transformValue("Object", "", def, options);
    if (!transformed) {
      return null;
    }
    return transformed.childNodes ?? [];
  }

  /**
   * Transforms the specified simple component definition into an XMLUI node
   * @param def Component definition
   * @param options Transformation options
   */
  private transformSimpleComponentDefinition(
    def: ComponentDef,
    options?: XmlUiTransformOptions,
  ): XmlUiFragment {
    const componentNode: XmlUiElement = {
      type: "XmlUiElement",
      name: def.type,
    };

    // --- Fundamental props
    if (def.uid !== undefined) {
      this.addProperty(componentNode, "id", def.uid, options);
    }
    if (def.testId !== undefined) {
      this.addProperty(componentNode, "testId", def.testId, options);
    }
    if (def.when !== undefined) {
      this.addProperty(componentNode, "when", def.when, options);
    }

    // --- Process vars
    if (def.vars) {
      Object.keys(def.vars).forEach((key) => {
        const varElement = this.transformValue("var", key, def.vars![key], options);
        if (varElement === null) return;
        componentNode.childNodes ??= [];
        componentNode.childNodes.push(varElement);
      });
    }

    // --- Process properties
    if (def.props) {
      Object.keys(def.props).forEach((key) => {
        // --- Special serialization for component-aware props
        const propValue = def.props![key];
        if (key.endsWith("Template") && (propValue as any).type) {
          // --- Consider this property holds a component
          componentNode.childNodes ??= [];
          const propWrapper: XmlUiElement = {
            type: "XmlUiElement",
            name: "property",
            attributes: [
              {
                type: "XmlUiAttribute",
                name: "name",
                value: key,
              },
            ],
          };
          this.addComponentElement(propWrapper, propValue as ComponentDef);
          componentNode.childNodes.push(propWrapper);
        } else {
          // --- Undefined is not serialized
          if (propValue === undefined) {
            return;
          }

          // --- Handle null property value
          if (propValue === null) {
            const nullPropElement: XmlUiElement = {
              type: "XmlUiElement",
              name: "property",
              attributes: [
                {
                  type: "XmlUiAttribute",
                  name: "name",
                  value: key,
                },
              ],
            };
            componentNode.childNodes ??= [];
            componentNode.childNodes.push(nullPropElement);
            return;
          }

          // --- Extract prop if asked so, or if those are special, like "id", "when", or "testIs"
          if (key === "id" || key === "when" || key === "testId" || options?.extractProps) {
            const idPropElement: XmlUiElement = {
              type: "XmlUiElement",
              name: "property",
            };
            this.addProperty(idPropElement, key, propValue, options);
            componentNode.childNodes ??= [];
            componentNode.childNodes.push(idPropElement);
            return;
          }

          // --- Add property as the best according to the value
          this.addProperty(componentNode, key, propValue, options);
        }
      });
    }

    // --- Process events
    if (def.events) {
      Object.keys(def.events).forEach((key) => {
        const eventElement = this.transformValue("event", key, def.events![key], options);
        if (eventElement === null) return;
        componentNode.childNodes ??= [];
        componentNode.childNodes.push(eventElement);
      });
    }

    // --- Process loaders
    if (def.loaders) {
      this.addComponentList(componentNode, "loaders", def.loaders);
    }

    // --- Process APIs
    if (def.api) {
      Object.keys(def.api).forEach((key) => {
        const apiElement = this.transformValue("api", key, def.api![key], options);
        if (apiElement === null) return;
        componentNode.childNodes ??= [];
        componentNode.childNodes.push(apiElement);
      });
    }

    // --- Process uses
    if (def.uses) {
      this.addList(componentNode, "uses", "", def.uses, options);
    }

    // --- Process children
    if (def.children) {
      if (typeof def.children === "string") {
        this.addProperty(componentNode, "children", def.children, options);
      } else {
        def.children.forEach((ch) => {
          this.addComponentElement(componentNode, ch);
        });
      }
    }

    // --- Done
    return componentNode;
  }

  /**
   * Transforms the specified simple component definition into an Xml node
   * @param def Compound component definition
   * @param options Transformation options
   */
  private transformCompoundComponentDefinition(
    def: CompoundComponentDef | string,
    options?: XmlUiTransformOptions,
  ): XmlUiFragment {
    if (typeof def === "string") {
      return {
        type: "XmlUiElement",
        name: def,
      } as XmlUiElement;
    }

    const nested: XmlUiFragment = this.transformSimpleComponentDefinition(def.component, options);
    const componentNode: XmlUiElement = {
      type: "XmlUiElement",
      name: COMPOUND_COMP_ID,
      attributes: [
        {
          type: "XmlUiAttribute",
          name: "name",
          value: def.name,
        },
      ],
      childNodes: Array.isArray(nested) ? [...nested] : [nested],
    };

    // --- Transform APIs
    if (def.api) {
      Object.keys(def.api).forEach((key) => {
        const apiElement = this.transformValue("api", key, def.api![key], options);
        if (apiElement === null) return;
        componentNode.childNodes ??= [];
        componentNode.childNodes.push(apiElement);
      });
    }

    // --- Done
    return componentNode;
  }

  /**
   * Transforms a value into an XMLUI element
   * @param nodeName Name of the value node
   * @param name Optional (property) name
   * @param value Value to transform
   * @param options Transformation options
   */
  private transformValue(
    nodeName: string,
    name: string | undefined,
    value: any,
    options?: XmlUiTransformOptions,
  ): XmlUiElement | null {
    // --- Do not transform undefined elements
    if (value === undefined) return null;

    // --- Prepare the node with the value
    const valueNode: XmlUiElement = {
      type: "XmlUiElement",
      name: nodeName,
    };
    if (name) {
      valueNode.attributes = [
        {
          type: "XmlUiAttribute",
          name: "name",
          value: name,
        },
      ];
    }

    // --- Extend the node according to the specified value
    // --- Null value: we're done
    if (value === null) {
      return valueNode;
    }

    // --- Simple value: use text or value attribute
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      const strValue = typeof value === "string" ? value.toString() : `{${value.toString()}}`;
      const preserveSpaces =
        attrBreakRegex.test(strValue) || strValue.trim().length != strValue.length;
      if (options?.preferTextToValue) {
        valueNode.text = strValue;
        valueNode.preserveSpaces = preserveSpaces;
      } else {
        valueNode.attributes ??= [];
        valueNode.attributes.push({
          type: "XmlUiAttribute",
          name: "value",
          value: strValue,
          preserveSpaces,
        });
      }
      return valueNode;
    }

    // --- Array value
    if (Array.isArray(value)) {
      if (value.length === 0) {
        // --- Empty array
        valueNode.attributes ??= [];
        valueNode.attributes.push({
          type: "XmlUiAttribute",
          name: "value",
          value: "{[]}",
        });
      } else {
        value.forEach((item) => {
          const itemElement = this.transformValue("item", undefined, item, options);
          if (!itemElement) return;
          valueNode.childNodes ??= [];
          valueNode.childNodes.push(itemElement);
        });
      }
    } else if (typeof value === "object") {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        // --- Empty object
        valueNode.attributes ??= [];
        valueNode.attributes.push({
          type: "XmlUiAttribute",
          name: "value",
          value: "{{}}",
        });
      } else {
        keys.forEach((key) => {
          const fieldElement = this.transformValue("field", key, value[key], options);
          if (!fieldElement) return;
          valueNode.childNodes ??= [];
          valueNode.childNodes.push(fieldElement);
        });
      }
    } else {
      throw new Error(`Cannot serialize '${typeof value}' value`);
    }

    return valueNode;
  }

  /**
   * Transforms the specified simple component definition into an Xml node
   * @param name Element name
   * @param value Value to transform
   * @param options Transformation options
   */
  private transformObjectValue(
    name: string,
    value: any,
    options?: XmlUiTransformOptions,
  ): XmlUiNode {
    const componentNode: XmlUiElement = {
      type: "XmlUiElement",
      name: name,
    };

    if (value) {
      Object.keys(value).forEach((key) =>
        this.addProperty(componentNode, key, value[key], options),
      );
    }
    return componentNode;
  }

  /**
   * Add a property to the specified XMLUI element
   * @param element XML element
   * @param name Element name
   * @param value Element value
   * @param options Transformation options
   */
  private addProperty(
    element: XmlUiElement,
    name: string,
    value: any,
    options?: XmlUiTransformOptions,
  ): void {
    switch (typeof value) {
      // --- We do not serialize undefined property values
      case "undefined":
        break;
      case "string":
        element.attributes ??= [];
        element.attributes.push({
          type: "XmlUiAttribute",
          name,
          value: value?.toString(),
          preserveQuotes: options?.removeQuotes ?? false,
          preserveSpaces: attrBreakRegex.test(value.toString()),
        });
        break;
      case "boolean":
      case "number":
      case "object":
        const objElement = this.transformValue("property", name, value, options);
        if (objElement) {
          element.childNodes ??= [];
          element.childNodes.push(objElement);
        }
        break;
      default:
        throw new Error(`'${typeof value}' transformation is not implemented yet`);
    }
  }

  private addComponentElement(element: XmlUiElement, component: ComponentDef): void {
    element.childNodes ??= [];
    const childDef = this.transformComponentDefinition(component);
    if (Array.isArray(childDef)) {
      element.childNodes.push(...childDef);
    } else {
      element.childNodes.push(childDef);
    }
  }

  /**
   * Adds a list to the specified XML element
   * @param element XML element
   * @param name Name of the list (child in `element`)
   * @param prefix Prefix to use for the list
   * @param list List with items
   * @param options Transformation options
   */
  private addList(
    element: XmlUiElement,
    name: string,
    prefix: string,
    list: any[],
    options?: XmlUiTransformOptions,
  ): void {
    const nodeName = `${prefix ? prefix + "." : ""}${name}`;
    element.childNodes ??= [];
    list.forEach((item) => {
      if (typeof item === "string") {
        // --- Special case, the item can be the text of an XML element
        element.childNodes!.push({
          type: "XmlUiElement",
          name: nodeName,
          text: item,
          preserveSpaces: attrBreakRegex.test(item) || item !== item.trim() || item === "",
        });
      } else if (item === null) {
        element.childNodes!.push({
          type: "XmlUiElement",
          name: nodeName,
        });
      } else {
        const transformed = this.transformObjectValue(nodeName, item, options);
        if (Array.isArray(transformed)) {
          element.childNodes!.push(...transformed);
        } else {
          element.childNodes!.push(transformed);
        }
      }
    });
  }

  /**
   * Adds a component list to the specified element
   * @param element XML element
   * @param name Name to use for the wrapper element
   * @param list List with component items
   * @private
   */
  private addComponentList(element: XmlUiElement, name: string, list: ComponentDef[]): void {
    const children: XmlUiNode[] = [];
    list.forEach((item) => {
      const fragment = this.transformSimpleComponentDefinition(item);
      if (Array.isArray(fragment)) {
        children.push(...fragment);
      } else {
        children.push(fragment);
      }
    });
    const listElement: XmlUiElement = {
      type: "XmlUiElement",
      name,
      childNodes: children,
    };
    element.childNodes ??= [];
    element.childNodes.push(listElement);
  }
}

/**
 * Options to use with markup transformation from memory format to XMLUI structure
 */
export type XmlUiTransformOptions = {
  preserveLineBreaks?: boolean;
  preserveSpecialChars?: boolean;
  removeQuotes?: boolean;
  extractProps?: boolean;
  preferTextToValue?: boolean;
};

export type XmluiSerializationOptions = {
  // --- Should prettify the output?
  prettify?: boolean;

  // --- Number of spaces to use for indentation
  indents?: number;

  // --- Max line length before breaking down attributes or text
  lineLength?: number;

  // --- Forces using quotes
  useQuotes?: boolean;

  // --- Use a space before "/>" ?
  useSpaceBeforeClose?: boolean;

  // --- Break closing tag into a new line
  breakClosingTag?: boolean;
};
