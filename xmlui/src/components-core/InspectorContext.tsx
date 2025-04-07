import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ComponentDef } from "../abstractions/ComponentDefs";
import { usePopper } from "react-popper";
import { createPortal } from "react-dom";
import { useTheme } from "./theming/ThemeContext";
import classnames from "classnames";
import { Button } from "../components/Button/ButtonNative";
import Icon from "../components/Icon/IconNative";
import styles from "./InspectorButton.module.scss";
import { DevTools } from "./devtools/DevTools";

// --- The context object that is used to store the inspector information.
interface IInspectorContext {
  // --- The list of source files for the components.
  sources?: Record<string, string>;
  attach: (node: ComponentDef, uid: symbol, inspectId: string) => void;
  detach: (uid: symbol, inspectId: string) => void;
  refresh: (inspectId: string) => void;
  devToolsSize?: number;
  setDevToolsSize: (size: number) => void;
  devToolsSide?: "bottom" | "left" | "right";
  setDevToolsSide: (side: "bottom" | "left" | "right") => void;
  devToolsEnabled?: boolean;
}

// --- The context object that is used to store the inspector information.
export const InspectorContext = createContext<IInspectorContext | null>(null);

export function InspectorProvider({
  children,
  sources,
}: {
  children: React.ReactNode;
  sources?: Record<string, string>;
}) {
  const [inspectable, setInspectable] = useState<Record<string, any>>({});
  const [inspectedNode, setInspectedNode] = useState<ComponentDef | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [devToolsSize, setDevToolsSize] = useState(0);
  const [devToolsSide, setDevToolsSide] = useState<"bottom" | "left" | "right">("bottom");

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
      devToolsSize,
      setDevToolsSize,
      devToolsSide,
      setDevToolsSide,
      devToolsEnabled: showCode,
    };
  }, [devToolsSide, devToolsSize, showCode, sources]);

  return (
    <InspectorContext.Provider value={contextValue}>
      {children}
      {showCode && inspectedNode && (
        <DevTools setIsOpen={setShowCode} node={inspectedNode} key={inspectedNode?.uid} />
      )}
      {process.env.VITE_USER_COMPONENTS_Inspect !== "false" &&
        inspectable &&
        Object.values(inspectable).map((item: any) => {
          return (
            <InspectButton
              setShowCode={setShowCode}
              key={item.inspectId + +"-" + item.key}
              inspectId={item.inspectId}
              node={item.node}
              setInspectedNode={setInspectedNode}
            />
          );
        })}
    </InspectorContext.Provider>
  );
}

function InspectButton({
  inspectId,
  node,
  setInspectedNode,
  setShowCode,
}: {
  inspectId: string;
  node: ComponentDef;
  setInspectedNode: (node: ComponentDef | null) => void;
  setShowCode: (show: boolean) => void;
}) {
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
      {
        name: "flip",
        enabled: false,
        // options: {
        //   fallbackPlacements: ['top', 'right'],
        // },
      },
    ],
  });
  const [visible, setVisible] = useState(false);
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
      {visible &&
        !!root &&
        createPortal(
          <Button
            variant={"ghost"}
            className={classnames(styles.wrapper, "_debug-inspect-button")}
            ref={(el) => setPopperElement(el)}
            style={{ ...popperStyles.popper, padding: 0 }}
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
              setInspectedNode(node);
            }}
          >
            <Icon name={"inspect"} size={"md"} />
          </Button>,
          root,
        )}
    </>
  );
}

export function useDevTools() {
  const context = useContext(InspectorContext);
  return {
    devToolsSize: context?.devToolsSize,
    setDevToolsSize: context?.setDevToolsSize,
    devToolsSide: context?.devToolsSide,
    setDevToolsSide: context?.setDevToolsSide,
    devToolsEnabled: context?.devToolsEnabled,
  };
}

export function useInspector(node: ComponentDef, uid: symbol) {
  const context = useContext(InspectorContext);
  const inspectValue = (node.props as any)?.inspect;
  const shouldInspect = inspectValue === true || inspectValue === "true";
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
