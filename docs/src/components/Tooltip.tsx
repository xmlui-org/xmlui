import * as RadixTooltip from '@radix-ui/react-tooltip';
import styles from './Tooltip.module.scss';

type TooltipProps = {
  trigger: React.ReactNode;
  label: string;
};
export const Tooltip = ({trigger, label}: TooltipProps) => {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{trigger}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content side="bottom" align="start" className={styles.TooltipContent}>
            {label}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>

  )
}