import React, { useEffect, useMemo, useRef, useState } from "react";
import type { RegisterComponentApiFn, UpdateStateFn } from "xmlui";

// --- PKCE + helpers (TS/DOM safe) ---
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  // Ensure we pass a true ArrayBuffer slice (not SharedArrayBuffer / ArrayBufferLike)
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function sha256Array(bytes: Uint8Array): Promise<Uint8Array> {
  const ab = toArrayBuffer(bytes);
  const digest = await crypto.subtle.digest("SHA-256", ab);
  return new Uint8Array(digest);
}

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function textToBytes(t: string): Uint8Array {
  return new TextEncoder().encode(t);
}

function randomString(nBytes = 32): string {
  const arr = new Uint8Array(nBytes);
  crypto.getRandomValues(arr);
  return base64url(arr);
}

async function makePkce(): Promise<{ verifier: string; challenge: string }> {
  const verifier = randomString(32);
  const hashBytes = await sha256Array(textToBytes(verifier));
  const challenge = base64url(hashBytes);
  return { verifier, challenge };
}

// --- storage selector ---
function getKV(storage: "session" | "local" | string | undefined) {
  return storage === "local" ? window.localStorage : window.sessionStorage;
}

type Props = {
  id?: string;
  issuer?: string;
  client_id?: string;
  redirect_uri?: string;
  scopes?: string;
  storage?: "session" | "local" | string;
  autoLogin?: boolean;
  debug?: boolean;
  proxy_base_url?: string; // e.g. http://localhost:8080/proxy/

  registerComponentApi?: RegisterComponentApiFn;
  updateState?: UpdateStateFn;
};

export const defaultProps = {
  scopes: "openid email profile",
  storage: "session" as const,
  autoLogin: false,
  debug: true,
};

type Echo = {
  issuer?: string;
  client_id?: string;
  redirect_uri?: string;
  scopes?: string;
  storage?: string;
  autoLogin?: boolean;
  proxy_base_url?: string;
};

type Temp = {
  state?: string;
  nonce?: string;
  code_verifier?: string;
  code?: string; // add this
};

type Endpoints = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  userinfo_endpoint?: string;
  end_session_endpoint?: string;
};

type ErrorShape = {
  code:
    | "config_missing"
    | "discovery_failed"
    | "redirect_state_mismatch" // NEW
    | "unknown";
  message: string;
  details?: any;
};

export const HelloAuth = React.forwardRef<HTMLDivElement, Props>(function HelloAuth(
  {
    issuer,
    client_id,
    redirect_uri,
    scopes = defaultProps.scopes,
    storage = defaultProps.storage,
    autoLogin = defaultProps.autoLogin,
    debug = defaultProps.debug,
    proxy_base_url,
    registerComponentApi,
    updateState,
  },
  _ref,
) {
  const [status] = useState<"idle">("idle");
  const [lastPokeAt, setLastPokeAt] = useState<string | undefined>(undefined);
  const [endpoints, setEndpoints] = useState<Endpoints | undefined>(undefined);
  const [error, setError] = useState<ErrorShape | undefined>(undefined);
  const [temp, setTemp] = useState<Temp | undefined>(undefined);

  const storageKey = useMemo(
    () => `xmlui.auth:${issuer || "unknown"}:${client_id || "unknown"}`,
    [issuer, client_id],
  );

  const echo: Echo = useMemo(
    () => ({ issuer, client_id, redirect_uri, scopes, storage, autoLogin, proxy_base_url }),
    [issuer, client_id, redirect_uri, scopes, storage, autoLogin, proxy_base_url],
  );

  function publish() {
    updateState?.({
      status,
      echo,
      endpoints,
      error,
      temp, // ensure this is here
      lastPokeAt,
    });
  }

  // --- Step 3: callback handling (read ?code & validate state) ---
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const sp = url.searchParams;
      const code = sp.get("code");
      const returnedState = sp.get("state");

      if (!code) return; // nothing to do

      const kv = getKV(storage as any);
      const raw = kv.getItem(storageKey);
      const stash = raw
        ? (JSON.parse(raw) as { state?: string; nonce?: string; code_verifier?: string })
        : undefined;

      if (!stash || !stash.state || returnedState !== stash.state) {
        if (debug) console.warn("[HelloAuth] callback: state mismatch or missing stash");
        setError({
          code: "redirect_state_mismatch",
          message: "State returned by the provider does not match the stored state.",
          details: { returnedState, expectedState: stash?.state },
        });
        setTemp(undefined);
        // Clean URL (remove code/state) to avoid loops
        url.search = "";
        window.history.replaceState({}, document.title, url.toString());
        publish();
        return;
      }

      // OK: reflect the code and stash bits in temp state
      setError(undefined);
      setTemp({
        code_verifier: stash.code_verifier,
        state: stash.state,
        nonce: stash.nonce,
        code, // now typed
      });

      if (debug) console.debug("[HelloAuth] callback ✓ code captured");
      // Clean URL (remove code/state) so refreshes are safe
      url.search = "";
      window.history.replaceState({}, document.title, url.toString());
      publish();
    } catch (e) {
      if (debug) console.warn("[HelloAuth] callback error", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, storage, debug]);

  // --- Step 1: OIDC discovery (proxy-aware) ---
  const discoveryAbort = useRef<AbortController | null>(null);
  useEffect(() => {
    setEndpoints(undefined);
    setError(undefined);
    if (!issuer) {
      publish();
      return;
    }

    const baseIssuer = issuer.replace(/\/+$/, "");
    const wellKnown = `${baseIssuer}/.well-known/openid-configuration`;

    const baseProxy = proxy_base_url?.replace(/\/+$/, "") || undefined;
    const proxiedPath = wellKnown.replace(/^https?:\/\//, ""); // <-- strip scheme
    const fetchUrl = baseProxy ? `${baseProxy}/${proxiedPath}` : wellKnown;

    discoveryAbort.current?.abort();
    discoveryAbort.current = new AbortController();

    (async () => {
      try {
        if (debug) console.debug("[HelloAuth] discovery →", fetchUrl);
        const res = await fetch(fetchUrl, { signal: discoveryAbort.current!.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const e: Endpoints = {
          issuer: json.issuer,
          authorization_endpoint: json.authorization_endpoint,
          token_endpoint: json.token_endpoint,
          jwks_uri: json.jwks_uri,
          userinfo_endpoint: json.userinfo_endpoint,
          end_session_endpoint: json.end_session_endpoint || json.end_session_endpoint_url,
        };

        if (debug) console.debug("[HelloAuth] discovery ✓", e);
        setEndpoints(e);
        setError(undefined);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        const shaped: ErrorShape = {
          code: "discovery_failed",
          message: "Failed to load OIDC discovery document",
          details: String(err?.message || err),
        };
        if (debug) console.warn("[HelloAuth] discovery ✗", shaped);
        setEndpoints(undefined);
        setError(shaped);
      } finally {
        publish();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issuer, proxy_base_url]);

  // Expose a tiny API: poke()
  useEffect(() => {
    const poke = () => {
      const ts = new Date().toISOString();
      if (debug) console.debug("[HelloAuth] poke()", ts);
      setLastPokeAt(ts);
    };
    registerComponentApi?.({ poke });
  }, [registerComponentApi, debug]);

  // Publish whenever state changes
  useEffect(() => {
    publish();
  }, [echo, lastPokeAt, endpoints, error, temp]); // eslint-disable-line react-hooks/exhaustive-deps

  return null; // headless
});
