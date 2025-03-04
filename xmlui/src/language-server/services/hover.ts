import type { GetText, ParseResult } from "../../parsers/xmlui-parser/parser";
import { findTokenAtPos } from "../../parsers/xmlui-parser/utils"
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

          const colonIdx = parentNode.children!.findIndex((n: Node) => n.kind === SyntaxKind.Colon);
          const hasNs = colonIdx === -1 ? false : parentNode.children!.slice(0, colonIdx).findIndex((n:Node) => n.kind === SyntaxKind.Identifier) !== -1;
          if(hasNs){
            return null;
          }
          const tagName = getText(atNode);
          const component = metadataByComponent[tagName];
          if (!component){
            return null;
          }
          const value = generateHoverDescription(tagName, component);
          return {
            value,
            range: {
              pos: atNode.pos,
              end: atNode.end
            }
          };
        break;
        }
      }
      break;
  }
  return null;
}

function generateHoverDescription(componentName: string, metadata: any): string {
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

                sections.push(propText);
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
