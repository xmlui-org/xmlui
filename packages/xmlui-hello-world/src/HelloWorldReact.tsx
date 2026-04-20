import React, { memo, useCallback, useState, useEffect } from "react";
import classnames from "classnames";
import styles from "./HelloWorld.module.scss";
import type { RegisterComponentApiFn } from "xmlui";

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> & {
  message?: string;
  onClick?: (event: React.MouseEvent) => void;
  onReset?: (event: React.MouseEvent) => void;
  classes?: Record<string, string>;
  registerComponentApi?: RegisterComponentApiFn;
};

export const defaultProps = {
  message: "Hello, World!",
};

export const HelloWorld = memo(
  React.forwardRef<HTMLDivElement, Props>(
    function HelloWorld(
      {
        message = defaultProps.message,
        className,
        classes,
        onClick,
        onReset,
        registerComponentApi,
        ...rest
      },
      ref,
    ) {
      const [clickCount, setClickCount] = useState(0);

      const setValue = useCallback((newCount: number) => {
        setClickCount(newCount);
      }, []);

      useEffect(() => {
        registerComponentApi?.({
          setValue,
          value: clickCount,
        });
      }, [registerComponentApi, setValue, clickCount]);

      const handleClick = useCallback(
        (event: React.MouseEvent) => {
          const newCount = clickCount + 1;
          setClickCount(newCount);
          onClick?.(event);
        },
        [clickCount, onClick],
      );

      const handleReset = useCallback(
        (event: React.MouseEvent) => {
          setClickCount(0);
          onReset?.(event);
        },
        [onReset],
      );

      return (
        <div
          {...rest}
          ref={ref}
          className={classnames(styles.container, classes?.["-component"], className)}
        >
          <h2 className={styles.message}>{message}</h2>
          <button className={styles.button} onClick={handleClick}>
            Click me!
          </button>
          <div className={styles.counter}>
            Clicks: <span className={styles.count}>{clickCount}</span>
          </div>

          {clickCount > 0 && (
            <button className={styles.button} onClick={handleReset}>
              Reset
            </button>
          )}
        </div>
      );
    },
  ),
);
