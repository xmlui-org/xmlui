import { describe, expect, it } from "vitest";
import type { ComponentDef } from "../../../src";
import type { StandaloneAppDescription } from "../../../src/components-core/abstractions/standalone";
import {
  StandaloneValidationSeverity,
  getStandaloneValidationSeverity,
  validateStandaloneAppTypeContracts,
} from "../../../src/components-core/type-contracts/standalone-validation";
import { MetadataProvider } from "../../../src/language-server/services/common/metadata-utils";
import { transformSource } from "../../parsers/xmlui/xmlui";

describe("standalone type-contract validation", () => {
  const textContractProvider = new MetadataProvider({
    App: {
      props: {},
      events: {},
    },
    H1: {
      props: {},
      events: {},
    },
    Stack: {
      props: {},
      events: {},
    },
    Text: {
      props: {
        variant: {
          valueType: "string",
          availableValues: [
            { value: "strong", description: "Strong" },
            { value: "em", description: "Emphasis" },
          ],
          isStrictEnum: true,
        },
      },
      events: {},
    },
  });

  it("formats verifier diagnostics for standalone markup", () => {
    const source = `
      <App>
        <H1>Typed Contracts</H1>
        <Text varian="strong">Contains an invalid property name</Text>
        <Text variant="dummy">Contains an invalid property value</Text>
      </App>
    `;
    const entryPoint = transformSource(source, "Main.xmlui") as ComponentDef;
    const appDef: StandaloneAppDescription = { entryPoint, sources: { "Main.xmlui": source } };

    const validationIssues = validateStandaloneAppTypeContracts({
      appDef,
      metadataProvider: textContractProvider,
      strict: false,
    });

    expect(validationIssues).toHaveLength(1);
    expect(validationIssues[0].componentName).toBe("Main");
    expect(validationIssues[0].issues.map((diag) => diag.message)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("[xmlui:type-contract] [id-unknown-prop]"),
        expect.stringContaining("[xmlui:type-contract] [value-not-in-enum]"),
      ]),
    );
    expect(validationIssues[0].issues[1].message).toContain("dummy");
  });

  it("honors analyzer-style suppression comments in standalone markup", () => {
    const source = `
      <App>
        <H1>Typed Contracts</H1>
        <!-- xmlui-disable id-unknown-prop -->
        <Text varian="strong">Contains an invalid property name</Text>
        <Text variant="dummy">Contains an invalid property value</Text>
      </App>
    `;
    const entryPoint = transformSource(source, "Main.xmlui") as ComponentDef;
    const appDef: StandaloneAppDescription = { entryPoint, sources: { "Main.xmlui": source } };

    const validationIssues = validateStandaloneAppTypeContracts({
      appDef,
      metadataProvider: textContractProvider,
      strict: false,
    });

    expect(validationIssues).toHaveLength(1);
    const messages = validationIssues[0].issues.map((diag) => diag.message);
    expect(messages.some((message) => message.includes("[id-unknown-prop]"))).toBe(false);
    expect(messages.some((message) => message.includes("[value-not-in-enum]"))).toBe(true);
  });

  it("reports style as an unknown prop when the component does not declare it", () => {
    const source = `
      <App>
        <Stack style="position: fixed; color: red !important;">
          <Text>Unsafe inline style attempt</Text>
        </Stack>
      </App>
    `;
    const entryPoint = transformSource(source, "Main.xmlui") as ComponentDef;
    const appDef: StandaloneAppDescription = { entryPoint, sources: { "Main.xmlui": source } };

    const validationIssues = validateStandaloneAppTypeContracts({
      appDef,
      metadataProvider: textContractProvider,
      strict: false,
    });

    expect(validationIssues).toHaveLength(1);
    const messages = validationIssues[0].issues.map((diag) => diag.message);
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringContaining('[id-unknown-prop] <Stack> has unknown prop "style"'),
      ]),
    );
  });

  it("does not format enum diagnostics for expression values", () => {
    const entryPoint = transformSource(`<Text variant="{state.textVariant}" />`) as ComponentDef;
    const appDef: StandaloneAppDescription = { entryPoint };

    const validationIssues = validateStandaloneAppTypeContracts({
      appDef,
      metadataProvider: textContractProvider,
      strict: false,
    });

    expect(validationIssues).toHaveLength(0);
  });

  it("parses standalone lint severity options", () => {
    expect(getStandaloneValidationSeverity(undefined)).toBe(StandaloneValidationSeverity.Warning);
    expect(getStandaloneValidationSeverity("warning")).toBe(StandaloneValidationSeverity.Warning);
    expect(getStandaloneValidationSeverity("error")).toBe(StandaloneValidationSeverity.Error);
    expect(getStandaloneValidationSeverity("strict")).toBe(StandaloneValidationSeverity.Strict);
    expect(getStandaloneValidationSeverity("skip")).toBe(StandaloneValidationSeverity.Skip);
  });
});
