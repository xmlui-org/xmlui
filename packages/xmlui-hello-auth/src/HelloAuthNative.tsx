import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RegisterComponentApiFn } from "xmlui";

/* -------------------- PKCE + helpers (TS/DOM safe) -------------------- */
function parseJwt(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch (e) {
    console.warn('Failed to parse ID token', e);
    return null;
  }
}
function b64urlToJson<T = any>(seg: string): T {
  const pad = seg.length % 4 ? 4 - (seg.length % 4) : 0;
  const base64 = seg.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}
function splitJwt(token: string): { header: IdHeader; payload: IdClaims } {
  const [h, p] = token.split(".");
  return { header: b64urlToJson<IdHeader>(h), payload: b64urlToJson<IdClaims>(p) };
}
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
  client_secret?: string;
  redirect_uri?: string;
  scopes?: string;
  storage?: "session" | "local" | string;
  autoLogin?: boolean;
  debug?: boolean;
  proxy_base_url?: string; // e.g. http://localhost:8080/proxy/
  authorize_params?: Record<string, string | undefined>;

  registerComponentApi?: RegisterComponentApiFn;
  updateState?: (state: Record<string, any>) => void;
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
  authorize_params?: Record<string, string | undefined>;
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
  code:
    | "config_missing"
    | "discovery_failed"
    | "redirect_state_mismatch"
    | "token_exchange_failed" // NEW
    | "cors_blocked" // NEW (if proxy still blocks)
    | "unknown";
  message: string;
  details?: any;
};

type IdHeader = { alg: string; kid?: string; typ?: string };
type IdClaims = {
  iss: string;
  aud: string | string[];
  exp: number;
  iat?: number;
  nonce?: string;
  sub: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  picture?: string;
  [k: string]: any;
};
type User = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};
type Tokens = {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  token_type?: string;
  scope?: string;
  expires_in?: number;
};

