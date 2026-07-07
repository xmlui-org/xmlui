import type { ReactNode } from "react";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { nonPropertyChildren, templateChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { runEvent } from "../../runtime/rendering/bindings";
import { createRuntimeScope, readContext } from "../../runtime/state";
import { FormMd } from "./Form";
import { FormWithContextVar } from "./FormReact";

export const formRenderer = wrapComponent({
  name: "Form",
  metadata: FormMd,
  renderer({ adapter }) {
    const buttonRowTemplate = templateChildren(adapter.node, "buttonRowTemplate");
    const rootAttrs = adapter.rootAttrs();
    const formId = adapter.stringProp("id");
    const registerFormApi = (api: Record<string, unknown>) => {
      adapter.registerApi(api);
      if (!formId) {
        return;
      }
      const current = adapter.scope.references[formId];
      const target =
        current && typeof current === "object"
          ? current as Record<string, unknown>
          : {};
      let changed = current !== target;
      for (const [key, value] of Object.entries(api)) {
        if (target[key] !== value) {
          target[key] = value;
          changed = true;
        }
      }
      adapter.scope.references[formId] = target;
      if (changed) {
        adapter.scope.store.writeGlobal(formId, target);
        adapter.scope.store.invalidateReference(formId);
      }
    };
    const node = {
      ...adapter.node,
      uid: adapter.stringProp("id"),
      props: {
        ...adapter.props,
        buttonRowTemplate,
      },
      children: nonPropertyChildren(adapter.node.children),
    } as unknown as ComponentDef<typeof FormMd>;

    const extractValue = ((value: unknown) => value) as ValueExtractor;
    Object.assign(extractValue, {
      asString: (value: unknown, fallback = "") =>
        value === undefined || value === null ? fallback : String(value),
      asDisplayText: (value: unknown) =>
        value === undefined || value === null ? "" : String(value),
      asOptionalBoolean: (value: unknown, fallback?: boolean) => {
        if (typeof value === "boolean") {
          return value;
        }
        if (typeof value === "string") {
          return value === "true" ? true : value === "false" ? false : fallback;
        }
        return value === undefined || value === null ? fallback : Boolean(value);
      },
      asOptionalNumber: (value: unknown, fallback?: number) => {
        if (value === undefined || value === null || value === "") {
          return fallback;
        }
        const numericValue = typeof value === "number" ? value : Number(value);
        return Number.isFinite(numericValue) ? numericValue : fallback;
      },
      asOptionalString: (value: unknown, fallback?: string) =>
        value === undefined || value === null ? fallback : String(value),
      asSize: (value: unknown, fallback?: string) =>
        value === undefined || value === null || value === "" ? fallback : String(value),
    });

    return (
      <FormWithContextVar
          node={node}
          rootAttrs={rootAttrs}
          style={adapter.style}
          renderChild={(child: unknown): ReactNode => {
          if (isComponentDef(child) && (child.type === "Fragment" || child.type === "Container")) {
            const scoped = createRuntimeScope({
              store: adapter.scope.store,
              parent: adapter.scope,
              props: adapter.scope.props,
              contextValues: {
                ...((child as any).vars ?? {}),
                ...((child as any).contextVars ?? {}),
              },
              references: adapter.scope.references,
              slots: adapter.scope.slots,
              routing: adapter.scope.routing,
              toast: adapter.scope.toast,
              emitEvent: adapter.scope.emitEvent,
              extensionFunctions: adapter.scope.extensionFunctions,
            });
            return adapter.context.renderChildren(nonPropertyChildren(child.children as any), scoped);
          }
          if (child === buttonRowTemplate) {
            return adapter.renderTemplate("buttonRowTemplate");
          }
          if (Array.isArray(child)) {
            return adapter.context.renderChildren(nonPropertyChildren(child as any), adapter.scope);
          }
          if (isComponentDef(child)) {
            if (child.type === "property") {
              return null;
            }
            return adapter.context.renderChildren([child as any], adapter.scope);
          }
          return adapter.context.renderChildren(nonPropertyChildren(adapter.node.children), adapter.scope);
          }}
          extractValue={extractValue}
          lookupEventHandler={(eventName: string, actionOptions?: Record<string, any>) => async (...args: unknown[]) => {
          const scoped = actionOptions?.context
            ? createRuntimeScope({
                store: adapter.scope.store,
                parent: adapter.scope,
                props: adapter.scope.props,
                contextValues: actionOptions.context,
                references: adapter.scope.references,
                slots: adapter.scope.slots,
                routing: adapter.scope.routing,
                toast: adapter.scope.toast,
                emitEvent: adapter.scope.emitEvent,
                extensionFunctions: adapter.scope.extensionFunctions,
              })
            : adapter.scope;
          const parsedEvent = adapter.node.parsed?.events?.[eventName];
          if (adapter.node.events[eventName] !== undefined || parsedEvent) {
            return runEvent(parsedEvent, scoped, args);
          }
          if (eventName === "submit" && actionOptions?.defaultSubmitInput) {
            const actions = readContext(scoped, "Actions") as
              | { callApi?: (input: Record<string, unknown>) => Promise<unknown> }
              | undefined;
            const input = {
              ...actionOptions.defaultSubmitInput,
              body: args[0],
            };
            if (!input.headers) {
              delete input.headers;
            }
            return actions?.callApi?.(input);
          }
          return undefined;
          }}
          classes={{ [COMPONENT_PART_KEY]: adapter.className }}
          registerComponentApi={registerFormApi}
        />
    );
  },
});

function isComponentDef(value: unknown): value is ComponentDef & { vars?: Record<string, unknown> } {
  return Boolean(value && typeof value === "object" && "type" in value);
}
