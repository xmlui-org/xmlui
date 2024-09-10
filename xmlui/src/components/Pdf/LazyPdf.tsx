import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { createComponentRenderer } from "@components-core/renderers";
import React, { Suspense } from "react";
import { desc } from "@components-core/descriptorHelper";

const Pdf = React.lazy(() => import("./Pdf"));

// =====================================================================================================================
// React LazyPdf component implementation

interface Props {
  src: string;
}

const LazyPdf = (props: Props) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Pdf {...props} />
    </Suspense>
  );
};

// =====================================================================================================================
// XMLUI Pdf component definition

/** 
 * The \`Pdf\` component provides a read-only preview of a pdf document's contents.
 * @descriptionRef Pdf.mdx
 */
export interface PdfComponentDef extends ComponentDef<"Pdf"> {
  props: {
    /** 
     * This property defines the source URL of the pdf document stream to display.
     * @descriptionRef Pdf.mdx?src
     */
    src: string;
  };
}

export const PdfMd: ComponentDescriptor<PdfComponentDef> = {
  displayName: "PDF Preview",
  description: "Displays a PDF document preview",
  props: {
    src: desc("Specifies the path to the pdf"),
  },
};

export const pdfComponentRenderer = createComponentRenderer<PdfComponentDef>(
  "Pdf",
  ({ node, extractValue }) => {
    return <LazyPdf src={extractValue(node.props.src)} />;
  },
  PdfMd
);
