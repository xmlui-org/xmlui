import { aiConversationComponentRenderer } from "./AiConversation/AiConversation";

const aiBlocksExtension = {
  namespace: "XMLUIExtensions",
  themeNamespacePrefix: "AiBlocks",
  components: [aiConversationComponentRenderer],
};

export default aiBlocksExtension;
