// src/HelloAuthNative.tsx
import React, { useEffect, useState } from "react";
import type { RegisterComponentApiFn, UpdateStateFn } from "xmlui";

type Props = {
  id?: string;
  issuer?: string;
  client_id?: string;
  redirect_uri?: string;
  scopes?: string;
  storage?: "session" | "local" | string;
  autoLogin?: boolean;
  debug?: boolean;
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
};

export const HelloAuth = React.forwardRef<HTMLDivElement, Props>(
  function HelloAuth(
    {
      issuer,
      client_id,
      redirect_uri,
      scopes = defaultProps.scopes,
      storage = defaultProps.storage,
      autoLogin = defaultProps.autoLogin,
      debug = defaultProps.debug,
      registerComponentApi,
      updateState,
    },
    _ref
  ) {
    const [status] = useState<"idle">("idle");
    const [lastPokeAt, setLastPokeAt] = useState<string | undefined>(undefined);

    const echo: Echo = { issuer, client_id, redirect_uri, scopes, storage, autoLogin };

    useEffect(() => {
      if (debug) console.debug("[HelloAuth] publish state", { status, echo, lastPokeAt });
      updateState?.({ status, echo, lastPokeAt });
    }, [issuer, client_id, redirect_uri, scopes, storage, autoLogin, lastPokeAt, debug, updateState, status]);

    useEffect(() => {
      const poke = () => {
        const ts = new Date().toISOString();
        if (debug) console.debug("[HelloAuth] poke()", ts);
        setLastPokeAt(ts);
      };
      registerComponentApi?.({ poke });
    }, [registerComponentApi, debug]);

    return null; // headless
  }
);
