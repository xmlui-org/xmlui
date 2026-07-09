import type { CSSProperties, ReactNode } from "react";

import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { Toggle as BaseToggle, transformToLegitValue } from "../Toggle/Toggle";
import styles from "../Toggle/Toggle.module.scss";

type ToggleShimProps = {
  value?: unknown;
  enabled?: boolean;
  variant?: "switch" | "checkbox" | string;
  className?: string;
  classes?: Record<string, string>;
  style?: CSSProperties;
  onDidChange?: (value: boolean) => void | Promise<void>;
  inputRenderer?: (
    contextVars: { $checked: boolean; $setChecked: (value: unknown) => void },
    input?: ReactNode,
  ) => ReactNode;
};

export function Toggle({
  value,
  className,
  classes,
  inputRenderer,
  onDidChange,
  ...rest
}: ToggleShimProps) {
  const checked = transformToLegitValue(value);
  const input = (
    <BaseToggle
      {...rest}
      value={value}
      className={inputRenderer ? className : joinClasses(classes?.[COMPONENT_PART_KEY], className)}
      onDidChange={onDidChange}
    />
  );

  if (!inputRenderer) {
    return input;
  }

  return (
    <label className={joinClasses(styles.label, classes?.[COMPONENT_PART_KEY])}>
      <div className={styles.inputContainer}>{input}</div>
      {inputRenderer({
        $checked: checked,
        $setChecked: (nextValue) => {
          void onDidChange?.(transformToLegitValue(nextValue));
        },
      }, input)}
    </label>
  );
}

function joinClasses(...classes: Array<string | undefined>): string | undefined {
  const className = classes.filter(Boolean).join(" ");
  return className || undefined;
}
