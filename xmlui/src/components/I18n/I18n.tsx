import { Fragment, useSyncExternalStore, type ReactNode } from "react";

import { wrapComponent } from "../../runtime/rendering/adapter";
import { createMetadata } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiComponentAdapter } from "../../runtime/rendering/adapter";

const COMP = "I18n";

export const I18nMd = createMetadata({
  status: "experimental",
  description:
    "`I18n` renders a translated message from the active locale bundle. Variables are passed as props, and translated slot placeholders such as `<link/>` are replaced with matching named XMLUI slots.",
  props: {
    key: {
      description: "Translation key to resolve from the active locale bundle.",
      valueType: "string",
      isRequired: true,
    },
  },
});

export const i18nRenderer = wrapComponent({
  name: COMP,
  metadata: I18nMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const i18n = adapter.scope.i18n;
    useSyncExternalStore(
      i18n?.subscribe ?? noopSubscribe,
      () => i18n?.getSnapshot().revision ?? 0,
      () => 0,
    );
    const key = adapter.stringProp("key", "") ?? "";
    const translated = i18n?.translate(key, translationVars(adapter)) ?? key;

    return (
      <span {...adapter.rootAttrs()}>
        {renderTranslatedSlots(translated, adapter)}
      </span>
    );
  },
});

function translationVars(adapter: XmluiComponentAdapter): Record<string, unknown> {
  const vars: Record<string, unknown> = {};
  for (const [rawName, value] of Object.entries(adapter.props)) {
    if (rawName === "key" || rawName === "id" || rawName === "testId") {
      continue;
    }
    const name = rawName.startsWith(":") ? rawName.slice(1) : rawName;
    vars[name] = value;
  }
  return vars;
}

function renderTranslatedSlots(translated: string, adapter: XmluiComponentAdapter): ReactNode {
  const parts: ReactNode[] = [];
  const slotPattern = /<([A-Za-z_][\w-]*)\s*\/>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = slotPattern.exec(translated)) !== null) {
    if (match.index > lastIndex) {
      parts.push(translated.slice(lastIndex, match.index));
    }
    const slotName = match[1];
    parts.push(
      <Fragment key={`${slotName}-${match.index}`}>
        {adapter.renderTemplate(slotName, [{ kind: "text", value: match[0], segments: undefined, range: adapter.node.range }])}
      </Fragment>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < translated.length) {
    parts.push(translated.slice(lastIndex));
  }
  return parts.length > 0 ? parts : translated;
}

function noopSubscribe(): () => void {
  return () => undefined;
}
