import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ComponentDef } from "../abstractions/ComponentDefs";
import { usePopper } from "react-popper";
import { createPortal } from "react-dom";
import { useTheme } from "./theming/ThemeContext";
import { ModalDialog } from "../components/ModalDialog/ModalDialogNative";
import classnames from "classnames";
import { XmluiCodeHighlighter } from "./XmluiCodeHighlighter";
import { Button } from "../components/Button/ButtonNative";
import Icon from "../components/Icon/IconNative";
import styles from "./InspectorButton.module.scss";

// --- The context object that is used to store the inspector information.
interface IInspectorContext {
  // --- The list of source files for the components.
  sources?: Record<string, string>;
  attach: (node: ComponentDef, uid: symbol, inspectId: string) => void;
  detach: (uid: symbol, inspectId: string) => void;
  refresh: (inspectId: string) => void;
}

// --- The context object that is used to store the inspector information.
const InspectorContext = createContext<IInspectorContext | null>(null);

export function InspectorProvider({
  children,
  sources,
}: {
  children: React.ReactNode;
  sources?: Record<string, string>;
}) {
  const [inspectable, setInspectable] = useState<Record<string, any>>({});

  const contextValue: IInspectorContext = useMemo(() => {
    return {
      sources,
      attach: (node, uid, inspectId) => {
        setInspectable((prev) => {
          return {
            ...prev,
            [inspectId]: {
              node,
              uid,
              inspectId,
              key: 0,
            },
          };
        });
      },
      refresh: (inspectId) => {
        setInspectable((prev) => {
          return {
            ...prev,
            [inspectId]: {
              ...prev[inspectId],
              key: prev[inspectId].key + 1,
            },
          };
        });
      },
      detach: (uid, inspectId) => {
        setInspectable((prev) => {
          const ret = { ...prev };
          delete ret[inspectId];
          return ret;
        });
      },
    };
  }, [sources]);

  return (
    <InspectorContext.Provider value={contextValue}>
      {children}
      {process.env.VITE_USER_COMPONENTS_Inspect !== 'false' && inspectable &&
        Object.values(inspectable).map((item: any) => {
          return <InspectButton key={item.inspectId + +"-" + item.key} inspectId={item.inspectId} node={item.node} />;
        })}
    </InspectorContext.Provider>
  );
}

function InspectModal(props: { onClose: () => void; node: ComponentDef }) {
  const { sources } = useContext(InspectorContext)!;
  const value = useMemo(() => {
    const compSrc = props.node.debug?.source;
    if (!compSrc) {
      return "";
    }
    if(!sources){
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
        if (line.trim() !== "" && (trimBeginCount === undefined || startingWhiteSpaces < trimBeginCount)) {
          trimBeginCount = startingWhiteSpaces;
        }
      }
    });
    return prunedLines.map((line) => line.slice(trimBeginCount)).join("\n");
  }, [props.node.debug?.source, sources]);
  return (
    <ModalDialog
      isInitiallyOpen={true}
      onClose={props.onClose}
      style={{ width: "auto", maxWidth: "100%", minWidth: 400 }}
    >
      <XmluiCodeHighlighter value={value} />
    </ModalDialog>
  );
}

function InspectButton({ inspectId, node }: { inspectId: string; node: ComponentDef }) {
  const { root } = useTheme();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLButtonElement | null>(null);
  const { styles: popperStyles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "top-end",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, -18],
        },
      },
    ],
  });
  const [visible, setVisible] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const hoverRef = useRef<boolean>(false);

  useEffect(() => {
    const htmlElement = document.querySelector(`[data-inspectId="${inspectId}"]`) as HTMLElement;
    if (!htmlElement) {
      return;
    }
    setReferenceElement(htmlElement);

    function mouseenter() {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setVisible(true);
    }

    function mouseleave() {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (hoverRef.current) {
        return;
      }
      timeoutRef.current = window.setTimeout(() => {
        setVisible(false);
      }, 100);
    }

    htmlElement.addEventListener("mouseenter", mouseenter);
    htmlElement.addEventListener("mouseleave", mouseleave);
    return () => {
      htmlElement.removeEventListener("mouseenter", mouseenter);
      htmlElement.removeEventListener("mouseleave", mouseleave);
    };
  }, [inspectId]);

  return (
    <>
      {visible && !!root &&
        createPortal(
          <Button
            icon={<Icon name={"code"} />}
            variant={"ghost"}
            size={"xs"}
            className={classnames(styles.wrapper, "_debug-inspect-button")}
            ref={(el) => setPopperElement(el)}
            style={{ ...popperStyles.popper }}
            {...attributes.popper}
            onMouseEnter={() => {
              hoverRef.current = true;
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            }}
            onMouseLeave={() => {
              hoverRef.current = false;
              setVisible(false);
            }}
            onClick={() => {
              setShowCode(true);
            }}
          />,
          root,
        )}
      {showCode && <InspectModal onClose={() => setShowCode(false)} node={node} />}
    </>
  );
}

export function useInspector(node: ComponentDef, uid: symbol) {
  const context = useContext(InspectorContext);
  const shouldInspect = (node.props as any)?.inspect;
  const inspectId = useId();
  const refreshInspection = useCallback(() => {
    context?.refresh(inspectId);
  }, [context, inspectId]);

  useEffect(() => {
    if (shouldInspect) {
      context?.attach(node, uid, inspectId);
    }
    return () => {
      context?.detach(uid, inspectId);
    };
  }, [context, inspectId, node, shouldInspect, uid]);

  if (shouldInspect && context) {
    return {
      refreshInspection,
      inspectId,
    };
  }
  return {};
}
