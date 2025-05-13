import * as RadixTooltip from '@radix-ui/react-tooltip';
import styles from './Tooltip.module.scss';
import { useTheme } from "xmlui";

type TooltipProps = {
  trigger: React.ReactNode;
  label: string;
};
export const Tooltip = ({trigger, label}: TooltipProps) => {
  const { root } = useTheme();
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{trigger}</RadixTooltip.Trigger>
        <RadixTooltip.Portal container={root}>
          <RadixTooltip.Content side="bottom" align="start" className={styles.TooltipContent}>
            {label}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>

  )
}
