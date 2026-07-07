import React, { Fragment, useSyncExternalStore, type ReactNode } from "react";

import { createMetadata } from "../metadata-helpers";
import { wrapComponent } from "../../components-core/wrapComponent";
import { useAppContext } from "../../components-core/AppContext";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";

const COMP = "I18n";

export const I18nMd = createMetadata({
  status: "experimental",
  description:
    "`I18n` renders a translated message from the active locale bundle. Variables are " +
    "passed as props, and translated slot placeholders such as `<link/>` are replaced " +
    "with matching named XMLUI slots.",
  allowArbitraryProps: true,
  props: {
    key: {
      description: "Translation key to resolve from the active locale bundle.",
      valueType: "string",
      isRequired: true,
    },
  },
});

function I18nView({
  messageKey,
  vars,
  slots,
  renderChild,
}: {
  messageKey: string;
  vars: Record<string, unknown>;
  slots?: Record<string, ComponentDef[]>;
  renderChild: (node?: ComponentDef | ComponentDef[]) => ReactNode;
}) {
  const appContext = useAppContext();
  const translated = appContext.App.translate(messageKey, vars);
  return <span>{renderTranslatedSlots(translated, slots, renderChild)}</span>;
}

export const i18nComponentRenderer = wrapComponent(
  COMP,
  Fragment as unknown as React.ComponentType,
  I18nMd,
  {
    customRender: (_props, { node, extractValue, renderChild }) => {
      const messageKey = extractValue.asOptionalString(node.props.key) ?? "";
      const vars: Record<string, unknown> = {};
      const slots: Record<string, ComponentDef[]> = { ...(node.slots ?? {}) };
      for (const [rawName, rawValue] of Object.entries(node.props ?? {})) {
        if (rawName === "key") continue;
        const slotValue = asSlotValue(rawValue);
        if (slotValue) {
          slots[rawName] = slotValue;
          continue;
        }
        const name = rawName.startsWith(":") ? rawName.slice(1) : rawName;
        vars[name] = extractValue(rawValue);
      }
      return (
        <I18nView messageKey={messageKey} vars={vars} slots={slots} renderChild={renderChild} />
      );
    },
  },
);

function asSlotValue(value: unknown): ComponentDef[] | undefined {
  if (isComponentDef(value)) return [value];
  if (Array.isArray(value) && value.every(isComponentDef)) return value;
  return undefined;
}

function isComponentDef(value: unknown): value is ComponentDef {
  return (
    typeof value === "object" && value !== null && typeof (value as ComponentDef).type === "string"
  );
}

function renderTranslatedSlots(
  translated: string,
  slots: Record<string, ComponentDef[]> | undefined,
  renderChild: (node?: ComponentDef | ComponentDef[]) => ReactNode,
): ReactNode {
  if (!slots) return translated;
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
        {slots[slotName] ? renderChild(slots[slotName]) : match[0]}
      </Fragment>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < translated.length) {
    parts.push(translated.slice(lastIndex));
  }
  return parts.length ? parts : translated;
}

export const i18nRenderer = wrapRuntimeComponent({
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
    const translated = i18n?.translate(key, runtimeTranslationVars(adapter)) ?? key;

    return (
      <span {...adapter.rootAttrs()}>
        {renderRuntimeTranslatedSlots(translated, adapter)}
      </span>
    );
  },
});

function runtimeTranslationVars(adapter: XmluiComponentAdapter): Record<string, unknown> {
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

function renderRuntimeTranslatedSlots(
  translated: string,
  adapter: XmluiComponentAdapter,
): ReactNode {
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
        {adapter.renderTemplate(slotName, [
          {
            kind: "text",
            value: match[0],
            segments: undefined,
            range: adapter.node.range,
          },
        ])}
      </Fragment>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < translated.length) {
    parts.push(translated.slice(lastIndex));
  }
  return parts.length ? parts : translated;
}

function noopSubscribe(): () => void {
  return () => undefined;
}
