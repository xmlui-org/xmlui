import { createComponentRenderer, createMetadata } from "xmlui";
import { HelloAuth, defaultProps } from "./HelloAuthNative";

const HelloAuthMd = createMetadata({
  description: "`HelloAuth` is a headless auth service (no UI).",
  status: "experimental",
  props: {
    issuer: { description: "OIDC issuer.", type: "string", isRequired: false },
    client_id: { description: "OIDC client id.", type: "string", isRequired: false },
    client_secret: {
      description: "OAuth client secret (INSECURE for browser apps!).",
      type: "string",
      isRequired: false,
    },
    redirect_uri: { description: "Redirect URI.", type: "string", isRequired: false },
    scopes: {
      description: "Scopes (space-separated).",
      type: "string",
      isRequired: false,
      defaultValue: defaultProps.scopes,
    },
    storage: {
      description: "session | local",
      type: "string",
      isRequired: false,
      defaultValue: defaultProps.storage,
    },
    autoLogin: {
      description: "Attempt start on mount.",
      type: "boolean",
      isRequired: false,
      defaultValue: defaultProps.autoLogin,
    },
    debug: {
      description: "Console debug.",
      type: "boolean",
      isRequired: false,
      defaultValue: defaultProps.debug,
    },
    proxy_base_url: {
      description:
        "Optional proxy base, e.g. 'http://localhost:8080/proxy/'. If present, discovery and (later) token calls go through it.",
      type: "string",
      isRequired: false,
    },
    authorize_params: {
      description:
        "Optional object of extra query params to append to the /authorize redirect (e.g. { domain_hint: 'nsoftware.com' }).",
      type: "object",
      isRequired: false,
    },
    id: { description: "Component id.", type: "string", isRequired: false },
  },
  events: {},
  apis: {
    poke:  { description: "Update lastPokeAt in state.", type: "function" },
    login: { description: "Start OIDC Authorization Code + PKCE redirect.", type: "function" },
    logout: { description: "Clear auth state and optionally redirect to end session endpoint.", type: "function" },
  },
});

export const helloAuthComponentRenderer = createComponentRenderer(
  "HelloAuth",
  HelloAuthMd,
  ({ node, extractValue, registerComponentApi, updateState }) => {
    const props = node.props as any;
    const authorizeParamsValue = extractValue(props?.authorize_params);
    const authorizeParams =
      authorizeParamsValue && typeof authorizeParamsValue === "object" && !Array.isArray(authorizeParamsValue)
        ? (authorizeParamsValue as Record<string, string | undefined>)
        : undefined;

    return (
      <HelloAuth
        id={extractValue.asOptionalString(props?.id)}
        issuer={extractValue.asOptionalString(props?.issuer)}
        client_id={extractValue.asOptionalString(props?.client_id)}
        client_secret={extractValue.asOptionalString(props?.client_secret)}
        redirect_uri={extractValue.asOptionalString(props?.redirect_uri)}
        scopes={extractValue.asOptionalString(props?.scopes)}
        storage={extractValue.asOptionalString(props?.storage)}
        autoLogin={extractValue.asOptionalBoolean(props?.autoLogin)}
        debug={extractValue.asOptionalBoolean(props?.debug)}
        proxy_base_url={extractValue.asOptionalString(props?.proxy_base_url)}
        authorize_params={authorizeParams}
        registerComponentApi={registerComponentApi}
        updateState={updateState}
      />
    );
  }
);