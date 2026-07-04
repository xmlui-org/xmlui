import classnames from "classnames";

import styles from "./InputAdornment.module.scss";

import { ThemedIcon } from "../Icon/Icon";
import { ThemedText as Text } from "../Text/Text";

interface AdornmentProps {
  iconName?: string;
  text?: string;
  className?: string;
  onClick?: () => void;
  tabIndex?: number;
}

export function Adornment({ iconName, text, className, onClick, tabIndex, ...rest }: AdornmentProps) {
  return (
    <>
      {iconName || text ? (
        <div
          {...rest}
          className={classnames(styles.wrapper, className, {
            [styles.clickable]: !!onClick,
          })}
          role={onClick ? "button" : "presentation"}
          onClick={onClick}
          tabIndex={tabIndex ?? (onClick ? 0 : undefined)}
        >
          <ThemedIcon name={iconName} style={{ color: "inherit" }} />
          {text && (
            <div style={{ display: "flex", userSelect: "none" }}>
              <Text style={{ fontSize: "inherit" }}>{text}</Text>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}
