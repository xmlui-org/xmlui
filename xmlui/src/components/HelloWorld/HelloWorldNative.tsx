import React, { useState, useEffect } from "react";
import classnames from "classnames";
import { useEvent } from "../../components-core/utils/misc";
import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import styles from "./HelloWorld.module.scss";

type Props = {
  id?: string;
  message?: string;
  theme?: "default" | "success";
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  onReset?: (event: React.MouseEvent) => void;
  registerComponentApi?: RegisterComponentApiFn;
  updateState?: UpdateStateFn;
};

export const defaultProps: Partial<Props> = {
  message: "Hello, World!",
  theme: "default",
};

export const HelloWorld = React.forwardRef<HTMLDivElement, Props>(
  function HelloWorld(
    {
      id,
      message = defaultProps.message,
      theme = defaultProps.theme,
      children,
      style,
      className,
      onClick,
      onReset,
      registerComponentApi,
      updateState,
      ...rest
    },
    ref
  ) {
    const [clickCount, setClickCount] = useState(0);

    const setValue = useEvent((newCount: number) => {
      setClickCount(newCount);
      updateState?.({ value: newCount });
    });

    // Sync clickCount with XMLUI state system (like AppState does)
    useEffect(() => {
      updateState?.({ value: clickCount });
    }, [updateState, clickCount]);

    useEffect(() => {
      registerComponentApi?.({
        setValue,
      });
    }, [registerComponentApi, setValue]);

    const handleClick = (event: React.MouseEvent) => {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      updateState?.({ value: newCount });
      // Call XMLUI event handler if provided
      onClick?.(event);
    };

    const handleReset = (event: React.MouseEvent) => {
      setClickCount(0);
      updateState?.({ value: 0 });
      // Call XMLUI event handler if provided
      onReset?.(event);
    };

    return (
      <div
        {...rest}
        id={id}
        ref={ref}
        className={classnames(className, styles.helloWorld, {
          [styles.success]: theme === "success",
        })}
        style={style}
      >
        <div className={styles.content}>
          <h3 className={styles.message}>{message}</h3>

          {children && (
            <div className={styles.children}>{children}</div>
          )}

          <div className={styles.interactive}>
            <button
              className={styles.clickButton}
              onClick={handleClick}
            >
              Click me!
            </button>

            <div className={styles.counter}>
              Clicks: <span className={styles.count}>{clickCount}</span>
            </div>

            {clickCount > 0 && (
              <button
                className={styles.resetButton}
                onClick={handleReset}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);
