import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createRenderContext } from "../../src/runtime/rendering/renderer";
import {
  wrapComponent,
  type XmluiComponentAdapter,
} from "../../src/runtime/rendering";
import {
  createRuntimeScope,
  createRuntimeStateStore,
} from "../../src/runtime/state";
import { parseXmlui } from "../../src/compiler/parseXmlui";
import { createMetadata, dClick, dComponent, dEnabled } from "../../src/component-core";

const DummyMd = createMetadata({
  props: {
    label: {
      description: "Label.",
      valueType: "string",
    },
    enabled: dEnabled(),
    itemTemplate: dComponent("Item template."),
  },
  events: {
    click: dClick("Dummy"),
  },
  apis: {
    refresh: {
      description: "Refreshes the dummy component.",
      signature: "refresh(): void",
    },
  },
  themeVars: {
    "backgroundColor-Dummy": "The dummy background.",
  },
  defaultThemeVars: {
    "backgroundColor-Dummy": "$color-primary",
  },
});

describe("XMLUI rendering adapter", () => {
  it("extracts props, events, attrs, layout, theme class, children, and templates", () => {
    const document = parseXmlui(`
      <App global.count="{2}">
        <Dummy
          id="dummy"
          label="Hello {count}"
          enabled="{count > 0}"
          padding="$space-2"
          tooltip="Adapter tooltip"
          onClick="count++">
          <Text>Child content</Text>
          <property name="itemTemplate">
            <Text>Template content</Text>
          </property>
        </Dummy>
      </App>
    `);
    const dummyNode = document.root.children[0];
    if (dummyNode.kind !== "element") {
      throw new Error("Unexpected dummy fixture.");
    }
    const store = createRuntimeStateStore();
    store.setInitialGlobalValues({ count: 2 });
    const scope = createRuntimeScope({ store });
    const Dummy = wrapComponent({
      name: "Dummy",
      metadata: DummyMd,
      renderer: ({ adapter }) => (
        <section
          {...adapter.rootAttrs()}
          data-label={adapter.stringProp("label")}
          data-enabled={String(adapter.booleanProp("enabled"))}
          onClick={() => void adapter.event("click")()}
        >
          <div data-template="yes">{adapter.renderTemplate("itemTemplate")}</div>
          <div data-children="yes">{adapter.renderChildren()}</div>
        </section>
      ),
    });
    const context = createRenderContext({}, {});
    const html = renderToStaticMarkup(<Dummy context={context} node={dummyNode} scope={scope} />);

    expect(html).toContain('data-xmlui-behavior="tooltip"');
    expect(html).toContain('title="Adapter tooltip"');
    expect(html).toContain('data-xmlui-component="Dummy"');
    expect(html).toContain('data-xmlui-id="dummy"');
    expect(html).toContain("xmlui-Dummy");
    expect(html).toContain("xmlui-dynamic-");
    expect(html).not.toContain("--xmlui-backgroundColor-Dummy");
    expect(html).toContain('data-label="Hello 2"');
    expect(html).toContain('data-enabled="true"');
    expect(html).toContain("var(--xmlui-space-2)");
    expect(html).toContain("Template content");
    expect(html).toContain("Child content");
  });

  it("exposes resource coercion and API registration to component renderers", () => {
    let capturedAdapter: XmluiComponentAdapter | undefined;
    const document = parseXmlui(`<App><Dummy id="dummy" label="/assets/logo.svg" /></App>`);
    const dummyNode = document.root.children[0];
    if (dummyNode.kind !== "element") {
      throw new Error("Unexpected dummy fixture.");
    }
    const store = createRuntimeStateStore();
    const scope = createRuntimeScope({ store });
    const Dummy = wrapComponent({
      name: "Dummy",
      metadata: DummyMd,
      renderer: ({ adapter }) => {
        capturedAdapter = adapter;
        adapter.registerApi({
          refresh: () => "ok",
        });
        return (
          <div
            {...adapter.rootAttrs()}
            data-resource={adapter.resourceUrl(adapter.prop("label"))}
            data-has-api={String(typeof adapter.api.refresh === "function")}
          />
        );
      },
    });
    const context = createRenderContext({}, {});
    const html = renderToStaticMarkup(<Dummy context={context} node={dummyNode} scope={scope} />);

    expect(html).toContain('data-resource="/assets/logo.svg"');
    expect(html).toContain('data-has-api="true"');
    expect(capturedAdapter?.api.refresh).toBeTypeOf("function");
  });
});
