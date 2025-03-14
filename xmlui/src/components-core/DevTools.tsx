import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { useState } from "react";
import { Rnd } from "react-rnd";
import { XmluiCodeHighlighter } from "./XmluiCodeHighlighter";
import { useTheme } from "./theming/ThemeContext";
import { createPortal } from "react-dom";
import { InspectorContext, useDevTools } from "./InspectorContext";
import { Button } from "../components/Button/ButtonNative";
import styles from "./DevTools.module.scss";
import { Content, List, Root, Trigger } from "@radix-ui/react-tabs";
import { BiDockBottom, BiDockLeft, BiDockRight, BiWindows } from "react-icons/bi";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HiOutlineDotsVertical } from "react-icons/all";

type Props = {
  setIsOpen: (isOpen: boolean) => void;
  setIsDocked: (isDocked: boolean) => void;
  isDocked: boolean;
  node: any;
};

export const DevTools = ({ setIsOpen, setIsDocked, isDocked, node }: Props) => {
  const [side, setSide] = useState<"bottom" | "left" | "right">("bottom");
  const { root } = useTheme();
  const { setDevToolsSize, setDevToolsSide } = useDevTools();

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

  return createPortal(
    <Rnd
      className={styles.wrapper}
      size={size}
      position={position}
      disableDragging={isDocked}
      enableResizing={{
        top: side === "bottom" || !isDocked,
        right: side === "left" || !isDocked,
        left: side === "right" || !isDocked,
        bottom: !isDocked,
        topRight: !isDocked,
        bottomRight: !isDocked,
        bottomLeft: !isDocked,
        topLeft: !isDocked,
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
      <Root defaultValue={"code"} className={styles.tabs} style={{ width: "100%", height: "100%" }}>
        <List className={styles.list}>
          <div>
            <Trigger value={"code"}>
              <Button variant={"ghost"} size={"xs"}>
                Code
              </Button>
            </Trigger>
            <Trigger value={"console"}>
              <Button variant={"ghost"} size={"xs"}>
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
                        onClick={() => setIsDocked(false)}
                        variant={"ghost"}
                      >
                        <BiWindows color={"currentColor"} />
                      </Button>
                      <Button
                        style={{ padding: 8 }}
                        onClick={() => {
                          setSide("left");
                          setIsDocked(true);
                        }}
                        variant={"ghost"}
                      >
                        <BiDockLeft color={"currentColor"} />
                      </Button>
                      <Button
                        style={{ padding: 8 }}
                        onClick={() => {
                          setSide("bottom");
                          setIsDocked(true);
                        }}
                        variant={"ghost"}
                      >
                        <BiDockBottom color={"currentColor"} />
                      </Button>
                      <Button
                        style={{ padding: 8 }}
                        onClick={() => {
                          setSide("right");
                          setIsDocked(true);
                        }}
                        variant={"ghost"}
                      >
                        <BiDockRight color={"currentColor"} />
                      </Button>
                    </div>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            <Button onClick={() => setIsOpen(false)} size={"xs"} variant={"ghost"}>
              Close
            </Button>
          </div>
        </List>
        <Content value={"code"} className={styles.content}>
          <XmluiCodeHighlighter value={value} />
        </Content>
        <Content value={"console"} className={styles.content}>
          Debug console
          {/*<ReactQueryDevtoolsPanel
                    style={{ height: "100%", width: "100%", maxWidth: "100vw" }}
                    setIsOpen={setIsOpen}
                    onDragStart={(e) => e.stopPropagation()}
                  />*/}
        </Content>
      </Root>
    </Rnd>,
    root,
  );
};
