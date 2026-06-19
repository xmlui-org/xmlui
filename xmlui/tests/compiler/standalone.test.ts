import { describe, expect, it } from "vitest";

import { loadStandaloneXmluiApp, StandaloneLoadError } from "../../src/standalone/loader";

describe("standalone XMLUI loader", () => {
  it("fetches Main.xmlui, transitive components, and links an app module", async () => {
    const result = await loadStandaloneXmluiApp({
      baseUrl: "https://example.test/app/",
      fetch: fakeFetch({
        "https://example.test/app/Main.xmlui": `
          <App>
            <H1>Standalone</H1>
            <CounterBox />
          </App>
        `,
        "https://example.test/app/CounterBox.xmlui": `
          <Component name="CounterBox">
            <IncrementButton />
          </Component>
        `,
        "https://example.test/app/IncrementButton.xmlui": `
          <Component name="IncrementButton" var.count="{0}">
            <Button onClick="count++">Count: {count}</Button>
          </Component>
        `,
      }),
    });

    expect(result.module.kind).toBe("app");
    expect(Object.keys(result.module.components).sort()).toEqual(["CounterBox", "IncrementButton"]);
    expect(result.referencedComponents).toEqual(["CounterBox", "IncrementButton"]);
    expect(result.sources.map((source) => source.url).sort()).toEqual([
      "https://example.test/app/CounterBox.xmlui",
      "https://example.test/app/IncrementButton.xmlui",
      "https://example.test/app/Main.xmlui",
    ]);
  });

  it("reports missing component files with the failed URL and component name", async () => {
    await expect(
      loadStandaloneXmluiApp({
        baseUrl: "https://example.test/app/",
        fetch: fakeFetch({
          "https://example.test/app/Main.xmlui": `<App><MissingBox /></App>`,
        }),
      }),
    ).rejects.toMatchObject({
      name: "StandaloneLoadError",
      details: {
        url: "https://example.test/app/MissingBox.xmlui",
        status: 404,
        componentName: "MissingBox",
      },
    } satisfies Partial<StandaloneLoadError>);
  });
});

function fakeFetch(sources: Record<string, string>): typeof fetch {
  return ((input: RequestInfo | URL) => {
    const url = String(input);
    const source = sources[url];
    return Promise.resolve({
      ok: source !== undefined,
      status: source === undefined ? 404 : 200,
      text: () => Promise.resolve(source ?? "Not found"),
    } as Response);
  }) as typeof fetch;
}

