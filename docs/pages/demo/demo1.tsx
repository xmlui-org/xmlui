import { DemoPlayground } from "@/src/components/DemoPlayground";

export default () => {
  return (
    <div>
      <DemoPlayground
        components={[]}
        name="Example: Hello, World!"
        app={`
    <App>
      Hello, World from XMLUI!
    </App>
  `}
        //previewOnly={false}
      />
    </div>
  );
};
