import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { defaultProps } from "./PageMetaTitle.defaults";
import { PageMetaTitle } from "./PageMetaTitleReact";
import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiNode, XmluiText } from "../../compiler/ir";
import { useXmluiAppContext } from "../../runtime/appContext";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";

const COMP = "PageMetaTitle";

export const PageMetaTitleMd = createMetadata({
  status: "stable",
  nonVisual: true,
  description:
    "`PageMetaTitle` dynamically sets or updates the browser tab title, enabling " +
    "pages and components to override the default application name with context-specific titles.",
  props: {
    value: {
      description: `This property sets the page's title to display in the browser tab.`,
      valueType: "string",
      defaultValue: defaultProps.title,
    },
    noSuffix: {
      description:
        "When set to `true`, suppresses the app name suffix (e.g. `| XMLUI`) that is " +
        "automatically appended to the page title.",
      valueType: "boolean",
      defaultValue: defaultProps.noSuffix,
    },
  },
});

export const pageMetaTitleComponentRenderer = wrapComponent(COMP, PageMetaTitle, PageMetaTitleMd, {
  customRender: (_props, { node, extractValue, renderChild }) => {
    return (
      <PageMetaTitle
        title={extractValue(node.props.value) || renderChild(node.children)}
        noSuffix={extractValue.asOptionalBoolean(node.props.noSuffix)}
      />
    );
  },
});

export const pageMetaTitleRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: PageMetaTitleMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const value = adapter.prop("value");
    const childTitle = textChildren(adapter.node.children);
    const title = value === undefined || value === null || value === ""
      ? childTitle || defaultProps.title
      : String(value).trim();

    return (
      <PageMetaTitleRuntimeHost title={title} noSuffix={adapter.booleanProp("noSuffix", defaultProps.noSuffix)}>
        <PageMetaTitle
          title={title}
          noSuffix={adapter.booleanProp("noSuffix", defaultProps.noSuffix)}
        />
      </PageMetaTitleRuntimeHost>
    );
  },
});

function PageMetaTitleRuntimeHost({
  title,
  noSuffix,
  children,
}: {
  title: string;
  noSuffix?: boolean;
  children: ReactNode;
}) {
  const appContext = useXmluiAppContext();
  const appName = typeof appContext.appGlobals?.name === "string"
    ? appContext.appGlobals.name
    : "test bed app";
  const nextTitle = !noSuffix && appName ? `${title} | ${appName}` : title;

  return (
    <>
      {children}
      <Helmet title={nextTitle} titleTemplate="%s" />
    </>
  );
}

function textChildren(children: XmluiNode[]): string {
  return children
    .filter((child): child is XmluiText => child.kind === "text")
    .map((child) => child.value)
    .join("")
    .trim();
}
