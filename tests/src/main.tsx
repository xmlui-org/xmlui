import ReactDOM from "react-dom/client";
import TestBed from "./TestBed";
import StandaloneExtensionManager from "../../xmlui/src/components-core/StandaloneExtensionManager";

const extensionManager = new StandaloneExtensionManager();

extensionManager.registerExtension({
  namespace: "TEST_NS",
  components: [
    {
      type: "TestComponent",
      renderer: ({renderChild, node})=>{
        return <div>{renderChild(node.children)}</div>
      },
    }
  ]
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <TestBed extensionManager={extensionManager}/>
);
