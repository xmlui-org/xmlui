import { Header } from "@/src/components/Header";
import { Preview } from "@/src/components/Preview";
import { Editor } from "@/src/components/Editor";
import { Splitter } from "@components/Splitter/Splitter";
import styles from "@/src/components/PlaygroundContent.module.scss";
import { usePlayground } from "@/src/hooks/usePlayground";
import classnames from "classnames";

type PlaygroundContentProps = {
  height?: number | string;
  initialPrimarySize?: string;
  standalone?: boolean;
  loading?: boolean;
};

export const PlaygroundContent = ({ height, initialPrimarySize, standalone, loading }: PlaygroundContentProps) => {
  const { options, status } = usePlayground();

  return (
    <div
      className={classnames(styles.playground, {
        [styles.standalone]: standalone,
      })}
    >
      {standalone && options.previewMode ? null : <Header />}
      <div className={styles.playgroundContent} style={{ height }}>
        {options.previewMode && status === "loaded" ? (
          <Preview />
        ) : (
          <Splitter
            orientation={options.orientation}
            swapped={options.swapped}
            initialPrimarySize={initialPrimarySize}
          >
            <Editor />
            {status === "loaded" && <Preview />}
          </Splitter>
        )}
      </div>
    </div>
  );
};
