import React from "react";
import { renderToString } from "react-dom/server";

import { XmluiRoot } from "../runtime";
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

export function renderSsgExample(example: SsgExampleName, path = "/"): string {
  const module = examples[example];
  return renderToString(<XmluiRoot module={module} initialUrl={path} extensions={[counterBadgeExtension]} />);
}
