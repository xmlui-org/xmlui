import React, { useState } from "react";
import classnames from "classnames";
import styles from "./HelloWorld.module.scss";

type Props = {
  id?: string;
  message?: string;
  theme?: "default" | "success";
};

export const defaultProps = {
  message: "Hello, World!",
  theme: "default" as const,
};

export function HelloWorld({
  id,
  message = defaultProps.message,
  theme = defaultProps.theme,
}: Props) {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount(clickCount + 1);
  };

  return (
    <div className={classnames(styles.container, styles[theme])} id={id}>
      <h2 className={styles.message}>{message}</h2>
      <button className={styles.button} onClick={handleClick}>
        Click me!
      </button>
      <div className={styles.counter}>Clicks: {clickCount}</div>
    </div>
  );
}
