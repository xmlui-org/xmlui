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
import styles from "./InspectorButton.module.scss";
import { useComponentRegistry } from "../components/ComponentRegistryContext";
import { ProjectCompilation } from "../abstractions/scripting/Compilation";
import { PiFileCode } from "react-icons/pi";

// --- The context object that is used to store the inspector information.
interface IInspectorContext {
  // --- The list of source files for the components.
  sources?: Record<string, string>;
  attach: (node: ComponentDef, uid: symbol, inspectId: string) => void;
  detach: (uid: symbol, inspectId: string) => void;
  refresh: (inspectId: string) => void;
  devToolsEnabled?: boolean;
  setIsOpen: (isOpen: boolean) => void;
  inspectedNode: any;
  projectCompilation: ProjectCompilation | undefined;
  setInspectMode: (inspectMode: (prev: any) => boolean) => void;
  inspectMode: boolean;
  mockApi: any;
}

// --- The context object that is used to store the inspector information.
export const InspectorContext = createContext<IInspectorContext | null>(null);

export function InspectorProvider({
  children,
  sources,
  projectCompilation,
  mockApi,
}: {
  children: React.ReactNode;
  sources?: Record<string, string>;
  projectCompilation?: ProjectCompilation;
  mockApi?: any;
}) {
  const { root } = useTheme();
  const [inspectable, setInspectable] = useState<Record<string, any>>({});
  const [inspectedNode, setInspectedNode] = useState<ComponentDef | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [devToolsSize, setDevToolsSize] = useState(0);
  const [devToolsSide, setDevToolsSide] = useState<"bottom" | "left" | "right">("bottom");
  const [inspectMode, setInspectMode] = useState(false);

  const componentRegistry = useComponentRegistry();

  const devToolsEntry = componentRegistry.lookupComponentRenderer("XMLUIDevtools.DevTools");

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
      inspectedNode,
      setIsOpen: setShowCode,
      devToolsSize,
      setDevToolsSize,
      devToolsSide,
      setDevToolsSide,
      devToolsEnabled: showCode,
      projectCompilation: projectCompilation,
      setInspectMode,
      inspectMode,
      mockApi,
    };
  }, [
    devToolsSide,
    devToolsSize,
    sources,
    inspectedNode,
    showCode,
    projectCompilation,
    inspectMode,
    mockApi,
  ]);

  return (
    <InspectorContext.Provider value={contextValue}>
      {children}
      {process.env.VITE_USER_COMPONENTS_Inspect !== "false" &&
        showCode &&
        inspectedNode !== null &&
        createPortal(devToolsEntry?.renderer({} as any), root)}
      {process.env.VITE_USER_COMPONENTS_Inspect !== "false" &&
        inspectable &&
        Object.values(inspectable).map((item: any) => {
          return (
            <InspectButton
              inspectedNode={inspectedNode}
              setShowCode={setShowCode}
              key={item.inspectId + +"-" + item.key}
              inspectId={item.inspectId}
              node={item.node}
              setInspectedNode={setInspectedNode}
              inspectMode={inspectMode}
            />
          );
        })}
    </InspectorContext.Provider>
  );
}

function InspectButton({
  inspectId,
  node,
  inspectedNode,
  setInspectedNode,
  setShowCode,
  inspectMode,
}: {
  inspectId: string;
  node: ComponentDef;
  inspectedNode: any;
  setInspectedNode: (node: any) => void;
  setShowCode: (show: any) => void;
  inspectMode: boolean;
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
          offset: [-4, -18],
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
    if (!referenceElement) {
      return;
    }
    if (inspectedNode?.inspectId === inspectId) {
      referenceElement.classList.add(styles.inspectedNode);
    } else {
      referenceElement.classList.remove(styles.inspectedNode);
    }
  }, [inspectId, inspectedNode, referenceElement]);

  useEffect(() => {
    if (inspectedNode) {
      setShowCode(true);
    } else {
      setShowCode(false);
    }
  }, [inspectedNode]);

  useEffect(() => {
    const htmlElement = document.querySelector(`[data-inspectId="${inspectId}"]`) as HTMLElement;
    if (!htmlElement) {
      return;
    }

    setReferenceElement(htmlElement);

    if (inspectMode) {
      htmlElement.classList.add(styles.inspectableNode);

      const overlay = document.createElement("div");
      overlay.classList.add(styles.inspectOverlay);
      htmlElement.appendChild(overlay);

      overlay.addEventListener("click", () => {
        setInspectedNode((prev) => {
          if (prev?.inspectId === inspectId) {
            return null;
          }
          return { ...node, inspectId };
        });
      });
    }

    if (!inspectMode) {
      htmlElement.classList.remove(styles.inspectableNode);

      setInspectedNode(null);
      setShowCode(false);
      const overlay = htmlElement.querySelector(`.${styles.inspectOverlay}`);

      if (overlay) {
        overlay.remove();
      }

      htmlElement.classList.remove(styles.inspectedNode);
    }

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
  }, [inspectId, node, inspectMode, setShowCode]);

  return (
    <>
      {inspectMode
        ? null
        : visible &&
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
                setInspectedNode(node);
                setShowCode(true);
              }}
            >
              <PiFileCode className={styles.inspectIcon} />
            </Button>,
            root,
          )}
    </>
  );
}

export function useDevTools() {
  const context = useContext(InspectorContext);

  return {
    projectCompilation: context?.projectCompilation,
    inspectedNode: context?.inspectedNode,
    sources: context?.sources,
    setIsOpen: context?.setIsOpen,
    devToolsEnabled: context?.devToolsEnabled,
    mockApi: context?.mockApi,
  };
}

export function useInspectMode() {
  const context = useContext(InspectorContext);
  return {
    setInspectMode: context?.setInspectMode,
    inspectMode: context?.inspectMode,
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
