import type { GetText, ParseResult } from "../../parsers/xmlui-parser/parser";
import { findTokenAtPos, toDbgString } from "../../parsers/xmlui-parser/utils"
import { SyntaxKind } from "../../parsers/xmlui-parser/syntax-kind";
import metadataByComponent from "../metadata";
import type { Node } from "../../parsers/xmlui-parser/syntax-node";

type SimpleHover = null | {
  value: string;
  range: {
    pos: number;
    end: number;
  };
};

/**
 * @returns The hover content string
 */
export function handleHover({ parseResult: {node}, getText }: {parseResult: ParseResult, getText: GetText}, position: number): SimpleHover {
  const findRes = findTokenAtPos(node, position);
  console.log("findres: ",findRes);

  if (findRes === undefined) {
    return null;
  }
  const { chainAtPos } = findRes;

  const atNode = chainAtPos.at(-1)!;
  const parentNode =chainAtPos.at(-2);
  console.log("hovering: ", atNode, parentNode);
  switch (atNode.kind) {
    case SyntaxKind.Identifier:
      switch (parentNode?.kind){
        case SyntaxKind.TagNameNode:{
          return hoverName(parentNode, atNode, getText);
        }
        case SyntaxKind.AttributeKeyNode:{
          return hoverAttr(parentNode, chainAtPos.slice(0, -2), getText);
        }
      }
      break;
  }
  return null;
}

function hoverAttr(attrKeyNode: Node, parentStack: Node[], getText: GetText): SimpleHover {
  if (parentStack.at(-1).kind !== SyntaxKind.AttributeNode){
    return null;
  }
  if (parentStack.at(-2).kind !== SyntaxKind.AttributeListNode){
    return null;
  }
  // console.log(parentStack.map(n => toDbgString(n, getText)));
  const tag = parentStack.at(-3);
  if (tag?.kind !== SyntaxKind.ElementNode){
    return null;
  }
  const tagNameNode = tag.children!.find(c => c.kind === SyntaxKind.TagNameNode);
  if (!tagNameNode){
    return null;
  }

  const compName = compNameFromTagNameNode(tagNameNode, getText);
  if (!compName){
    return null;
  }

  const component = metadataByComponent[compName];
  if (!component){
    return null;
  }
  const attrKeyChildren = attrKeyNode.children!;
  const identIdx = attrKeyChildren.findIndex(c => c.kind === SyntaxKind.Identifier);


  if (identIdx === -1){
    return null;
  }

  console.log("here")
  const attrIdent = attrKeyChildren[identIdx];
  const propIsNamespaceDefinition = attrKeyChildren[identIdx + 1]?.kind === SyntaxKind.Colon && attrKeyChildren[identIdx + 2]?.kind === SyntaxKind.Identifier && getText(attrIdent) === "xmlns";

  if (propIsNamespaceDefinition){
    return {
      value: `Defines a namespace. TODO Further Documentation needed.`,
      range:{
        pos: attrKeyNode.pos,
        end: attrKeyNode.end
      }
    }
  }

  const propName = getText(attrIdent);

  const propMetadata = component.props?.[propName]
  if (!propMetadata){
    return null;
  }
  const value = generatePropDescription(propName, propMetadata);
  return {
    value,
    range: {
      pos: attrKeyNode.pos,
      end: attrKeyNode.end
    }
  }
}

function hoverName(tagNameNode: Node, identNode: Node, getText: GetText): SimpleHover {
  const compName = compNameFromTagNameNode(tagNameNode, getText)
  console.log({ compName })
  if (!compName) {
    return null;
  }
  const compMetadata = metadataByComponent[compName];
  if (!compMetadata) {
    return null;
  }
  const value = generateCompNameDescription(compName, compMetadata);
  console.log({value})
  return {
    value,
    range: {
      pos: identNode.pos,
      end: identNode.end
    }
  };
}

function compNameFromTagNameNode(tagNameNode: Node, getText: GetText): string | null{
  const colonIdx = tagNameNode.children!.findIndex((n) => n.kind === SyntaxKind.Colon);
  const hasNs = colonIdx === -1 ? false : tagNameNode.children!.slice(0, colonIdx).findIndex((n:Node) => n.kind === SyntaxKind.Identifier) !== -1;
  if(hasNs){
    return null;
  }
  const nameNode = tagNameNode.children!.findLast(c => c.kind === SyntaxKind.Identifier)
  return getText(nameNode);
}

function generateCompNameDescription(componentName: string, metadata: any): string {
  const sections: string[] = [];

  // Add title and description
  sections.push(`# ${componentName}`);

  if (metadata.description) {
    sections.push(metadata.description);
  }

  // Add status if not stable
  if (metadata.status && metadata.status !== 'stable') {
    sections.push(`**Status:** ${metadata.status}`);
  }

  // Add Properties section if there are props
  if (metadata.props && Object.keys(metadata.props).length > 0) {
    sections.push('\n## Properties');

    Object.entries(metadata.props)
      .filter(([_, prop]) => !(prop as any).isInternal)
      .forEach(([propName, prop]) => {
        sections.push(generatePropDescription(propName, prop));
      });
  }

  // Add Events section if there are events
  if (metadata.events && Object.keys(metadata.events).length > 0) {
    sections.push('\n## Events');

    Object.entries(metadata.events)
      .filter(([_, event]) => !(event as any).isInternal)
      .forEach(([eventName, event]) => {
        sections.push(`### \`${eventName}\`\n${(event as any).description}`);
      });
  }

  // Add APIs section if there are APIs
  if (metadata.apis && Object.keys(metadata.apis).length > 0) {
    sections.push('\n## APIs');

    Object.entries(metadata.apis)
      .filter(([_, api]) => !(api as any).isInternal)
      .forEach(([apiName, api]) => {
        sections.push(`### \`${apiName}\`\n${(api as any).description}`);
      });
  }

  // Add Context Variables section if there are any
  if (metadata.contextVars && Object.keys(metadata.contextVars).length > 0) {
    sections.push('\n## Context Variables');

    Object.entries(metadata.contextVars)
      .filter(([_, contextVar]) => !(contextVar as any).isInternal)
      .forEach(([varName, contextVar]) => {
        sections.push(`### \`${varName}\`\n${(contextVar as any).description}`);
      });
  }

  return sections.join('\n\n');
}

function generatePropDescription(propName: string, prop: any){
  let propText = `### \`${propName}\`\n${(prop as any).description}`;

  if ((prop as any).defaultValue !== undefined) {
    propText += `\n\nDefault: \`${(prop as any).defaultValue}\``;
  }

  if ((prop as any).availableValues) {
    const values = (prop as any).availableValues.map(v =>
      typeof v === 'object' ?
      `- \`${v.value}\`: ${v.description}` :
      `- \`${v}\``
    ).join('\n');
    propText += `\n\nAllowed values:\n${values}`;
  }

  return propText;
}
