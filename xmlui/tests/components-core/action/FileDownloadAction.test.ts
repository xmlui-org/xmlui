import { beforeEach, describe, expect, it, vi } from "vitest";

import { downloadAction } from "../../../src/components-core/action/FileDownloadAction";
import type { ActionExecutionContext } from "../../../src/abstractions/ActionDefs";

function createExecutionContext(overrides: Partial<ActionExecutionContext> = {}): ActionExecutionContext {
  return {
    uid: Symbol("download-test"),
    state: {},
    appContext: {
      appGlobals: { apiUrl: "https://api.example" },
      apiInterceptorContext: {
        isMocked: vi.fn().mockReturnValue(false),
      },
    } as any,
    lookupAction: vi.fn(),
    getCurrentState: () => ({}),
    navigate: vi.fn(),
    location: undefined as any,
    ...overrides,
  };
}

describe("download action", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
    vi.spyOn(window.URL, "createObjectURL").mockReturnValue("blob:download");
    vi.spyOn(window.URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  });

  it("keeps simple GET downloads on the iframe path", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await downloadAction.actionFn(createExecutionContext(), {
      url: "/reports/public.csv",
      method: "get",
      fileName: "public.csv",
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(document.querySelector("iframe")?.getAttribute("src")).toBe(
      "https://api.example/reports/public.csv",
    );
  });

  it("uses fetch for GET downloads with custom headers", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("a,b\n1,2\n", {
        status: 200,
        headers: { "content-type": "text/csv" },
      }),
    );

    await downloadAction.actionFn(createExecutionContext(), {
      url: "/reports/private.csv",
      method: "get",
      fileName: "private.csv",
      headers: { "X-Custom-Header": "test-value" },
    });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(options.headers).toMatchObject({
      "X-Custom-Header": "test-value",
    });
    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(document.querySelector("iframe")).toBeNull();
  });
});
