import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  memo,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
} from "react";

export type CodeBlockMeta = {
  filename?: string;
};

export type CodeBlockProps = {
  children?: ReactNode;
  meta?: CodeBlockMeta | unknown;
  className?: string;
  style?: CSSProperties;
};

export const CodeBlock = memo(forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  {
    children,
    meta,
    className,
    style,
    ...rest
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const normalizedMeta = typeof meta === "object" && meta !== null && !Array.isArray(meta)
    ? meta as CodeBlockMeta
    : undefined;
  const normalizedChildren = decodeCodeTextMarkers(children);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      node.textContent = decodeCodeText(node.textContent ?? "");
      node = walker.nextNode();
    }
  });

  return (
    <div
      {...rest}
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={["xmluiCodeBlock", "global-codeBlock", className].filter(Boolean).join(" ")}
      style={style}
    >
      {normalizedMeta?.filename ? (
        <div data-xmlui-part="header" className="xmluiCodeBlockHeader">
          {normalizedMeta.filename}
        </div>
      ) : null}
      <div data-xmlui-part="content" className="xmluiCodeBlockContent">
        {normalizedChildren}
      </div>
    </div>
  );
}));

function decodeCodeTextMarkers(node: ReactNode): ReactNode {
  if (typeof node === "string") {
    return decodeCodeText(node);
  }
  if (Array.isArray(node)) {
    return node.map(decodeCodeTextMarkers);
  }
  if (!isValidElement(node)) {
    return node;
  }
  const element = node as ReactElement<{ children?: ReactNode }>;
  if (element.props.children === undefined) {
    return element;
  }
  return cloneElement(element, {
    children: Children.map(element.props.children, decodeCodeTextMarkers),
  });
}

function decodeCodeText(value: string): string {
  return value.replaceAll("&#123;", "{").replaceAll("&#125;", "}");
}
