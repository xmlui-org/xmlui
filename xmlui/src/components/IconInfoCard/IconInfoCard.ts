import { createMetadata, d } from "@abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";
import { compoundComponentDefFromSource } from "@components-core/utils/compound-utils";

// --- We cannot use this with nextra
// import componentSource from "./IconInfoCard.xmlui?raw";

const COMP = "IconInfoCard";

export const IconInfoCardMd = createMetadata({
  status: "experimental",
  description: "This component displays an icon and some content in a card.",
  props: {
    height: d("The height of the card."),
    iconBackgroundColor: d("The background color of the icon."),
    iconName: d("The name of the icon to display."),
  },
});

const componentSource = `
<Component name="IconInfoCard">
  <Card height="{$props.height}" width="{$props.width}">
    <HStack verticalAlignment="center">
      <CHStack 
        backgroundColor="{$props.iconBackgroundColor}"
        width="$space-10"
        height="$space-10"
        radius="$radius">
        <Icon name="{$props.iconName}" size="$space-6" />
      </CHStack>
      <VStack gap="0">
        <Slot />
      </VStack>
    </HStack>
  </Card>
</Component>
`;

export const iconInfoCardRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: compoundComponentDefFromSource(COMP, componentSource),
  metadata: IconInfoCardMd,
};
