import React, { useRef, useImperativeHandle, useState } from "react";
import classnames from "classnames";
import styles from "./HelloWorld.module.scss";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";

type Props = {
  id?: string;
  message?: string;
  theme?: "default" | "success" | "warning" | "error";
  showCounter?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  // Event handlers
  onClick?: (clickCount: number) => void;
  onReset?: () => void;
  // XMLUI API registration
  registerComponentApi?: RegisterComponentApiFn;
};

// Define the ref interface for exposed methods
export interface HelloWorldRef {
  reset: () => void;
  getClickCount: () => number;
}

export const defaultProps: Partial<Props> = {
  message: "Hello, World!",
  theme: "default",
  showCounter: true,
};

export const HelloWorld = React.forwardRef<HelloWorldRef, Props>(
  function HelloWorld(
    {
      id,
      message = defaultProps.message,
      theme = defaultProps.theme,
      showCounter = defaultProps.showCounter,
      children,
      style,
      className,
      onClick,
      onReset,
      registerComponentApi,
      ...rest
    },
    ref
  ) {
    const innerRef = useRef<HTMLDivElement>(null);
    const [clickCount, setClickCount] = useState(0);

    // Temporarily removed for Edge compatibility testing
    // const apiRef = useRef<HelloWorldRef>({
    //   reset: () => {
    //     setClickCount(0);
    //     onReset?.();
    //   },
    //   getClickCount: () => clickCount,
    // });

    // // Update the API ref when clickCount changes
    // apiRef.current.getClickCount = () => clickCount;

    // useImperativeHandle(ref, () => apiRef.current);

    // // Register the API with XMLUI when component mounts
    // React.useEffect(() => {
    //   // Temporarily disabled for Edge compatibility testing
    //   // if (registerComponentApi) {
    //   //   registerComponentApi({
    //   //     reset: () => setClickCount(0),
    //   //     getClickCount: () => clickCount,
    //   //   });
    //   // }
    // }, [registerComponentApi]);

    const handleClick = () => {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      onClick?.(newCount);
    };

    const handleReset = () => {
      setClickCount(0);
      onReset?.();
    };

    return (
      <div
        {...rest}
        id={id}
        ref={innerRef}
        className={classnames(className, styles.helloWorld, {
          [styles.success]: theme === "success",
          [styles.warning]: theme === "warning",
          [styles.error]: theme === "error",
          [styles.default]: theme === "default",
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
            
            {showCounter && (
              <div className={styles.counter}>
                Clicks: <span className={styles.count}>{clickCount}</span>
              </div>
            )}
            
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
