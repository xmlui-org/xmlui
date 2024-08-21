import {createContext, useContext, useEffect, useId, useMemo, useRef, useState} from "react";
import type {ComponentDef} from "@abstractions/ComponentDefs";
import {usePopper} from "react-popper";
import {createPortal} from "react-dom";
import styles from "@components/Select/Select.module.scss";
import {useTheme} from "@components-core/theming/ThemeContext";
import {ModalDialog} from "@components/ModalDialog/ModalDialog";
import { Text } from "@components/Text/Text";

interface IInspectorContext {
    attach: (node: ComponentDef, uid: symbol, inspectId: string) => void;
    detach: (uid: symbol, inspectId: string) => void;
}

export const InspectorContext = createContext<IInspectorContext | null>(null);

export function InspectorProvider({children}: { children: React.ReactNode }) {

    const [inspectable, setInspectable] = useState<Record<string, any>>({});

    const contextValue: IInspectorContext = useMemo(() => {
        return {
            attach: (node, uid, inspectId) => {
                setInspectable((prev) => {
                    return {
                        ...prev,
                        [inspectId]: {
                            node,
                            uid,
                            inspectId
                        }
                    }
                })
            },
            detach: (uid, inspectId) => {
                setInspectable((prev) => {
                    const ret = {...prev};
                    delete ret[inspectId];
                    return ret
                })
            }
        }
    }, []);

    return <InspectorContext.Provider value={contextValue}>
        {children}
        {inspectable && Object.values(inspectable).map((item: any) => {
            return <InspectButton key={item.inspectId} inspectId={item.inspectId} node={item.node}/>;
        })}
    </InspectorContext.Provider>
}

function InspectButton({inspectId, node}: { inspectId: string, node: ComponentDef }) {
    const {root} = useTheme();
    const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
    const [popperElement, setPopperElement] = useState<HTMLButtonElement | null>(null);
    const {styles: popperStyles, attributes} = usePopper(referenceElement, popperElement, {
        placement: "top-end",
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [-10, -20],
                },
            },
        ]
    });
    const [visible, setVisible] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const timeoutRef = useRef<number | null>(null);
    const hoverRef = useRef<boolean>(false);

    useEffect(() => {
        const htmlElement = document.querySelector(`[data-inspectId="${inspectId}"]`) as HTMLElement;
        if(!htmlElement){
            return;
        }
        setReferenceElement(htmlElement);

        function mouseenter() {
            clearTimeout(timeoutRef.current);
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
            }, 300);
        }

        htmlElement.addEventListener("mouseenter", mouseenter);
        htmlElement.addEventListener("mouseleave", mouseleave);
        return () => {
            htmlElement.removeEventListener("mouseenter", mouseenter);
            htmlElement.removeEventListener("mouseleave", mouseleave);
        }
    }, [inspectId]);

    return <>
        {
            visible && createPortal(
                <button
                    className={styles.selectMenu}
                    ref={(el) => setPopperElement(el)}
                    style={{...popperStyles.popper}}
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
                        setShowCode(true)
                    }}
                >
                    Show code
                </button>,
                root
            )
        }
        {showCode && <ModalDialog isInitiallyOpen={true} onClose={() => setShowCode(false)} style={{width: 'auto', maxWidth: '100%', minWidth: 400}}>
            <Text variant={'code'} preserveLinebreaks={true}>{JSON.stringify(node, null, 2)}</Text>
        </ModalDialog>}
        </>
}

export function useInspector(node: ComponentDef, uid: symbol) {
    const context = useContext(InspectorContext);
    const shouldInspect = node.props.inspect;
    const inspectId = useId();

    useEffect(() => {
        if (shouldInspect) {
            context?.attach(node, uid, inspectId);
        }
        return () => {
            context?.detach(uid, inspectId);
        }
    }, [context, inspectId, node, shouldInspect, uid]);

    if (node.props.inspect && context) {
        return inspectId;
    }
    return undefined;
}