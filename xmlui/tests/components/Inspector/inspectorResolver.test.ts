import { describe, it, expect } from "vitest";
import {
  cdnBaseUrl,
  checkLocalViewer,
  parseRuntimeVersion,
  resolveViewer,
  rewriteParserImport,
} from "../../../src/components/Inspector/inspectorResolver";

const LOCAL_VIEWER = "https://app.example/xmlui/xs-diff.html";
const LOCAL_PARSER = "https://app.example/xmlui/xmlui-parser.es.js";
const CDN = cdnBaseUrl("0.14.28");
const VIEWER_HTML = `<script type="module">import { XmluiSource } from "./xmlui-parser.es.js";</script>`;

/** A fake fetch that serves only the given URLs and records every request. */
function fakeFetch(available: Record<string, string>) {
  const calls: string[] = [];
  const fetcher = async (url: string, init?: RequestInit) => {
    calls.push(`${init?.method ?? "GET"} ${url}`);
    if (url in available) {
      return new Response(init?.method === "HEAD" ? null : available[url], { status: 200 });
    }
    return new Response(null, { status: 404 });
  };
  return { fetcher, calls };
}

describe("parseRuntimeVersion", () => {
  it("extracts the semver from VITE_XMLUI_VERSION", () => {
    expect(parseRuntimeVersion("0.14.28 (built 11/2/2026)")).toBe("0.14.28");
  });

  it("keeps a prerelease suffix", () => {
    expect(parseRuntimeVersion("0.15.0-beta.2 (built 11/2/2026)")).toBe("0.15.0-beta.2");
  });

  it("returns undefined for dev builds and empty values", () => {
    expect(parseRuntimeVersion("dev")).toBeUndefined();
    expect(parseRuntimeVersion("")).toBeUndefined();
    expect(parseRuntimeVersion(undefined)).toBeUndefined();
    expect(parseRuntimeVersion("undefined (built 11/2/2026)")).toBeUndefined();
  });
});

describe("rewriteParserImport", () => {
  it("rewrites the relative parser import, keeping the quote style", () => {
    expect(rewriteParserImport(`import { A } from './xmlui-parser.es.js';`, "https://x/p.js")).toBe(
      `import { A } from 'https://x/p.js';`,
    );
    expect(rewriteParserImport(VIEWER_HTML, "https://x/p.js")).toContain(
      `from "https://x/p.js"`,
    );
  });

  it("leaves other imports alone", () => {
    const html = `import * as j from "https://unpkg.com/jsondiffpatch@0.7.3/lib/index.js";`;
    expect(rewriteParserImport(html, "https://x/p.js")).toBe(html);
  });
});

