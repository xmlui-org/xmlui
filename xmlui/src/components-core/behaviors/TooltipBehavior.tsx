import { parseTooltipOptions, Tooltip } from "../../components/Tooltip/TooltipNative";
import { Behavior } from "./Behavior";

/**
 * Behavior for applying tooltips to components.
 */
export const tooltipBehavior: Behavior = {
  metadata: {
    name: "tooltip",
    description:
      "Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.",
    triggerProps: ["tooltip", "tooltipMarkdown"],
    props: {
      tooltip: {
        valueType: "string",
        description: "The text to display in the tooltip. Can be plain text or markdown.",
      },
      tooltipMarkdown: {
        valueType: "string",
        description:
          "The markdown text to display in the tooltip. Takes precedence over 'tooltip' if both are provided.",
      },
      tooltipOptions: {
        valueType: "any",
        description: "Options for configuring the tooltip behavior, such as delay and position.",
      },
    },
    condition: {
      type: "visual",
    },
  },
  canAttach: (context, node, metadata) => {
    if (metadata?.nonVisual) {
      return false;
    }
    const { extractValue } = context;
    const tooltipText = extractValue(node.props?.tooltip, true);
    const tooltipMarkdown = extractValue(node.props?.tooltipMarkdown, true);
    return !!tooltipText || !!tooltipMarkdown;
  },
  attach: (context, node, metadata) => {
    const { extractValue } = context;
    const tooltipText = extractValue(context.node.props?.tooltip, true);
    const tooltipMarkdown = extractValue(context.node.props?.tooltipMarkdown, true);
    const tooltipOptions = extractValue(context.node.props?.tooltipOptions, true);
    const parsedOptions = parseTooltipOptions(tooltipOptions);

    return (
      <Tooltip text={tooltipText} markdown={tooltipMarkdown} {...parsedOptions}>
        {node}
      </Tooltip>
    );
  },
};
