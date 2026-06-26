import { createMetadata } from "../../component-core/metadata/helpers";

export const IncludeMarkupMd = createMetadata({
  status: "experimental",
  nonVisual: true,
  description:
    "`IncludeMarkup` fetches XMLUI markup from a URL and renders it in place.",
  props: {
    url: {
      description: "The URL of the XMLUI markup to fetch and include.",
      valueType: "string",
    },
    loadingContent: {
      description: "Template rendered while the markup request is in progress.",
      valueType: "ComponentDef",
    },
    testId: {
      description: "Test identifier accepted for compatibility; the component renders no wrapper.",
      valueType: "string",
    },
  },
  events: {
    didLoad: {
      description: "This event fires after the markup has been fetched and rendered.",
      signature: "didLoad(): void",
    },
    didFail: {
      description: "This event fires when loading or parsing the markup fails.",
      signature: "didFail(error: string): void",
    },
  },
});
