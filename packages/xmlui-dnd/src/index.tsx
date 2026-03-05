import { dragDropProviderComponentRenderer } from "./DragDropProvider";
import { draggableComponentRenderer } from "./Draggable";
import { droppableComponentRenderer } from "./Droppable";
import { droppedItemsComponentRenderer } from "./DroppedItems";
import { gradientSegmentedControlComponentRenderer } from "./GradientSegmentedControl";
import { checkboxCardComponentRenderer } from "./CheckboxCard";
import { imageCheckboxCardComponentRenderer } from "./ImageCheckboxCard";

export default {
  namespace: "XMLUIExtensions",
  components: [
    dragDropProviderComponentRenderer,
    draggableComponentRenderer,
    droppableComponentRenderer,
    droppedItemsComponentRenderer,
    gradientSegmentedControlComponentRenderer,
    checkboxCardComponentRenderer,
    imageCheckboxCardComponentRenderer,
  ],
};
