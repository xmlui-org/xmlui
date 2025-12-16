/**
 * Br Component
 * 
 * Represents an HTML line break element. This component provides a way to insert
 * line breaks in text content within XMLUI markup.
 * 
 * Note: This component is marked as deprecated as part of the HTML tag components
 * deprecation plan. Consider using CSS-based layout solutions or dedicated XMLUI
 * text components for better semantic markup.
 */

import { createComponentRenderer } from "../../components-core/renderers";
import { PropsTrasform } from "../../components-core/utils/extractParam";
import { createMetadata } from "../metadata-helpers";

const COMP = "br";
const BR = "Br";

/**
 * Metadata for the br component
 */
export const BrMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `br` tag for line breaks.",
  isHtmlTag: true,
});

/**
 * Metadata for the Br component (capitalized variant)
 */
export const BrCapitalizedMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `br` tag for line breaks.",
  isHtmlTag: true,
});

/**
 * Renderer for the br component
 */
export const brComponentRenderer = createComponentRenderer(
  COMP,
  BrMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <br className={className} {...props}>
        {renderChild(node.children)}
      </br>
    );
  },
);

/**
 * Renderer for the Br component (capitalized variant)
 */
export const BrComponentRenderer = createComponentRenderer(
  BR,
  BrCapitalizedMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <br className={className} {...props}>
        {renderChild(node.children)}
      </br>
    );
  },
);