describe("resolveViewer", () => {
  it("uses local files when both exist and never touches the CDN", async () => {
    const { fetcher, calls } = fakeFetch({ [LOCAL_VIEWER]: VIEWER_HTML, [LOCAL_PARSER]: "//" });
    const result = await resolveViewer({ localViewerUrl: LOCAL_VIEWER, version: "0.14.28", fetcher });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.srcDoc).toContain(`from "${LOCAL_PARSER}"`);
    expect(result.resolutions.map((r) => r.source)).toEqual(["local", "local"]);
    expect(calls.some((c) => c.includes("jsdelivr"))).toBe(false);
  });

  it("falls back to the versioned CDN for each missing file independently", async () => {
    const { fetcher } = fakeFetch({
      [LOCAL_VIEWER]: VIEWER_HTML,
      [CDN + "xmlui-parser.es.js"]: "//",
    });
    const result = await resolveViewer({ localViewerUrl: LOCAL_VIEWER, version: "0.14.28", fetcher });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.resolutions).toEqual([
      { file: "xs-diff.html", source: "local", url: LOCAL_VIEWER },
      { file: "xmlui-parser.es.js", source: "cdn", url: CDN + "xmlui-parser.es.js" },
    ]);
    expect(result.srcDoc).toContain(`from "${CDN}xmlui-parser.es.js"`);
    expect(CDN).toBe("https://cdn.jsdelivr.net/npm/xmlui@0.14.28/dist/standalone/");
  });

  it("loads both files from the CDN when nothing is local", async () => {
    const { fetcher } = fakeFetch({
      [CDN + "xs-diff.html"]: VIEWER_HTML,
      [CDN + "xmlui-parser.es.js"]: "//",
    });
    const result = await resolveViewer({ localViewerUrl: LOCAL_VIEWER, version: "0.14.28", fetcher });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.resolutions.map((r) => r.source)).toEqual(["cdn", "cdn"]);
  });

  it("reports the missing file and every URL tried", async () => {
    const { fetcher } = fakeFetch({ [LOCAL_VIEWER]: VIEWER_HTML });
    const result = await resolveViewer({ localViewerUrl: LOCAL_VIEWER, version: "0.14.28", fetcher });

    expect(result.status).toBe("failed");
    if (result.status !== "failed") return;
    expect(result.failure).toEqual({
      file: "xmlui-parser.es.js",
      tried: [LOCAL_PARSER, CDN + "xmlui-parser.es.js"],
    });
  });

  it("does not use the CDN without a runtime version", async () => {
    const { fetcher, calls } = fakeFetch({});
    const result = await resolveViewer({ localViewerUrl: LOCAL_VIEWER, version: undefined, fetcher });

    expect(result.status).toBe("failed");
    if (result.status !== "failed") return;
    expect(result.failure).toEqual({ file: "xs-diff.html", tried: [LOCAL_VIEWER] });
    expect(calls.some((c) => c.includes("jsdelivr"))).toBe(false);
  });

  it("treats a network error like a missing file", async () => {
    const fetcher = async () => {
      throw new TypeError("Failed to fetch");
    };
    const result = await resolveViewer({ localViewerUrl: LOCAL_VIEWER, version: "0.14.28", fetcher });
    expect(result.status).toBe("failed");
  });
});

/**
 * A host that answers every request with the app's index.html and status 200,
 * like an SPA fallback or the XMLUI dev server.
 */
function spaFallbackFetch(real: Record<string, string> = {}) {
  return async (url: string, init?: RequestInit) => {
    if (url in real) {
      return new Response(init?.method === "HEAD" ? null : real[url], { status: 200 });
    }
    return new Response(init?.method === "HEAD" ? null : "<!doctype html><div id=root></div>", {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  };
}

describe("SPA fallback hosts", () => {
  it("resolveViewer does not mistake the app's index.html for the viewer", async () => {
    const result = await resolveViewer({
      localViewerUrl: LOCAL_VIEWER,
      version: undefined,
      fetcher: spaFallbackFetch(),
    });
    expect(result.status).toBe("failed");
    if (result.status !== "failed") return;
    expect(result.failure.file).toBe("xs-diff.html");
  });

  it("resolveViewer does not mistake the app's index.html for the parser", async () => {
    const result = await resolveViewer({
      localViewerUrl: LOCAL_VIEWER,
      version: undefined,
      fetcher: spaFallbackFetch({ [LOCAL_VIEWER]: VIEWER_HTML }),
    });
    expect(result.status).toBe("failed");
    if (result.status !== "failed") return;
    expect(result.failure.file).toBe("xmlui-parser.es.js");
  });

  it("checkLocalViewer reports the viewer as missing", async () => {
    expect(await checkLocalViewer(LOCAL_VIEWER, spaFallbackFetch())).toEqual({
      file: "xs-diff.html",
      tried: [LOCAL_VIEWER],
    });
  });
});

describe("checkLocalViewer", () => {
  it("passes when both local files exist, asking only the app's own origin", async () => {
    const { fetcher, calls } = fakeFetch({ [LOCAL_VIEWER]: VIEWER_HTML, [LOCAL_PARSER]: "" });
    expect(await checkLocalViewer(LOCAL_VIEWER, fetcher)).toBeUndefined();
    expect(calls).toEqual([`GET ${LOCAL_VIEWER}`, `HEAD ${LOCAL_PARSER}`]);
  });

  it("names the missing parser", async () => {
    const { fetcher } = fakeFetch({ [LOCAL_VIEWER]: VIEWER_HTML });
    expect(await checkLocalViewer(LOCAL_VIEWER, fetcher)).toEqual({
      file: "xmlui-parser.es.js",
      tried: [LOCAL_PARSER],
    });
  });
});
