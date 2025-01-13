# Helper Components

The following React components contribute to the rendering engine's job:

- `ApiBoundComponent`: This component handles special components used as event handlers. You can declare an event handler not only as script code (string) but also as one of these components: `FileUpload`, `FileDownload`, and - `APICall`. `ApiBoundComponent` turns them into script code.
- `AppContext`: Stores the object that holds the global functions and properties of xmlui. It provides a `useAppContext` hook that xmlui components can use to access the global functions and properties.
- `ComponentDecorator`: This component decorates the DOM element of a component with a set of attributes. We use this feature to assign helper attributes to the app's xmlui component nodes for testing, debugging, and other development-related purposes.
- `ErrorBoundary`: This component is an error boundary, catching errors within the nested components. `ErrorBoundary uses a React class component rather than a React function.
- `InspectorProvider`: We allow inspection of the xmlui components of an app (as a fundamental feature of debugging and development tooling). This component wraps each rendered xmlui component with a context that allows access to run time information and inspection functionality.
- `InvalidComponent`: This component displays run time errors found while the rendering engine runs. If it finds an issue that hinders regular operation, it renders this component instead of the faulty one.
- `LoaderComponent`: While running an app, some information (such as fetching data from the backend) requires an async "loading" operation. This component manages the life cycle of information loading and provides an API to query and manage the operation's status.
- `RestApiProxy`: This object provides operations to manage the life cycle of a REST-like backend call, including the entire request-response scenario.
- `ScrollContext`: Allows storing context information for components that support scrolling.
- `TableOfContentsContext`: Several components work together to represent the hierarchy of a particular app page as a TOC. This React component provides a context for storing this hierarchy information. The `useTableOfContents` hook allows access to this context.
- `UnknownComponent`: When the rendering engine finds an unknown (unregistered) component in the markup, it renders this component and names the unregistered.
