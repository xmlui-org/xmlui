import { Icon } from "@components/Icon/IconNative";
import { Text } from "../Text/TextNative";
import styles from "./InputAdornment.module.scss";
import classnames from "@components-core/utils/classnames";

interface AdornmentProps {
  iconName?: string;
  text?: string;
  className?: string;
}

export function Adornment({ iconName, text, className }: AdornmentProps) {
  return (
    <>
      {iconName || text ? (
        <div className={classnames(styles.wrapper, className)}>
          <Icon name={iconName} layout={{ color: "inherit" }} />
          {text && (
            <div style={{ display: "flex", userSelect: "none" }}>
              <Text layout={{ fontSize: "inherit" }}>{text}</Text>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}
