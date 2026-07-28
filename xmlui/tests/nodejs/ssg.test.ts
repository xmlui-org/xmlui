import { describe, expect, it } from "vitest";
import { getSsgEntrySource } from "../../src/nodejs/bin/ssg";

describe("getSsgEntrySource", () => {
  it("imports server routing APIs from react-router", () => {
    const source = getSsgEntrySource([]);

    expect(source).toContain('import { StaticRouter } from "react-router";');
    expect(source).not.toContain("react-router-dom/server");
  });
});
