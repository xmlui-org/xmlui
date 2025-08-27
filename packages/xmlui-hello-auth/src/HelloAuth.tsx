import { createComponentRenderer, createMetadata } from "xmlui";
import { HelloAuth, defaultProps } from "./HelloAuthNative";

const HelloAuthMd = createMetadata({
  description: "`HelloAuth` is a headless auth service (no UI).",
  status: "experimental",
  props: {
    issuer: { description: "OIDC issuer.", type: "string", isRequired: false },
    client_id: { description: "OIDC client id.", type: "string", isRequired: false },
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
  ({ node, extractValue, registerComponentApi, updateState }) => (
    <HelloAuth
      id={extractValue.asOptionalString(node.props?.id)}
      issuer={extractValue.asOptionalString(node.props?.issuer)}
      client_id={extractValue.asOptionalString(node.props?.client_id)}
      redirect_uri={extractValue.asOptionalString(node.props?.redirect_uri)}
      scopes={extractValue.asOptionalString(node.props?.scopes)}
      storage={extractValue.asOptionalString(node.props?.storage)}
      autoLogin={extractValue.asOptionalBoolean(node.props?.autoLogin)}
      debug={extractValue.asOptionalBoolean(node.props?.debug)}
      proxy_base_url={extractValue.asOptionalString(node.props?.proxy_base_url)}
      registerComponentApi={registerComponentApi}
      updateState={updateState}
    />
  )
);
