import { describe, expect, it } from "vitest";
import { ComponentDefNew } from "@abstractions/ComponentDefs";
import { transformSource } from "./xmlui";

describe("Xmlui transform - no backslash escape", () => {
  it("backslash", () => {
    const cd = transformSource("<Stack a='\\\\' />") as ComponentDefNew;
    expect((cd.props as any).a).equal("\\\\");
  });

  it("newline", () => {
    const cd = transformSource("<Stack a='\\n' />") as ComponentDefNew;
    expect((cd.props as any).a).equal("\\n");
  });
});

describe("Xmlui transform - entity escape", () => {
  it("&amp;", () => {
    const cd = transformSource("<Stack>&amp;</Stack>") as ComponentDefNew;
    expect((cd.children![0].props as any).value).toEqual("&");
  });

  it("&gt;", () => {
    const cd = transformSource("<Stack>&gt;</Stack>") as ComponentDefNew;
    expect((cd.children![0].props as any).value).toEqual(">");
  });

  it("&lt;", () => {
    const cd = transformSource("<Stack>&lt;</Stack>") as ComponentDefNew;
    expect((cd.children![0].props as any).value).toEqual("<");
  });
  it("&apos;", () => {
    const cd = transformSource("<Stack>&apos;</Stack>") as ComponentDefNew;
    expect((cd.children![0].props as any).value).toEqual("'");
  });
  it("&quot;", () => {
    const cd = transformSource("<Stack>&quot;</Stack>") as ComponentDefNew;
    expect((cd.children![0].props as any).value).toEqual('"');
  });
  it("&nbsp;", () => {
    const cd = transformSource("<Stack>&nbsp;&nbsp;&nbsp;</Stack>") as ComponentDefNew;
    expect((cd.children![0].props as any).value).toEqual("\xa0\xa0\xa0");
  });

  it("combined", () => {
    const cd = transformSource("<Stack>&quot;&amp;abc&gt;&lt;</Stack>") as ComponentDefNew;
    expect((cd.children![0].props as any).value).toEqual('"&abc><');
  });

  it("&amp; ignored inside CData", () => {
    const cd = transformSource("<Stack><![CDATA[&amp;]]></Stack>") as ComponentDefNew;
    expect((cd.children![0].props as any).value).toEqual("&amp;");
  });

  it("attr - &amp;", () => {
    const cd = transformSource("<H1 value='&amp;' />") as ComponentDefNew;
    expect((cd.props as any).value).toEqual("&");
  });

  it("attr - &gt;", () => {
    const cd = transformSource("<H1 value='&gt;' />") as ComponentDefNew;
    expect((cd.props as any).value).toEqual(">");
  });

  it("attr - &nbsp;", () => {
    const cd = transformSource("<H1 value='&nbsp;&nbsp;&nbsp;' />") as ComponentDefNew;
    expect((cd.props as any).value).toEqual("\xa0\xa0\xa0");
  });

  it("attr - &lt;", () => {
    const cd = transformSource("<H1 value='&lt;' />") as ComponentDefNew;
    expect((cd.props as any).value).toEqual("<");
  });
  it("attr - &apos;", () => {
    const cd = transformSource("<H1 value='&apos;' />") as ComponentDefNew;
    expect((cd.props as any).value).toEqual("'");
  });
  it("attr - &quot;", () => {
    const cd = transformSource("<H1 value='&quot;' />") as ComponentDefNew;
    expect((cd.props as any).value).toEqual('"');
  });

  it("attr - combined", () => {
    const cd = transformSource("<H1 value='&quot;&amp;abc&gt;' />") as ComponentDefNew;
    expect((cd.props as any).value).toEqual('"&abc>');
  });
});
