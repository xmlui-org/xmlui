import classNames from "classnames";

import styles from "./StateViewer.module.scss";

type Props = {
  children?: React.ReactNode;
  showBoundary?: boolean;
  blink?: boolean;
  state?: any;
};

export const StateViewer = ({ children, state, showBoundary = true, blink = true }: Props) => {
  return (
    <div
      className={classNames(styles.stateViewerContainer)}
      style={{ width: "inherit", height: "inherit" }}
    >
      {children}
      <div
        className={classNames(styles.overlay, {
          [styles.showBoundary]: showBoundary,
        })}
      >
        <div
          className={classNames(styles.marker, {
            [styles.blink]: blink,
          })}
          onClick={() => {
            console.log(state);
          }}
        />
      </div>
    </div>
  );
};
