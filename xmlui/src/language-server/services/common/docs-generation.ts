import type { ComponentMetadata, ComponentPropertyMetadata } from "../../../abstractions/ComponentDefs";

export function generateCompNameDescription(componentName: string, metadata: ComponentMetadata): string {
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
        sections.push(generateAttrDescription(propName, prop));
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

export function generateAttrDescription(attrName: string, attrMd: ComponentPropertyMetadata) {
  let propText = `\`${attrName}\``;

  if (attrMd.isRequired) {
    propText += " (required)";
  }

  propText += ": ";

  if (attrMd.description) {
    propText += attrMd.description;
  }

  if (attrMd.defaultValue !== undefined) {
    propText += `\n\nDefault: \`${attrMd.defaultValue}\``;
  }

  if (attrMd.availableValues && attrMd.availableValues.length > 0) {
    const values = attrMd.availableValues.map(v =>
      typeof v === 'object' ?
      `- \`${v.value}\`: ${v.description}` :
      `- \`${v}\``
    ).join('\n');
    propText += `\n\n**Allowed values**:\n${values}`;
  }

  return propText;
}
