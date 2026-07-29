// @vitest-environment node

import { describe, expect, it } from "vitest";
import { getSsgEntrySource } from "../../src/nodejs/bin/ssg";

describe("getSsgEntrySource", () => {
  it("imports server routing APIs from react-router-dom/server", () => {
    const source = getSsgEntrySource([]);

    expect(source).toContain('import { StaticRouter } from "react-router-dom/server";');
    expect(source).not.toContain('import { StaticRouter } from "react-router";');
  });
});
