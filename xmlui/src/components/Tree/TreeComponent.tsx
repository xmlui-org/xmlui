import {
  type CSSProperties,
  type ReactNode,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { FixedSizeList} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import styles from "./TreeComponent.module.scss";
import classnames from "@components-core/utils/classnames";
import { MemoizedItem } from "@components/container-helpers";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import type { FlatTreeNode, UnPackedTreeData } from "@components-core/abstractions/treeAbstractions";
import { toFlatTree } from "@components-core/utils/treeUtils";

// =====================================================================================================================
// Tree definition

/**
 * Represents a virtualized tree component
 */
interface TreeComponentDef extends ComponentDef<"Tree"> {
  props: {
    /**
     * The data source of the tree
     */
    data: string;

    /**
     * The ID (optional) of the selected tree row
     */
    selectedUid?: string;

    itemTemplate: ComponentDef;
  };
}

/**
 * This function defines the renderer for the Tree component.
 */
export const treeComponentRenderer = createComponentRenderer<TreeComponentDef>(
  "Tree",
  ({ node, extractValue, renderChild }) => {
    return (
      <TreeComponent
        data={extractValue(node.props.data)}
        selectedUid={extractValue(node.props.selectedUid)}
        itemRenderer={(item: any) => {
          return (
            <MemoizedItem
              node={node.props.itemTemplate}
              item={item}
              renderChild={renderChild}
            />
          );
        }}
      />
    );
  }
);

// =====================================================================================================================
// TreeRow React component

/**
 * The properties of the tree row component
 */
type TreeRowProps = {
  index: number;
  style: CSSProperties;
  data: RowContext;
};

/**
 * Describes the data attached to a particular tree row
 */
type RowContext = {
  nodes: FlatTreeNode[];
  toggleNode: (node: FlatTreeNode) => void;
  selectedUid?: string;
  itemRenderer: (item: any) => ReactNode;
};

const TreeRow = memo(function TreeRow({ index, style, data }: TreeRowProps) {
  const { nodes, toggleNode, selectedUid, itemRenderer } = data;
  const treeItem = nodes[index];

  const onToggleNode = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.defaultPrevented) {
        return;
      }
      toggleNode(treeItem);
    },
    [toggleNode, treeItem]
  );

  return (
    <div style={{ ...style, width: 'auto', minWidth: '100%', display: 'flex' }}>
      <div
        className={classnames(styles.rowWrapper, {
          [styles.selected]: selectedUid === treeItem.key,
        })}
      >
        <div onClick={onToggleNode} className={styles.gutter}>
          <div style={{ width: treeItem.depth * 10 }} className={styles.depthPlaceholder} />
          <div
            className={classnames(styles.toggleWrapper, {
              [styles.expanded]: treeItem.isExpanded,
              [styles.hidden]: !treeItem.hasChildren,
            })}
          />
        </div>
        <div
          className={styles.labelWrapper}
          onClick={treeItem.selectable ? undefined : onToggleNode}
          style={{ cursor: treeItem.selectable ? undefined : "pointer" }}
        >
          {itemRenderer(treeItem)}
        </div>
      </div>
    </div>
  );
});

const emptyTreeData: UnPackedTreeData = {
  treeData: [],
  treeItemsById: {}
};

function TreeComponent ({
  data = emptyTreeData,
  selectedUid,
  itemRenderer
}: {
  data: UnPackedTreeData;
  selectedUid?: string;
  itemRenderer: (item: any) => ReactNode;
}) {
  const { treeData, treeItemsById } = data;
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const flatTreeData = useMemo(
    () => toFlatTree(treeData, expandedIds),
    [expandedIds, treeData]
  );

  /**
   * ensure the selected item's parents are expanded on route change
   */
  useEffect(() => {
    if (selectedUid) {
      const treeItem = treeItemsById[selectedUid];
      if (treeItem) {
        setExpandedIds(prev => [...prev, ...treeItem.parentIds]);
      }
    }
  }, [selectedUid, treeItemsById]);

  const toggleNode = useCallback((node: FlatTreeNode) => {
    if (!node.isExpanded) {
      setExpandedIds(prev => [...prev, node.key]);
    } else {
      setExpandedIds(prev => prev.filter(id => id !== node.key));
    }
  }, []);

  const itemData = useMemo(() => {
    return {
      nodes: flatTreeData,
      toggleNode,
      selectedUid,
      itemRenderer
    };
  }, [flatTreeData, toggleNode, selectedUid, itemRenderer]);

  const getItemKey = useCallback((index: number, data: RowContext) => {
    return data.nodes[index].key;
  }, []);

  return (
    <div className={styles.wrapper}>
      <AutoSizer>
        {({ width, height }) => (
          <FixedSizeList
            height={height}
            itemCount={itemData.nodes.length}
            itemData={itemData}
            itemSize={35}
            itemKey={getItemKey}
            width={width}
          >
            {TreeRow}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
}
