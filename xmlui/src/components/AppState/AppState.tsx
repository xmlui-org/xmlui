import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata, d } from "../metadata-helpers";
import { AppState, defaultProps } from "./AppStateNative";

const COMP = "AppState";

export const AppStateMd = createMetadata({
  status: "stable",
  description:
    "`AppState` is an invisible component that provides global state management " +
    "across your entire application. Unlike component variables that are scoped " +
    "locally, AppState allows any component to access and update shared state " +
    "without prop drilling.",
  deprecationMessage:
    "The AppState component is deprecated. We will remove it in a future release. " +
    "Please use [global variables](/docs/guides/markup#global-variables) instead.",
  events: {
    didUpdate: {
      description:
        "This event is fired when the AppState value is updated. The event provides " +
        "the new state value as its parameter.",
      signature: "(updateInfo: { bucket: string; value: any; previousValue: any }) => void",
      parameters: {
        updateInfo: "An object containing the bucket name, the new state value, and the previous value.",
      },
    },
  },
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
        `value, that value is immediately merged with the existing state. ` +
        `The issue may come from the behavior that \`initialValue\` is set (merged) only when a component mounts. ` +
        `By default, the bucket's initial state is undefined.`,
    },
  },
  apis: {
    update: {
      signature: "update(newState: Record<string, any>)",
      description:
        "This method updates the application state object bound to the `AppState` instance.",
      parameters: {
        newState: "An object that specifies the new state value.",
      },
    },
    appendToList: {
      signature: "appendToList(key: string, id: any)",
      description:
        "This method appends an item to an array in the application state object bound to the" +
        " `AppState` instance.",
      parameters: {
        key: "The key of the array in the state object.",
        id: "The item to append to the array.",
      },
    },
    removeFromList: {
      signature: "removeFromList(key: string, id: any)",
      description:
        "This method removes an item from an array in the application state object bound to the" +
        " `AppState` instance.",
      parameters: {
        key: "The key of the array in the state object.",
        id: "The item to remove from the array.",
      },
    },
    listIncludes: {
      signature: "listIncludes(key: string, id: any)",
      description:
        "This method checks if an array in the application state object contains a specific item.",
      parameters: {
        key: "The key of the array in the state object.",
        id: "The item to check for in the array.",
      },
    },
  },
  nonVisual: true,
});

export const appStateComponentRenderer = createComponentRenderer(
  COMP,
  AppStateMd,
  ({ node, extractValue, updateState, registerComponentApi, lookupEventHandler }) => {
    return (
      <AppState
        bucket={extractValue(node.props.bucket)}
        initialValue={extractValue(node.props.initialValue)}
        updateState={updateState}
        registerComponentApi={registerComponentApi}
        onDidUpdate={lookupEventHandler("didUpdate")}
      />
    );
  },
);
