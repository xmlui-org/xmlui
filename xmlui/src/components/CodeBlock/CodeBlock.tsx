import styles from "./CodeBlock.module.scss";

import { parseScssVar } from "../../components-core/theming/themeVars";
import { CodeBlock } from "./CodeBlockReact";
import { createMetadata } from "../metadata-helpers";
import React, { Children, cloneElement, isValidElement, type ReactNode, useEffect, useRef } from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { wrapComponent } from "../../components-core/wrapComponent";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";

const COMP = "CodeBlock";

export const CodeBlockMd = createMetadata({
  status: "stable",
  description: `The \`${COMP}\` component displays code with optional syntax highlighting and meta information.`,
  parts: {
    header: {
      description: "The header section of the CodeBlock, typically displaying the filename.",
    },
    content: {
      description: "The main content area of the CodeBlock where the code is displayed.",
    }
  },
  props: {},
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "backgroundColor-CodeBlock": "$color-primary-50",
    "backgroundColor-CodeBlock-header": "$color-primary-100",
    "marginTop-CodeBlock": "$space-6",
    "marginBottom-CodeBlock": "$space-6",
    "backgroundColor-CodeBlock-highlightRow": "rgb(from $color-primary-200 r g b / 0.25)",
    "backgroundColor-CodeBlock-highlightString": "rgb(from $color-primary-200 r g b / 0.5)",

    "borderColor-CodeBlock-highlightString-emphasis": "$color-attention",
    "border-CodeBlock": "0.5px solid $borderColor",
    "borderRadius-CodeBlock": "$space-2",
    "height-CodeBlock": "fit-content",
    "paddingVertical-content-CodeBlock": "0",
    "paddingHorizontal-content-CodeBlock": "0",

    dark: {
      "backgroundColor-CodeBlock-header": "$color-surface-200",
      "backgroundColor-CodeBlock": "$color-surface-50",
      "backgroundColor-CodeBlock-highlightRow": "rgb(from $color-secondary-300 r g b / 0.45)",
      "backgroundColor-CodeBlock-highlightString": "rgb(from $color-primary-300 r g b / 0.5)",
    }
  },
});

type ThemedCodeBlockProps = React.ComponentPropsWithoutRef<typeof CodeBlock>;

export const ThemedCodeBlock = React.forwardRef<HTMLDivElement, ThemedCodeBlockProps>(
  function ThemedCodeBlock({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(CodeBlockMd);
    return (
      <CodeBlock
        {...props}
        ref={ref}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
      />
    );
  },
);

export const codeBlockComponentRenderer = wrapComponent(
  "CodeBlock",
  CodeBlock,
  CodeBlockMd,
);

export const codeBlockRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: CodeBlockMd as ComponentMetadata,
  renderer: ({ adapter }) => (
    <RuntimeCodeBlock
      {...adapter.rootAttrs()}
      meta={adapter.prop("meta")}
      textToCopy={adapter.stringProp("textToCopy")}
    >
      {decodeCodeTextMarkers(adapter.renderChildren())}
    </RuntimeCodeBlock>
  ),
});

function RuntimeCodeBlock(props: React.ComponentPropsWithoutRef<typeof ThemedCodeBlock>) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const root = rootRef.current ??
      (document.querySelector('[data-xmlui-component="CodeBlock"]') as HTMLDivElement | null);
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
  return <ThemedCodeBlock {...props} ref={rootRef} />;
}

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
  const element = node as React.ReactElement<{ children?: ReactNode }>;
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
