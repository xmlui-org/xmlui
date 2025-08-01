import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIsomorphicLayoutEffect, useScrollEventHandler, useScrollParent } from "./utils/hooks";
import { useNavigate } from "@remix-run/react";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "./constants";
import { useAppContext } from "./AppContext";


// --- Stores the information about a particular heading to be displayed in the TOC.
type HeadingItem = {
  // --- The id of the heading.
  id: string;

  // --- Heading level
  level: number;

  // --- Heading thext to display in the TOC.
  text: string;

  // --- Reference to the anchor element.
  anchor: HTMLAnchorElement | null;
};

type ActiveAnchorChangedCallback = (id: string) => void;

// --- The context object that is used to store the hierarchy of headings.
interface ITableOfContentsContext {
  // --- The list of headings in the TOC
  headings: HeadingItem[];

  // --- This method allows adding a new heading to the TOC.
  registerHeading: (headingItem: HeadingItem) => void;

  // --- This flag indicates whether the intersection observer is enabled.
  hasTableOfContents: boolean;

  // --- This method allows setting the id of the active anchor.
  scrollToAnchor: (id: string, smoothScrolling: boolean) => void;

  subscribeToActiveAnchorChange: (callback: ActiveAnchorChangedCallback) => () => void;
  activeAnchorId: string;
}

/**
 * Several components work together to represent the hierarchy of a particular
 * app page as a TOC. This React component provides a context for storing this
 * hierarchy information.
 */
export const TableOfContentsContext = createContext<ITableOfContentsContext | null>(null);

/**
 * This provider component injects the specified children into the TOC context.
 */
export function TableOfContentsProvider({ children }: { children: React.ReactNode }) {
  const [headings, setHeadings] = useState<Record<string, HeadingItem>>(EMPTY_OBJECT);
  const [callbacks, setCallbacks] = useState<Array<ActiveAnchorChangedCallback>>(EMPTY_ARRAY);
  const observer = useRef<IntersectionObserver | null>(null);
  const {forceRefreshAnchorScroll} = useAppContext();
  const thisRef = useRef({
    suspendPositionBasedSetActiveId: false,
  });
  const scrollParent = useScrollParent(Object.values(headings)?.[0]?.anchor);
  useScrollEventHandler(scrollParent, {
    onScrollEnd: useCallback(() => {
      thisRef.current.suspendPositionBasedSetActiveId = false;
    }, []),
  });
  const [activeAnchorId, setActiveAnchorId] = useState(null);

  const notify = useCallback(
    (id) => {
      callbacks.forEach((cb) => cb(id));
      setActiveAnchorId(id);
    },
    [callbacks],
  );

  useEffect(() => {
    if (callbacks.length) {
      const handleObserver = (entries: any) => {
        entries.forEach((entry: any) => {
          if (entry?.isIntersecting) {
            if (!thisRef.current.suspendPositionBasedSetActiveId) {
              notify(entry.target.id);
            }
          }
        });
      };

      // stolen from nextra: https://github.com/shuding/nextra/blob/3729f67059f1fbdd3f98125bebabbe568c918694/packages/nextra-theme-docs/src/mdx-components/heading-anchor.client.tsx
      // let headerHeight = getComputedStyle(scrollParent || document.body).getPropertyValue(
      //   '--header-abs-height'
      // );
      observer.current = new IntersectionObserver(handleObserver, {
        rootMargin: `0% 0% -80%`,
        // root: scrollParent,
        // threshold: [0, 1],
      });

      Object.values(headings).forEach((elem) => observer?.current?.observe?.(elem.anchor!));
      return () => observer.current?.disconnect();
    }
  }, [callbacks.length, headings, notify, scrollParent]);

  const registerHeading = useCallback((headingItem: HeadingItem) => {
    setHeadings((prevHeadings) => {
      return {
        ...prevHeadings,
        [headingItem.id]: headingItem,
      };
    });

    return () => {
      setHeadings((prevHeadings) => {
        const newHeadings = { ...prevHeadings };
        delete newHeadings[headingItem.id];
        return newHeadings;
      });
    };
  }, []);

  const navigate = useNavigate();

  const scrollToAnchor = useCallback(
    (id: string, smoothScrolling: boolean) => {
      const value = headings[id];
      if (value) {
        thisRef.current.suspendPositionBasedSetActiveId = true;
        value.anchor.scrollIntoView({
          block: "start",
          inline: "start",
          behavior: smoothScrolling ? "smooth" : "auto",
        });
        notify(id);
        requestAnimationFrame(() => {
          navigate(
            {
              hash: `#${value.id}`,
            },
            {
              state: {
                preventHashScroll: true,
              },
            },
          );
          //we clear the preventHashScroll route state:  https://stackoverflow.com/questions/72121228/how-to-update-location-state-in-react-router-v6
          requestAnimationFrame(()=>{
            navigate({
              hash: `#${value.id}`,
            }, { replace: true });
          })
        });
      }
    },
    [headings, navigate, notify],
  );

  const sortedHeadings = useMemo(() => {
    return Object.values(headings).sort(function (a, b) {
      if (a.anchor === b.anchor) return 0;
      if (a.anchor.compareDocumentPosition(b.anchor) & Node.DOCUMENT_POSITION_PRECEDING) {
        // b comes before a
        return 1;
      }
      return -1;
    });
  }, [headings]);


  //the content could take time to load, this way we try to force the scroll to anchor mechanism to kick in
  const hasHeadings = sortedHeadings.length > 0;
  useIsomorphicLayoutEffect(()=>{
    if(hasHeadings){
      forceRefreshAnchorScroll();
    }
  }, [forceRefreshAnchorScroll, hasHeadings]);

  const subscribeToActiveAnchorChange = useCallback((cb: ActiveAnchorChangedCallback) => {
    setCallbacks((prev) => {
      return [...prev, cb];
    });
    return () => {
      setCallbacks((prev) => {
        return prev.filter((item) => item !== cb);
      });
    };
  }, []);

  const contextValue: ITableOfContentsContext = useMemo(() => {
    return {
      registerHeading,
      headings: sortedHeadings,
      scrollToAnchor,
      subscribeToActiveAnchorChange,
      hasTableOfContents: callbacks.length > 0,
      activeAnchorId
    };
  }, [
    registerHeading,
    sortedHeadings,
    scrollToAnchor,
    subscribeToActiveAnchorChange,
    callbacks.length,
    activeAnchorId,
  ]);

  return (
    <TableOfContentsContext.Provider value={contextValue}>
      {children}
    </TableOfContentsContext.Provider>
  );
}

export function useTableOfContents() {
  const context = useContext(TableOfContentsContext);

  if (!context) {
    throw new Error(`The TableOfContents component can only be used inside a Page component.
    <App>
        <Pages>
          <Page url="/">
            <Heading>Harry Potter and the Sorcerer's Stone</Heading>
            <TableOfContents />
          </Page>
        </Pages>
    </App>
    
    `);
  }

  return context;
}
