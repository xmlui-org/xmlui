import React, { useEffect, useMemo, useRef, useState } from "react";
import type { RegisterComponentApiFn, UpdateStateFn } from "xmlui";

/* -------------------- PKCE + helpers (TS/DOM safe) -------------------- */
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
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
/* -------------------- storage selector -------------------- */
function getKV(storage: "session" | "local" | string | undefined) {
  return storage === "local" ? window.localStorage : window.sessionStorage;
}

/* -------------------- types -------------------- */
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
  code?: string;
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
  code: "config_missing" | "discovery_failed" | "redirect_state_mismatch" | "unknown";
  message: string;
  details?: any;
};

/* -------------------- component -------------------- */
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
  _ref
) {
  const [status] = useState<"idle">("idle");
  const [lastPokeAt, setLastPokeAt] = useState<string | undefined>(undefined);
  const [endpoints, setEndpoints] = useState<Endpoints | undefined>(undefined);
  const [error, setError] = useState<ErrorShape | undefined>(undefined);
  const [temp, setTemp] = useState<Temp | undefined>(undefined);

  const storageKey = useMemo(
    () => `xmlui.auth:${issuer || "unknown"}:${client_id || "unknown"}`,
    [issuer, client_id]
  );
  const echo: Echo = useMemo(
    () => ({ issuer, client_id, redirect_uri, scopes, storage, autoLogin, proxy_base_url }),
    [issuer, client_id, redirect_uri, scopes, storage, autoLogin, proxy_base_url]
  );

  function publish() {
    const snapshot = { status, echo, endpoints, error, temp, lastPokeAt };
    if (debug) console.debug("[HelloAuth] publish →", snapshot);
    updateState?.(snapshot);
  }

  /* -------------------- Step 3: callback handling -------------------- */
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const sp = url.searchParams;
      const code = sp.get("code");
      const returnedState = sp.get("state");
      if (!code) return;

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
        // clean URL
        url.search = "";
        window.history.replaceState({}, document.title, url.toString());
        setTimeout(publish, 0);
        return;
      }

      setError(undefined);
      setTemp({
        code_verifier: stash.code_verifier,
        state: stash.state,
        nonce: stash.nonce,
        code,
      });
      if (debug) console.debug("[HelloAuth] callback ✓ code captured");

      // clean URL so refreshes are safe
      url.search = "";
      window.history.replaceState({}, document.title, url.toString());
      setTimeout(publish, 0);
    } catch (e) {
      if (debug) console.warn("[HelloAuth] callback error", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, storage, debug]);

  /* -------------------- Step 1: discovery (proxy-aware) -------------------- */
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
    const proxiedPath = wellKnown.replace(/^https?:\/\//, "");
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
        setTimeout(publish, 0);
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
        setTimeout(publish, 0);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issuer, proxy_base_url]);

  /* -------------------- APIs: poke() and login() -------------------- */
  useEffect(() => {
    const poke = () => {
      const ts = new Date().toISOString();
      if (debug) console.debug("[HelloAuth] poke()", ts);
      setLastPokeAt(ts);
      setTimeout(publish, 0);
    };

    const login = async () => {
      if (!endpoints?.authorization_endpoint || !client_id || !redirect_uri) {
        if (debug) console.warn("[HelloAuth] login(): missing config");
        setError({
          code: "config_missing",
          message: "issuer/client_id/redirect_uri or endpoints are missing",
        });
        setTimeout(publish, 0);
        return;
      }
      if (!window.crypto?.subtle) {
        setError({ code: "unknown", message: "Web Crypto not available" });
        setTimeout(publish, 0);
        return;
      }

      const { verifier, challenge } = await makePkce();
      const stateStr = randomString(16);
      const nonceStr = randomString(16);

      const kv = getKV(storage as any);
      const stash = { code_verifier: verifier, state: stateStr, nonce: nonceStr, redirect_uri, client_id };
      kv.setItem(storageKey, JSON.stringify(stash));

      const url = new URL(endpoints.authorization_endpoint);
      const params = new URLSearchParams({
        response_type: "code",
        client_id,
        redirect_uri,
        scope: scopes || "openid",
        state: stateStr,
        nonce: nonceStr,
        code_challenge: challenge,
        code_challenge_method: "S256",
      });
      url.search = params.toString();
      const authUrl = url.toString();

      if (debug) console.debug("[HelloAuth] built authorize URL:", authUrl);

      setTemp({
        code_verifier: verifier,
        state: stateStr,
        nonce: nonceStr,
      });
      setTimeout(publish, 0);

      // enable redirect (comment this line out if you want to inspect URL without navigating)
      window.location.assign(authUrl);
    };

    registerComponentApi?.({ poke, login });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerComponentApi, endpoints, client_id, redirect_uri, scopes, storage, storageKey, debug]);

  /* -------------------- headless -------------------- */
  return null;
});
