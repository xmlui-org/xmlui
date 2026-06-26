import { xmluiBuilderFrameComponentRenderer } from "./XmluiBuilderFrame/XmluiBuilderFrame";
import { aiMessagePartsComponentRenderer } from "./AiMessageParts/AiMessageParts";
import { aiToolCallComponentRenderer } from "./AiToolCall/AiToolCall";
import { aiApprovalRequestComponentRenderer } from "./AiApprovalRequest/AiApprovalRequest";

const aiBlocksExtension = {
  namespace: "XMLUIExtensions",
  themeNamespacePrefix: "AiBlocks",
  components: [
    aiMessagePartsComponentRenderer,
    aiToolCallComponentRenderer,
    aiApprovalRequestComponentRenderer,
    xmluiBuilderFrameComponentRenderer,
  ],
};

export default aiBlocksExtension;

export { aiMessagePartsComponentRenderer } from "./AiMessageParts/AiMessageParts";
export { aiToolCallComponentRenderer } from "./AiToolCall/AiToolCall";
export { aiApprovalRequestComponentRenderer } from "./AiApprovalRequest/AiApprovalRequest";
export { xmluiBuilderFrameComponentRenderer } from "./XmluiBuilderFrame/XmluiBuilderFrame";
