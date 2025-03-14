import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import React, { useContext, useEffect, useMemo } from "react";
import { useState } from "react";
import { Rnd } from "react-rnd";
import { XmluiCodeHighlighter } from "./XmluiCodeHighlighter";
import { useTheme } from "./theming/ThemeContext";
import { createPortal } from "react-dom";
import { InspectorContext } from "./InspectorContext";
import { Button } from "../components/Button/ButtonNative";
import styles from "./DevTools.module.scss";
import { Content, List, Root, Trigger } from "@radix-ui/react-tabs";
import { BiDockBottom, BiDockLeft, BiDockRight } from "react-icons/bi";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HiOutlineDotsVertical } from "react-icons/all";

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  node: any;
};

export const DevTools = ({ isOpen = false, setIsOpen, node }: Props) => {
  const [isDocked, setIsDocked] = useState(true);
  const [side, setSide] = useState<"bottom" | "left" | "right">("bottom");
  const { root } = useTheme();

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

  const getInitialSize = () => {
    switch (side) {
      case "bottom":
        return { width: window.innerWidth, height: 300 };
      case "left":
      case "right":
        return { width: 400, height: window.innerHeight };
      default:
        return { width: 300, height: 300 };
    }
  };

  const getInitialPosition = () => {
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
  };

  const [size, setSize] = useState(getInitialSize);
  const [position, setPosition] = useState(getInitialPosition);

  useEffect(() => {
    setSize(getInitialSize());
    setPosition(getInitialPosition());
  }, [side]);

  useEffect(() => {
    const handleResize = () => {
      setSize(getInitialSize());
      setPosition(getInitialPosition());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [side]);

  return (
    <>
      {isOpen &&
        createPortal(
          <Rnd
            className={styles.wrapper}
            size={size}
            position={position}
            disableDragging={isDocked}
            enableResizing={{
              top: side === "bottom",
              right: side === "left",
              left: side === "right",
            }}
            minWidth={300}
            minHeight={200}
            maxWidth={window.innerWidth}
            maxHeight={window.innerHeight}
            onResizeStop={(e, direction, ref, delta, position) => {
              setSize({
                width: side === "bottom" ? window.innerWidth : ref.clientWidth,
                height: side === "left" || side === "right" ? window.innerHeight : ref.clientHeight,
              });
              setPosition(position);
            }}
            bounds={"window"}
          >
            <Root
              defaultValue={"code"}
              className={styles.tabs}
              style={{ width: size.width, height: size.height }}
            >
              <List className={styles.list}>
                <div>
                  <Trigger value={"code"}>
                    <Button variant={"ghost"} size={"xs"}>
                      Code
                    </Button>
                  </Trigger>
                  <Trigger value={"query"}>
                    <Button variant={"ghost"} size={"xs"}>
                      Query
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
                              onClick={() => setSide("left")}
                              variant={"ghost"}
                            >
                              <BiDockLeft color={"currentColor"} />
                            </Button>
                            <Button
                              style={{ padding: 8 }}
                              onClick={() => setSide("bottom")}
                              variant={"ghost"}
                            >
                              <BiDockBottom color={"currentColor"} />
                            </Button>
                            <Button
                              style={{ padding: 8 }}
                              onClick={() => setSide("right")}
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
              <div className={styles.content}>
                <Content value={"code"}>
                  <XmluiCodeHighlighter value={value} />
                </Content>
                <Content value={"query"}>
                  <ReactQueryDevtoolsPanel
                    style={{ height: "100%", width: "100%", maxWidth: "100vw" }}
                    setIsOpen={setIsOpen}
                    onDragStart={(e) => e.stopPropagation()}
                  />
                </Content>
              </div>
            </Root>
          </Rnd>,
          root,
        )}
    </>
  );
};
