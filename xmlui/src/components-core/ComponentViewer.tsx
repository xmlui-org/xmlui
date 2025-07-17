import { InspectorDialog } from "./devtools/InspectorDialog";
import AppWithCodeViewNative from "../components/NestedApp/AppWithCodeViewNative";
import React, { useMemo } from "react";
import { useDevTools } from "./InspectorContext";
import { Tooltip } from "../components/NestedApp/Tooltip";
import styles from "../components/NestedApp/NestedApp.module.scss";
import { AiOutlineClose } from "react-icons/ai";

export const ComponentViewer = () => {
  const { mockApi, setIsOpen, isOpen, inspectedNode, clickPosition, projectCompilation, sources } =
    useDevTools();

  const components = useMemo<string[]>(() => {
    if (!projectCompilation) {
      return [];
    }
    return projectCompilation.components.map((component) => {
      return component.markupSource;
    });
  }, [projectCompilation]);

  const value = useMemo(() => {
    const compSrc = inspectedNode?.debug?.source;

    if (!compSrc) {
      return "";
    }
    if (!sources) {
      return "";
    }
    const { start, end, fileId } = compSrc;
    const slicedSrc = sources[fileId].slice(start, end);

    let dropEmptyLines = true;
    const prunedLines: Array<string> = [];
    let trimBeginCount: number | undefined = undefined;
    slicedSrc.split("\n").forEach((line) => {
      if (line.trim() === "" && dropEmptyLines) {
        //drop empty lines from the beginning
        return;
      } else {
        dropEmptyLines = false;
        prunedLines.push(line);
        const startingWhiteSpaces = line.search(/\S|$/);
        if (
          line.trim() !== "" &&
          (trimBeginCount === undefined || startingWhiteSpaces < trimBeginCount)
        ) {
          trimBeginCount = startingWhiteSpaces;
        }
      }
    });
    return prunedLines
      .map((line) => line.slice(trimBeginCount).replace(/inspect="true"/g, ""))
      .join("\n");
  }, [inspectedNode, sources]);

  return process.env.VITE_USER_COMPONENTS_Inspect !== "false" &&
    isOpen &&
    inspectedNode !== null ? (
    <InspectorDialog isOpen={isOpen} setIsOpen={setIsOpen} clickPosition={clickPosition}>
      <AppWithCodeViewNative
        height={"500px"}
        allowPlaygroundPopup
        splitView={true}
        controlsWidth={"120px"}
        closeButton={
          <Tooltip
            trigger={
              <button
                className={styles.headerButton}
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                <AiOutlineClose />
              </button>
            }
            label="Close"
          />
        }
        markdown={`\`\`\`xmlui
${value}
\`\`\``}
        api={mockApi}
        app={value}
        components={components}
      />
    </InspectorDialog>
  ) : null;
};
