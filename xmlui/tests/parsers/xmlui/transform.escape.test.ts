import { describe, expect, it } from "vitest";
import { ComponentDef } from "../../../src/abstractions/ComponentDefs";
import { transformSource } from "./xmlui";
import { ParsedPropertyValue } from "../../../src/abstractions/scripting/Compilation";

describe("Xmlui transform - no backslash escape", () => {
  it("backslash", () => {
    const cd = transformSource("<Stack a='\\\\' />") as ComponentDef;
    const value = (cd.props as any).a as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("\\\\");
  });

  it("newline", () => {
    const cd = transformSource("<Stack a='\\n' />") as ComponentDef;
    const value = (cd.props as any).a as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("\\n");
  });
});

describe("Xmlui transform - entity escape", () => {
  it("&amp;", () => {
    const cd = transformSource("<Stack>&amp;</Stack>") as ComponentDef;
    const value = (cd.children[0].props as any).value as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("&");
  });

  it("&gt;", () => {
    const cd = transformSource("<Stack>&gt;</Stack>") as ComponentDef;
    const value = (cd.children[0].props as any).value as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual(">");
  });

  it("&lt;", () => {
    const cd = transformSource("<Stack>&lt;</Stack>") as ComponentDef;
    const value = (cd.children[0].props as any).value as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("<");
  });

  it("&apos;", () => {
    const cd = transformSource("<Stack>&apos;</Stack>") as ComponentDef;
    const value = (cd.children[0].props as any).value as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("'");
  });

  it("&quot;", () => {
    const cd = transformSource("<Stack>&quot;</Stack>") as ComponentDef;
    const value = (cd.children[0].props as any).value as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("\"");
  });

  it("&nbsp;", () => {
    const cd = transformSource("<Stack>&nbsp;&nbsp;&nbsp;</Stack>") as ComponentDef;
    const value = (cd.children[0].props as any).value as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("\xa0\xa0\xa0");
  });

  it("combined", () => {
    const cd = transformSource("<Stack>&quot;&amp;abc&gt;&lt;</Stack>") as ComponentDef;
    const value = (cd.children[0].props as any).value as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual('"&abc><');
  });

  it("&amp; ignored inside CData", () => {
    const cd = transformSource("<Stack><![CDATA[&amp;]]></Stack>") as ComponentDef;
    const value = (cd.children[0].props as any).value;
    expect(value).toEqual("&amp;");
  });

  it("attr - &amp;", () => {
    const cd = transformSource("<H1 value='&amp;' />") as ComponentDef;
    const value = (cd.props as any).value as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("&");
  });

  it("attr - &gt;", () => {
    const cd = transformSource("<H1 value='&gt;' />") as ComponentDef;
    const value = (cd.props as any).value as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual(">");
  });

  it("attr - &nbsp;", () => {
    const cd = transformSource("<H1 value='&nbsp;&nbsp;&nbsp;' />") as ComponentDef;
    const value = (cd.props as any).value as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("\xa0\xa0\xa0");
  });

  it("attr - &lt;", () => {
    const cd = transformSource("<H1 value='&lt;' />") as ComponentDef;
    const value = (cd.props as any).value as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("<");
  });

  it("attr - &apos;", () => {
    const cd = transformSource("<H1 value='&apos;' />") as ComponentDef;
    const value = (cd.props as any).value as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("'");
  });

  it("attr - &quot;", () => {
    const cd = transformSource("<H1 value='&quot;' />") as ComponentDef;
    const value = (cd.props as any).value as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("\"");
  });

  it("attr - combined", () => {
    const cd = transformSource("<H1 value='&quot;&amp;abc&gt;' />") as ComponentDef;
    const value = (cd.props as any).value as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual('"&abc>');
  });
});
