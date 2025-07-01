import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata, d } from "../metadata-helpers";
import { AppState, defaultProps } from "./AppStateNative";

const COMP = "AppState";

export const AppStateMd = createMetadata({
  description:
    "`AppState` is an invisible component that provides global state management " +
    "across your entire application. Unlike component variables that are scoped " +
    "locally, AppState allows any component to access and update shared state " +
    "without prop drilling.",
  props: {
    bucket: {
      description:
        `This property is the identifier of the bucket to which the \`${COMP}\` instance is bound. ` +
        `Multiple \`${COMP}\` instances with the same bucket will share the same state object: any ` +
        `of them updating the state will cause the other instances to view the new, updated state.`,
      valueType: "string",
      defaultValue: defaultProps.bucket,
    },
    initialValue: {
      description:
        `This property contains the initial state value. Though you can use multiple \`${COMP}\`` +
        `component instances for the same bucket with their \`initialValue\` set, it may result ` +
        `in faulty app logic. When xmlui instantiates an \`${COMP}\` with an explicit initial ` +
        `value, that value is immediately set. Multiple initial values may result in ` +
        `undesired initialization. By default, the bucked's initial state is undefined.`,
    },
  },
  apis: {
    update: d(
      "This method updates the application state object bound to the `AppState` instance. The " +
        "function's single argument is an object that specifies the new state value.",
    ),
  },
  nonVisual: true,
});

export const appStateComponentRenderer = createComponentRenderer(
  COMP,
  AppStateMd,
  ({ node, extractValue, updateState, registerComponentApi }) => {
    return (
      <AppState
        bucket={extractValue(node.props.bucket)}
        initialValue={extractValue(node.props.initialValue)}
        updateState={updateState}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
