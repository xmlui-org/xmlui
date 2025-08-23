import React, { useState } from "react";
import styles from "./HelloWorld.module.scss";

type Props = {
  id?: string;
  message?: string;
};

export const defaultProps = {
  message: "Hello, World!",
};

export function HelloWorld({
  id,
  message = defaultProps.message,
}: Props) {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount(clickCount + 1);
  };

  return (
    <div className={styles.container} id={id}>
      <h2 className={styles.message}>{message}</h2>
      <button className={styles.button} onClick={handleClick}>
        Click me!
      </button>
      <div className={styles.counter}>Clicks: {clickCount}</div>
    </div>
  );
}
