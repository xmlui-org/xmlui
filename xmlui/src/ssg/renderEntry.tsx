import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

import { XmluiRoot } from "../runtime";
import { StyleProvider } from "../components-core/theming/StyleContext";
import { StyleRegistry } from "../components-core/theming/StyleRegistry";
import counterBadgeExtension from "../../../packages/xmlui-counter-badge/src";

import counterComponentsApp from "../../standalone-samples/counter-components/Main.xmlui";
import routingStateApp from "../../standalone-samples/routing-state/Main.xmlui";
import styleMutationApp from "../../standalone-samples/style-mutation/Main.xmlui";
import extensionCounterBadgeApp from "../../standalone-samples/extension-counter-badge/Main.xmlui";

const examples = {
  counterComponents: counterComponentsApp,
  routingState: routingStateApp,
  styleMutation: styleMutationApp,
  extensionCounterBadge: extensionCounterBadgeApp,
};

export type SsgExampleName = keyof typeof examples;

export type SsgRenderResult = {
  markup: string;
  ssrStyles: string;
  ssrHashes: string;
  htmlClasses: string;
};

export function renderSsgExample(example: SsgExampleName, path = "/"): SsgRenderResult {
  const module = examples[example];
  const registry = new StyleRegistry();
  const markup = renderToString(
    <StyleProvider styleRegistry={registry}>
      <MemoryRouter initialEntries={[path]}>
        <XmluiRoot module={module} initialUrl={path} extensions={[counterBadgeExtension]} />
      </MemoryRouter>
    </StyleProvider>,
  );
  return {
    markup,
    ssrStyles: registry.getSsrStyles(),
    ssrHashes: Array.from(registry.cache.keys()).join(","),
    htmlClasses: registry.getRootClasses(),
  };
}