/* -------------------- component -------------------- */
export const HelloAuth = React.forwardRef<HTMLDivElement, Props>(function HelloAuth(
  {
    issuer,
    client_id,
    client_secret,
    redirect_uri,
    scopes = defaultProps.scopes,
    storage = defaultProps.storage,
    autoLogin = defaultProps.autoLogin,
    debug = defaultProps.debug,
    proxy_base_url,
    authorize_params,
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
  const [tokens, setTokens] = useState<Tokens | undefined>(undefined);
  const [claims, setClaims] = useState<IdClaims | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [expiresAt, setExpiresAt] = useState<number | undefined>(undefined);
  const [autoLoginFired, setAutoLoginFired] = useState(false);

  const storageKey = useMemo(
    () => `xmlui.auth:${issuer || "unknown"}:${client_id || "unknown"}`,
    [issuer, client_id],
  );


  const normalizedAuthorizeParams = useMemo(() => {
    if (!authorize_params) return undefined;
    const normalized: Record<string, string> = {};
    Object.entries(authorize_params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      normalized[key] = typeof value === "string" ? value : String(value);
    });
    return Object.keys(normalized).length ? normalized : undefined;
  }, [authorize_params]);
  const echo: Echo = useMemo(
    () => ({
      issuer,
      client_id,
      client_secret,
      redirect_uri,
      scopes,
      storage,
      autoLogin,
      proxy_base_url,
      authorize_params: normalizedAuthorizeParams,
    }),
    [
      issuer,
      client_id,
      client_secret,
      redirect_uri,
      scopes,
      storage,
      autoLogin,
      proxy_base_url,
      normalizedAuthorizeParams,
    ],
  );
  const providerInitiated = useMemo(() => {
    if (typeof window === "undefined" || !issuer) {
      return { matched: false, params: undefined as Record<string, string> | undefined };
    }
    try {
      const url = new URL(window.location.href);
      const issParam = url.searchParams.get("iss");
      if (issParam && issParam === issuer) {
        const domainHint = url.searchParams.get("domain_hint") || undefined;
        const params: Record<string, string> = {};
        if (domainHint) params.domain_hint = domainHint;
        return { matched: true, params };
      }
    } catch (err) {
      if (debug) console.warn("[HelloAuth] provider init parse error", err);
    }
    return { matched: false, params: undefined as Record<string, string> | undefined };
  }, [issuer, debug]);

  function publish() {
    const snapshot = {
      status,
      echo,
      endpoints,
      error,
      temp,
      tokens,
      claims,
      user,
      expiresAt,
      lastPokeAt,
    };
    if (debug) console.debug("[HelloAuth] publish →", snapshot);
    updateState?.(snapshot);
  }

  // -------------------- Step 0: Hydrate from session storage --------------------
useEffect(() => {
  if (typeof window === 'undefined') return;

  const kv = getKV(storage) as any;
  try {
    const raw = kv.getItem(`${storageKey}:session`);
    if (!raw) return;

    const saved = JSON.parse(raw) as {
      tokens?: Tokens;
      claims?: IdClaims;
      user?: User;
      // some versions used `expiresat`, others `expires_at`
      expiresat?: number;
      expires_at?: number;
    };

    if (debug) {
      console.debug('[HelloAuth] Hydrating from session storage', saved);
    }

    // ======= EXPIRATION CHECK =======
    const expires = (saved as any).expires_at ?? (saved as any).expiresat;
    if (expires) {
      const now = Date.now();
      const bufferMs = 5 * 60 * 1000; // 5 minutes buffer
      if (now + bufferMs >= expires) {
        if (debug) {
          console.warn('[HelloAuth] Session expired or expires soon, clearing storage');
        }
        try {
          kv.removeItem(`${storageKey}:session`);
          kv.removeItem(storageKey);
        } catch {}
        return; // do not restore expired session
      }
    }

    // Restore state (only if token is valid)
    if (saved.tokens) setTokens(saved.tokens);
    if (saved.claims) setClaims(saved.claims);
    if (saved.user) setUser(saved.user);
    if (expires) setExpiresAt(expires);

    setTimeout(() => publish(), 0);
  } catch (err) {
    if (debug) {
      console.warn('[HelloAuth] Failed to hydrate session', err);
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [storageKey, storage]);

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

  // --- Step 4: token exchange (via proxy) ---
  useEffect(() => {
    (async () => {
      if (!temp?.code || !endpoints?.token_endpoint || !client_id || !redirect_uri) return;

      try {
        // Build proxied token URL
        const baseProxy = proxy_base_url?.replace(/\/+$/, "");
        const tokenPath = endpoints.token_endpoint.replace(/^https?:\/\//, "");
        const tokenUrl = baseProxy ? `${baseProxy}/${tokenPath}` : endpoints.token_endpoint;

        const body = new URLSearchParams({
          grant_type: "authorization_code",
          code: temp.code,
          client_id,
          redirect_uri,
          code_verifier: temp.code_verifier || "", // required for PKCE
        });

        if (client_secret) {
          body.append("client_secret", client_secret);
          if (debug) console.warn("[HelloAuth] ⚠️ Using client_secret (INSECURE for production!)");
        }

        if (debug) {
          console.debug("[HelloAuth] token POST →", tokenUrl);
          console.debug("[HelloAuth] token body →", Object.fromEntries(body.entries()));
        }

        const res = await fetch(tokenUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} ${res.statusText} :: ${text}`);
        }

        const json = (await res.json()) as Tokens;
        setTokens(json);
        // Decode id_token payload (no verification)
        if (json.id_token) {
          const decoded = parseJwt(json.id_token);
          if (decoded) {
            setUser({
              sub: decoded.sub,
              email: decoded.email,
              name: decoded.name,
              picture: decoded.picture,
            });
          }
        }

        setError(undefined);

        if (debug) console.debug("[HelloAuth] token ✓", json);

        // optional: clear the PKCE stash now that we've used it
        const kv = getKV(storage as any);
        try {
          kv.removeItem(storageKey);
        } catch {}
        setTimeout(publish, 0);
      } catch (err: any) {
        const msg = String(err?.message || err);
        const shaped: ErrorShape = {
          code: msg.includes("CORS") ? "cors_blocked" : "token_exchange_failed",
          message: "Failed to exchange authorization code for tokens",
          details: msg,
        };
        if (debug) console.warn("[HelloAuth] token ✗", shaped);
        setTokens(undefined);
        setError(shaped);
        setTimeout(publish, 0);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temp?.code, endpoints?.token_endpoint, client_id, client_secret, redirect_uri, proxy_base_url]);

  // --- Step 5: verify id_token & hydrate user/session ---
  useEffect(() => {
    (async () => {
      if (!tokens?.id_token) return;

      try {
        // Parse header/payload (no signature verification in this step)
        const { header, payload } = splitJwt(tokens.id_token);
        if (debug) {
          console.debug("[HelloAuth] id_token header/payload", header, payload);
          console.info("[HelloAuth] login claims", {
            sub: payload.sub,
            email: payload.email,
            iss: payload.iss,
          });
        }

        // Basic claim checks
        if (endpoints?.issuer && payload.iss !== endpoints.issuer) {
          throw new Error(`iss mismatch: ${payload.iss} !== ${endpoints.issuer}`);
        }
        if (client_id) {
          const audOk = Array.isArray(payload.aud)
            ? payload.aud.includes(client_id)
            : payload.aud === client_id;
          if (!audOk) throw new Error(`aud mismatch`);
        }
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp <= now) {
          throw new Error(`id_token expired: exp=${payload.exp}, now=${now}`);
        }
        if (temp?.nonce && payload.nonce && payload.nonce !== temp.nonce) {
          throw new Error(`nonce mismatch`);
        }

        // Derive user + expiry
        const derivedUser: User = {
          sub: payload.sub,
          email: payload.email,
          name:
            payload.name ||
            payload.preferred_username ||
            [payload.given_name, payload.family_name].filter(Boolean).join(" ") ||
            undefined,
          picture: payload.picture,
        };
        const ea =
          typeof tokens.expires_in === "number"
            ? Date.now() + tokens.expires_in * 1000
            : payload.exp
              ? payload.exp * 1000
              : undefined;

        setClaims(payload);
        setUser(derivedUser);
        setExpiresAt(ea);
        setError(undefined);

        // Persist a minimal session bundle
        const kv = getKV(storage as any);
        try {
          kv.setItem(
            `${storageKey}:session`,
            JSON.stringify({ tokens, claims: payload, user: derivedUser, expires_at: ea }),
          );
        } catch {}

        setTimeout(publish, 0);
      } catch (err: any) {
        const shaped: ErrorShape = {
          code: "unknown",
          message: "ID token claim verification failed",
          details: String(err?.message || err),
        };
        if (debug) console.warn("[HelloAuth] verify ✗", shaped);
        setError(shaped);
        setClaims(undefined);
        setUser(undefined);
        setExpiresAt(undefined);
        setTimeout(publish, 0);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens?.id_token, endpoints?.issuer, client_id, temp?.nonce, storageKey, storage, debug]);

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

  const login = useCallback(
    async (extraParams?: Record<string, string | undefined>) => {
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
      const stash = {
        code_verifier: verifier,
        state: stateStr,
        nonce: nonceStr,
        redirect_uri,
        client_id,
      };
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

      const mergedParams: Record<string, string | undefined> = {
        ...(normalizedAuthorizeParams || {}),
        ...(extraParams || {}),
      };
      Object.entries(mergedParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.set(key, value);
        }
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

      window.location.assign(authUrl);
    },
    [
      endpoints?.authorization_endpoint,
      client_id,
      redirect_uri,
      scopes,
      storage,
      storageKey,
      debug,
      normalizedAuthorizeParams,
    ],
  );

  const logout = useCallback(async () => {
    if (debug) console.debug("[HelloAuth] logout()");

    setTokens(undefined);
    setClaims(undefined);
    setUser(undefined);
    setExpiresAt(undefined);
    setError(undefined);
    setTemp(undefined);

    const kv = getKV(storage as any);
    try {
      kv.removeItem(storageKey);
      kv.removeItem(`${storageKey}:session`);
    } catch {}

    if (endpoints?.end_session_endpoint && tokens?.id_token) {
      const url = new URL(endpoints.end_session_endpoint);
      const params = new URLSearchParams({
        id_token_hint: tokens.id_token,
        post_logout_redirect_uri: redirect_uri || window.location.origin,
      });
      url.search = params.toString();
      const logoutUrl = url.toString();

      if (debug) console.debug("[HelloAuth] logout redirect →", logoutUrl);
      window.location.assign(logoutUrl);
    } else {
      setTimeout(publish, 0);
    }
  }, [debug, storage, storageKey, endpoints?.end_session_endpoint, tokens?.id_token, redirect_uri]);

  /* -------------------- APIs: poke() and login() -------------------- */
  useEffect(() => {
    const poke = () => {
      const ts = new Date().toISOString();
      if (debug) console.debug("[HelloAuth] poke()", ts);
      setLastPokeAt(ts);
      setTimeout(publish, 0);
    };

    registerComponentApi?.({ poke, login, logout });
  }, [registerComponentApi, login, logout, debug]);

  useEffect(() => {
    if (autoLoginFired) return;
    const shouldAutoLogin = autoLogin || providerInitiated.matched;
    if (!shouldAutoLogin) return;
    if (!endpoints?.authorization_endpoint || !client_id || !redirect_uri) return;
    login(providerInitiated.params);
    setAutoLoginFired(true);
  }, [
    autoLogin,
    providerInitiated.matched,
    providerInitiated.params,
    autoLoginFired,
    endpoints?.authorization_endpoint,
    client_id,
    redirect_uri,
    login,
  ]);

  /* -------------------- headless -------------------- */
  return null;
});