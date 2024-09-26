import { Preview } from "@/src/components/Preview";
import { Editor } from "@/src/components/Editor";
import { Splitter } from "@components/Splitter/SplitterNative";
import styles from "@/src/components/PlaygroundContent.module.scss";
import { usePlayground } from "@/src/hooks/usePlayground";
import classnames from "classnames";
import React, {useMemo} from "react";
import { useTheme } from "nextra-theme-docs";

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
  const { theme, systemTheme } = useTheme();

  const isDark = useMemo(() => {
    return theme === "dark" || (theme === "system" && systemTheme === "dark")
  }, [theme, systemTheme]);

  return (
    <div
      className={classnames(styles.playground, {
        [styles.standalone]: standalone,
      })}
    >
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
