import React, { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useState } from "react";
import { Rnd } from "react-rnd";
import { XmluiCodeHighlighter } from "./XmluiCodeHighlighter";
import { useTheme } from "./theming/ThemeContext";
import { createPortal } from "react-dom";
import { InspectorContext, useDevTools } from "./InspectorContext";
import { Button } from "../components/Button/ButtonNative";
import styles from "./DevTools.module.scss";
import { Content, List, Root, Trigger } from "@radix-ui/react-tabs";
import { BiDockBottom, BiDockLeft, BiDockRight } from "react-icons/bi";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HiOutlineDotsVertical } from "react-icons/all";
import { HiOutlineClipboardDocument, HiOutlineClipboardDocumentCheck } from "react-icons/hi2";
import Icon from "../components/Icon/IconNative";
import loader from "@monaco-editor/loader";
import { XmluiGrammar } from "./syntax/monaco/grammar.monacoLanguage";
import { XmluiScripGrammar } from "./syntax/monaco/xmluiscript.monacoLanguage";
import xmluiLight from "./syntax/monaco/xmlui-light";
import xmluiDark from "./syntax/monaco/xmlui-dark";

type Props = {
  setIsOpen: (isOpen: boolean) => void;
  node: any;
};

export const DevTools = ({ setIsOpen, node }: Props) => {
  const [side, setSide] = useState<"bottom" | "left" | "right">("bottom");
  const { root, activeThemeTone } = useTheme();
  const { setDevToolsSize, setDevToolsSide } = useDevTools();
  const [copied, setCopied] = useState(false);
  const monacoEditorInstance = useRef(null);
  const editorRef = useRef(null);

  const copyToClipboard = () => {
    setCopied(true);
    if (monacoEditorInstance?.current) {
      const code = monacoEditorInstance?.current?.getValue();
      navigator.clipboard.writeText(code);
    }
  };

  const { sources } = useContext(InspectorContext)!;
  const value = useMemo(() => {
    const compSrc = node.debug?.source;
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
    return prunedLines.map((line) => line.slice(trimBeginCount)).join("\n");
  }, [node.debug?.source, sources]);

  const getInitialSize = useCallback(() => {
    switch (side) {
      case "bottom":
        return { width: window.innerWidth, height: 300 };
      case "left":
      case "right":
        return { width: 400, height: window.innerHeight };
      default:
        return { width: 300, height: 300 };
    }
  }, [side]);

  const getInitialPosition = useCallback(() => {
    switch (side) {
      case "bottom":
        return { x: 0, y: window.innerHeight - 300 };
      case "left":
        return { x: 0, y: 0 };
      case "right":
        return { x: window.innerWidth - 400, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  }, [side]);

  const [size, setSize] = useState(getInitialSize());
  const [position, setPosition] = useState(getInitialPosition());

  useEffect(() => {
    const handleResize = () => {
      setSize(getInitialSize());
      setPosition(getInitialPosition());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getInitialPosition, getInitialSize, side]);

  useEffect(() => {
    setPosition(getInitialPosition());
    setSize(getInitialSize());
  }, [getInitialPosition, getInitialSize]);

  useEffect(() => {
    setDevToolsSide(side);
    if (side === "bottom") {
      setDevToolsSize(size.height);
    } else {
      setDevToolsSize(size.width);
    }
  }, [setDevToolsSide, setDevToolsSize, side, size]);

  useEffect(() => {
    loader.init().then((monaco) => {
      if (!editorRef.current || monacoEditorInstance.current) return;

      monaco.languages.register({ id: XmluiGrammar.id });
      monaco.languages.setMonarchTokensProvider(XmluiGrammar.id, XmluiGrammar.language);
      monaco.languages.setLanguageConfiguration(XmluiGrammar.id, XmluiGrammar.config);

      monaco.languages.register({ id: XmluiScripGrammar.id });
      monaco.languages.setMonarchTokensProvider(XmluiScripGrammar.id, XmluiScripGrammar.language);
      monaco.languages.setLanguageConfiguration(XmluiScripGrammar.id, XmluiScripGrammar.config);

      monaco.editor.defineTheme("xmlui-light", xmluiLight);
      monaco.editor.defineTheme("xmlui-dark", xmluiDark);

      monaco.editor.setTheme(activeThemeTone === "dark" ? "xmlui-dark" : "xmlui-light");

      monacoEditorInstance.current = monaco.editor.create(editorRef.current, {
        value,
        language: "xmlui",
        readOnly: true,
      });
    });

    return () => {
      if (monacoEditorInstance.current) {
        monacoEditorInstance.current.dispose();
        monacoEditorInstance.current = null;
      }
    };
  }, []);

  return createPortal(
    <Rnd
      className={styles.wrapper}
      size={size}
      position={position}
      disableDragging={true}
      enableResizing={{
        top: side === "bottom",
        right: side === "left",
        left: side === "right",
      }}
      minWidth={300}
      minHeight={200}
      maxWidth={window.innerWidth}
      maxHeight={window.innerHeight}
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setSize({
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
        setPosition(position);
      }}
      bounds={"window"}
    >
      <Root defaultValue={"code"} className={styles.tabs} style={{ width: "100%", height: "100%" }} >
        <List className={styles.list}>
          <div className={styles.tabItems}>
            <Trigger value={"code"}>
              <Button variant={"ghost"} size={"sm"}>
                Code
              </Button>
            </Trigger>
            <Trigger value={"console"}>
              <Button variant={"ghost"} size={"sm"}>
                Console
              </Button>
            </Trigger>
          </div>
          <div className={styles.actions}>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant={"ghost"} size={"xs"}>
                  <HiOutlineDotsVertical color={"currentColor"} />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal container={root}>
                <DropdownMenu.Content className={styles.menu}>
                  <DropdownMenu.Item className={styles.menuItem}>
                    Dock side
                    <div className={styles.sideButtons}>
                      <Button
                        style={{ padding: 8 }}
                        onClick={() => {
                          setSide("left");
                        }}
                        variant={"ghost"}
                      >
                        <BiDockLeft color={"currentColor"} size={16} />
                      </Button>
                      <Button
                        style={{ padding: 8 }}
                        onClick={() => {
                          setSide("bottom");
                        }}
                        variant={"ghost"}
                      >
                        <BiDockBottom color={"currentColor"} size={16} />
                      </Button>
                      <Button
                        style={{ padding: 8 }}
                        onClick={() => {
                          setSide("right");
                        }}
                        variant={"ghost"}
                      >
                        <BiDockRight color={"currentColor"} size={16} />
                      </Button>
                    </div>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            <Button
              onClick={() => setIsOpen(false)}
              size={"xs"}
              variant={"ghost"}
              icon={<Icon name={"close"} />}
            />
          </div>
        </List>
        <Content value={"code"} className={styles.content}>
          <div ref={editorRef} className={styles.xmluiEditor} />
          <div className={styles.copyButton}>
            <Button
              onClick={copyToClipboard}
              variant={"solid"}
              themeColor={"secondary"}
              style={{ padding: 8 }}
              size={"sm"}
            >
              {copied ? (
                <HiOutlineClipboardDocumentCheck size={16} />
              ) : (
                <HiOutlineClipboardDocument size={16} />
              )}
            </Button>
          </div>
        </Content>
        <Content value={"console"} className={styles.content}>
          Debug console
        </Content>
      </Root>
    </Rnd>,
    root,
  );
};
