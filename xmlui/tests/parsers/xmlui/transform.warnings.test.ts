import { describe, expect, it } from "vitest";
import { transformSource } from "./xmlui";

describe("Xmlui transform — duplicate id warnings", () => {
  it("does not warn when all ids are unique", () => {
    const warnings: string[] = [];
    transformSource(
      `
      <App>
        <Text id="a" />
        <Text id="b" />
        <Text id="c" />
      </App>
    `,
      undefined,
      false,
      warnings,
    );
    expect(warnings).toHaveLength(0);
  });

  it("warns when two sibling components share an id", () => {
    const warnings: string[] = [];
    transformSource(
      `
      <App>
        <Text id="dup" />
        <Text id="dup" />
      </App>
    `,
      undefined,
      false,
      warnings,
    );
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("dup");
  });

  it("warns once for each extra occurrence of a duplicated id", () => {
    const warnings: string[] = [];
    transformSource(
      `
      <App>
        <Text id="multi" />
        <Text id="multi" />
        <Text id="multi" />
      </App>
    `,
      undefined,
      false,
      warnings,
    );
    // First occurrence is fine; second and third trigger a warning each.
    expect(warnings).toHaveLength(2);
  });

  it("warns when a nested component duplicates an id used by an ancestor", () => {
    const warnings: string[] = [];
    transformSource(
      `
      <App>
        <VStack id="outer">
          <Text id="outer" />
        </VStack>
      </App>
    `,
      undefined,
      false,
      warnings,
    );
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("outer");
  });

  it("warns when deeply nested components share an id", () => {
    const warnings: string[] = [];
    transformSource(
      `
      <App>
        <VStack>
          <HStack>
            <Text id="deep" />
            <Text id="deep" />
          </HStack>
        </VStack>
      </App>
    `,
      undefined,
      false,
      warnings,
    );
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("deep");
  });

  it("warning message includes the position of the duplicate attribute", () => {
    const warnings: string[] = [];
    transformSource(
      `<App><Text id="pos-test" /><Text id="pos-test" /></App>`,
      undefined,
      false,
      warnings,
    );
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/line \d+, column \d+/);
  });

  it("does not warn when only a single component has an id", () => {
    const warnings: string[] = [];
    transformSource(`<App id="solo"><Text /></App>`, undefined, false, warnings);
    expect(warnings).toHaveLength(0);
  });

  it("does not warn when no component has an id", () => {
    const warnings: string[] = [];
    transformSource(`<App><Text /><Button /></App>`, undefined, false, warnings);
    expect(warnings).toHaveLength(0);
  });
});
