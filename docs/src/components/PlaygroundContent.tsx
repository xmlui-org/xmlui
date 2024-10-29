import { Preview } from "@/src/components/Preview";
import { Editor } from "@/src/components/Editor";
import { Splitter } from "@components/Splitter/SplitterNative";
import styles from "@/src/components/PlaygroundContent.module.scss";
import { usePlayground } from "@/src/hooks/usePlayground";
import classnames from "classnames";
import React from "react";

type PlaygroundContentProps = {
  height?: number | string;
  initialPrimarySize?: string;
  standalone?: boolean;
  loading?: boolean;
};

export const PlaygroundContent = ({
  height,
  initialPrimarySize,
  standalone,
}: PlaygroundContentProps) => {
  const { options, status } = usePlayground();

  return (
    <div
      className={classnames(styles.playgroundContent, {
        [styles.standaloneMode]: standalone,
      })}
      style={{ height }}
    >
      {options.previewMode && status === "loaded" ? (
        <Preview />
      ) : (
        <Splitter
          orientation={options.orientation}
          swapped={options.swapped}
          initialPrimarySize={initialPrimarySize}
        >
          <Editor />
          <div style={{height: "100%", overflow: "hidden"}}>
            {status === "loaded" && <Preview />}
          </div>
        </Splitter>
      )}
    </div>
  );
};
