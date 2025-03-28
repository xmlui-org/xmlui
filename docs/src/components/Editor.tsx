import dynamic from "next/dynamic";
import { WrapperConfig, MonacoEditorLanguageClientWrapper } from "monaco-editor-wrapper";

const MonacoEditorReactComp = dynamic(
  () => import("@typefox/monaco-editor-react").then((mod) => mod.MonacoEditorReactComp),
  { ssr: false }, // This ensures the component only renders on client-side
);
const wrapperConfig: WrapperConfig = {
  $type: "classic",
  editorAppConfig: {
    codeResources: {
      modified: {
        text: `<Button>xmlui - language server demo</Button>`,
        uri: "/workspace/Main.xmlui",
        enforceLanguageId: "xmlui",
      },
    },
  },
};

export const Editor = () => {
  return (
    <MonacoEditorReactComp
      wrapperConfig={wrapperConfig}
      // onLoad={(wrapper: MonacoEditorLanguageClientWrapper) => {
      // use the wrapper to get access to monaco-editor or the languageclient
      // wrapper.initAndStart(wrapperConfig);
      // }}
    />
  );
};
