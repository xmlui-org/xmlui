import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useState } from "react";
import { Icon, useTheme, useDevTools, Button } from "xmlui";
import styles from "./DevToolsNative.module.scss";
import { HiOutlineClipboardDocument, HiOutlineClipboardDocumentCheck } from "react-icons/hi2";
import loader from "@monaco-editor/loader";
import { XmluiGrammar } from "../syntax/monaco/grammar.monacoLanguage";
import { XmluiScripGrammar } from "../syntax/monaco/xmluiscript.monacoLanguage";
import xmluiLight from "../syntax/monaco/xmlui-light";
import xmluiDark from "../syntax/monaco/xmlui-dark";
import { createQueryString } from "./utils";
import { Tooltip } from "./Tooltip";
import { ModalDialog } from "./ModalDialog";

export const DevTools = () => {
  const { activeThemeTone } = useTheme();
  const context = useDevTools();
  const { mockApi, inspectedNode, sources, setIsOpen, projectCompilation } = context;
  const [copied, setCopied] = useState(false);
  const monacoEditorInstance = useRef<any>(null);
  const editorRef = useRef(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const monacoSetupDone = useRef(false);

  const copyToClipboard = () => {
    setCopied(true);

    if (monacoEditorInstance?.current) {
      const code = monacoEditorInstance?.current?.getValue();
      navigator.clipboard.writeText(code);
    }
  };

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

  const popupPlayground = useCallback(async () => {
    if (!inspectedNode) {
      return;
    }

    const appCode = {
      app: value,
      api: mockApi,
      availableThemes: [],
      components:
        (projectCompilation?.components || []).map((c: any) => ({
          name: c.definition.name,
          component: c.markupSource,
        })) || [],
      config: {
        appGlobals: {},
        defaultTheme: "",
        defaultTone: "",
        logo: "",
        name: "XMLUI App",
        description: "",
        resources: {},
        themes: [],
      },
    };

    const data = {
      standalone: appCode,
      options: {
        fixedTheme: false,
        swapped: false,
        previewMode: false,
        orientation: "vertical",
        activeTheme: "xmlui",
        content: "app",
      },
    };

    const appQueryString = await createQueryString(JSON.stringify(data));
    window.open(`/#/playground#${appQueryString}`, "_blank");
  }, [value, projectCompilation, inspectedNode]);

  useEffect(() => {
    if (monacoEditorInstance.current) {
      monacoEditorInstance.current.layout();
    } else if (editorRef.current) {
      loader.init().then((monaco) => {
        if (!editorRef.current || monacoEditorInstance.current) return;
        if (!monacoSetupDone.current) {
          monaco.languages.register({ id: XmluiGrammar.id });
          monaco.languages.setMonarchTokensProvider(XmluiGrammar.id, XmluiGrammar.language);
          monaco.languages.setLanguageConfiguration(XmluiGrammar.id, XmluiGrammar.config);

          monaco.languages.register({ id: XmluiScripGrammar.id });
          monaco.languages.setMonarchTokensProvider(
            XmluiScripGrammar.id,
            XmluiScripGrammar.language,
          );
          monaco.languages.setLanguageConfiguration(XmluiScripGrammar.id, XmluiScripGrammar.config);

          monaco.editor.defineTheme("xmlui-light", xmluiLight);
          monaco.editor.defineTheme("xmlui-dark", xmluiDark);

          monacoSetupDone.current = true;
        }

        monaco.editor.setTheme(activeThemeTone === "dark" ? "xmlui-dark" : "xmlui-light");

        monacoEditorInstance.current = monaco.editor.create(editorRef.current, {
          value,
          language: "xmlui",
          readOnly: true,
          scrollBeyondLastLine: false,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          minimap: { enabled: false },
          padding: {
            top: 10,
            bottom: 10,
          },
        });
      });
    }

    return () => {
      if (monacoEditorInstance.current) {
        monacoEditorInstance.current.dispose();
        monacoEditorInstance.current = null;
      }
    };
  }, [activeThemeTone, value]);

  window.addEventListener("resize", () => {
    monacoEditorInstance?.current.layout();
  });

  return (
    <ModalDialog
      onClose={() => setIsOpen?.(false)}
      title={
        <div className={styles.header}>
          <Button variant={"ghost"} size={"sm"}>
            Code
          </Button>
          <div className={styles.actions}>
            <Tooltip label={"Edit code in new window"}>
              <Button
                onClick={popupPlayground}
                size={"xs"}
                variant={"ghost"}
                icon={<Icon name={"new-window"} />}
              />
            </Tooltip>
            <Tooltip label={"Close DevTools"}>
              <Button
                onClick={() => setIsOpen?.(false)}
                size={"xs"}
                variant={"ghost"}
                icon={<Icon name={"close"} />}
              />
            </Tooltip>
          </div>
        </div>
      }
    >
      <div className={styles.editorContainer} ref={editorContainerRef}>
        <div ref={editorRef} className={styles.xmluiEditor} />
        <div className={styles.copyButton}>
          <button onClick={copyToClipboard} style={{ padding: 8 }}>
            {copied ? (
              <HiOutlineClipboardDocumentCheck size={16} />
            ) : (
              <HiOutlineClipboardDocument size={16} />
            )}
          </button>
        </div>
      </div>
    </ModalDialog>
  );
};
