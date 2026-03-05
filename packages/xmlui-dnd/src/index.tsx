import { dragDropProviderComponentRenderer } from "./DragDropProvider";
import { draggableComponentRenderer } from "./Draggable";
import { droppableComponentRenderer } from "./Droppable";
import { droppedItemsComponentRenderer } from "./DroppedItems";
import { gradientSegmentedControlComponentRenderer } from "./GradientSegmentedControl";

export default {
  namespace: "XMLUIExtensions",
  components: [
    dragDropProviderComponentRenderer,
    draggableComponentRenderer,
    droppableComponentRenderer,
    droppedItemsComponentRenderer,
    gradientSegmentedControlComponentRenderer,
  ],
};
