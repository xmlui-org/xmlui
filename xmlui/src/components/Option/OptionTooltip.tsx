import type { ReactElement } from "react";

import { parseTooltipOptions, ThemedTooltip as Tooltip } from "../Tooltip/Tooltip";

type OptionTooltipProps = {
  tooltip?: string;
  tooltipOptions?: any;
  children: ReactElement;
};

export function OptionTooltip({ tooltip, tooltipOptions, children }: OptionTooltipProps) {
  if (!tooltip) {
    return children;
  }

  return (
    <Tooltip text={tooltip} {...parseTooltipOptions(tooltipOptions)}>
      {children}
    </Tooltip>
  );
}
