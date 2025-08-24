import React, { useState, useEffect } from "react";
import styles from "./HelloWorld.module.scss";
import type { RegisterComponentApiFn } from "xmlui";

type Props = {
  id?: string;
  message?: string;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  onReset?: (event: React.MouseEvent) => void;
  registerComponentApi?: RegisterComponentApiFn;
};

export const defaultProps = {
  message: "Hello, World!",
};

export const HelloWorld = React.forwardRef<HTMLDivElement, Props>(
  function HelloWorld(
    {
      id,
      message = defaultProps.message,
      className,
      onClick,
      onReset,
      registerComponentApi
    },
    ref
  ) {
    const [clickCount, setClickCount] = useState(0);

    // Create setValue method for external API access
    const setValue = (newCount: number) => {
      setClickCount(newCount);
    };

    // Register component API
    useEffect(() => {
      registerComponentApi?.({
        setValue,
        value: clickCount,
      });
    }, [registerComponentApi, setValue, clickCount]);

    const handleClick = (event: React.MouseEvent) => {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      onClick?.(event);
    };

    const handleReset = (event: React.MouseEvent) => {
      setClickCount(0);
      onReset?.(event);
    };

    return (
      <div className={`${styles.container} ${className || ''}`} id={id} ref={ref}>
        <h2 className={styles.message}>{message}</h2>
        <button
           className={styles.button}
              onClick={handleClick}
            >
              Click me!
            </button>
            <div className={styles.counter}>
              Clicks: <span className={styles.count}>{clickCount}</span>
            </div>

            {clickCount > 0 && (
              <button
                className={styles.button}
                onClick={handleReset}
              >
                Reset
              </button>
            )}
          </div>
    );
  }
);
