import { xmluiBuilderFrameComponentRenderer } from "./XmluiBuilderFrame/XmluiBuilderFrame";
import { aiMessagePartsComponentRenderer } from "./AiMessageParts/AiMessageParts";
import { aiToolCallComponentRenderer } from "./AiToolCall/AiToolCall";
import { aiApprovalRequestComponentRenderer } from "./AiApprovalRequest/AiApprovalRequest";
import { aiThreadComponentRenderer } from "./AiThread/AiThread";
import { codeViewRenderer } from "./CodeView/CodeView";
import { xmluiPreviewRenderer } from "./AppPreview/AppPreview";

const aiBlocksExtension = {
  namespace: "XMLUIExtensions",
  themeNamespacePrefix: "AiBlocks",
  components: [
    aiThreadComponentRenderer,
    aiMessagePartsComponentRenderer,
    aiToolCallComponentRenderer,
    aiApprovalRequestComponentRenderer,
    xmluiBuilderFrameComponentRenderer,
    codeViewRenderer,
    xmluiPreviewRenderer,
  ],
};

export default aiBlocksExtension;

export { aiMessagePartsComponentRenderer } from "./AiMessageParts/AiMessageParts";
export { aiToolCallComponentRenderer } from "./AiToolCall/AiToolCall";
export { aiApprovalRequestComponentRenderer } from "./AiApprovalRequest/AiApprovalRequest";
export { aiThreadComponentRenderer } from "./AiThread/AiThread";
export { xmluiBuilderFrameComponentRenderer } from "./XmluiBuilderFrame/XmluiBuilderFrame";
export { codeViewRenderer } from "./CodeView/CodeView";
export { xmluiPreviewRenderer } from "./AppPreview/AppPreview";
