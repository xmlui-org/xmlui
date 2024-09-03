import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type HeadingItem = {
    id: string;
    level: number;
    text: string;
    anchor: HTMLAnchorElement | null;
};

interface ITableOfContentsContext {
    headings: Record<string, HeadingItem>;
    registerHeading: (headingItem: HeadingItem) => void;
    observeIntersection: boolean;
    setObserveIntersection: (observe: boolean) => void;
    activeAnchorId: string | null;
    setActiveAnchorId: (id: string) => void;
}

export const TableOfContentsContext = createContext<ITableOfContentsContext | null>(null);

export function TableOfContentsProvider({ children }: { children: React.ReactNode }) {
    const [headings, setHeadings] = useState<Record<string, HeadingItem>>({});
    const [observeIntersection, setObserveIntersection] = useState<boolean>(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const handleObserver = (entries: any) => {
            entries.forEach((entry: any) => {
                if (entry?.isIntersecting) {
                    setActiveId(entry.target.id);
                }
            });
        };
        observer.current = new IntersectionObserver(handleObserver, {
            rootMargin: "0px 0px -50%",
            threshold: [0, 1],
        });

        Object.values(headings).forEach((elem) => observer.current.observe(elem.anchor!));
        return () => observer.current?.disconnect();
    }, [headings]);

    const contextValue: ITableOfContentsContext = useMemo(() => {
        return {
            registerHeading: (headingItem: HeadingItem) => {
                setHeadings((prevHeadings) => {
                    return {
                        ...prevHeadings,
                        [headingItem.id]: headingItem,
                    };
                });
            },
            headings,
            observeIntersection,
            setObserveIntersection,
            activeAnchorId: activeId,
            setActiveAnchorId: (id: string) => {
                if (headings[id]) {
                    setActiveId(id);
                }
            },
        };
    }, [activeId, headings, observeIntersection]);

    return <TableOfContentsContext.Provider value={contextValue}>{children}</TableOfContentsContext.Provider>;
}

export function useTableOfContents() {
    const context = useContext(TableOfContentsContext);

    if (!context) {
        throw new Error("useTableOfContents must be used within a TableOfContentsProvider");
    }

    return context;
}
