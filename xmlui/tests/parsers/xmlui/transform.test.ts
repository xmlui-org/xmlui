import { describe, expect, it } from "vitest";
import type { ComponentDef } from "../../../src/abstractions/ComponentDefs";
import { transformSource } from "./xmlui";

describe("Xmlui transform", () => {
  it("Empty component #1", () => {
    const cd = transformSource("<Stack />") as ComponentDef;
    expect(cd.type).equal("Stack");
  });

  it("Empty component #2", () => {
    const cd = transformSource("<!-- This is a stack --><Stack />") as ComponentDef;
    expect(cd.type).equal("Stack");
  });
});
