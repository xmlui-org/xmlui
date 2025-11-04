import styles from "./PlaygroundContent.module.scss";
import { usePlayground } from "../hooks/usePlayground";
import classnames from "classnames";
import { Preview } from "./Preview";
import { Splitter } from "xmlui";

type PlaygroundContentProps = {
  height?: number | string;
  initialPrimarySize?: string;
  standalone?: boolean;
};

export const PlaygroundContent = ({
  height,
  initialPrimarySize,
  standalone,
}: PlaygroundContentProps) => {
  const { options, status, editorStatus, appDescription } = usePlayground();

  return (
    <div
      className={classnames(styles.playgroundContent, {
        [styles.standaloneMode]: standalone,
      })}
      style={{ height }}
    >
      {status === "loaded" &&
        (standalone ? (
          options.previewMode ? (
            <Preview />
          ) : (
            <Splitter
              orientation={options.orientation}
              swapped={options.swapped}
              initialPrimarySize={initialPrimarySize}
            ></Splitter>
          )
        ) : (
          <Preview />
        ))}
    </div>
  );
};
