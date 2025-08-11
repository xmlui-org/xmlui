import { type CSSProperties, type ForwardedRef, forwardRef, type ReactNode, useMemo } from "react";
import classnames from "classnames";

import styles from "./TreeDisplay.module.scss";

type TreeNode = {
  label: string;
  level: number;
  children: TreeNode[];
  isLast?: boolean;
};

type Props = {
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
  content?: string;
  itemHeight?: number;
};

export const defaultProps: Pick<Props, "content" | "itemHeight"> = {
  content: "",
  itemHeight: 20
};

// Parse the indented text into a tree structure
const parseTreeContent = (content: string): TreeNode[] => {
  if (!content) return [];

  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return [];

  const rootNodes: TreeNode[] = [];
  const levelMap: { [level: number]: TreeNode[] } = {};

  lines.forEach((line) => {
    // Count leading spaces to determine level
    const leadingSpaces = line.length - line.trimLeft().length;
    const currentLevel = leadingSpaces;
    const label = line.trim();
    const node: TreeNode = { label, level: currentLevel, children: [] };

    // If we're at level 0, this is a root node
    if (currentLevel === 0) {
      rootNodes.push(node);
      levelMap[0] = rootNodes;
      return;
    }

    // Find the nearest parent level
    let parentLevel = currentLevel - 1;
    while (parentLevel >= 0) {
      if (levelMap[parentLevel] && levelMap[parentLevel].length > 0) {
        // Get the last node at the parent level
        const parent = levelMap[parentLevel][levelMap[parentLevel].length - 1];
        parent.children.push(node);

        // Initialize or update this level's map entry
        if (!levelMap[currentLevel]) {
          levelMap[currentLevel] = [];
        }
        levelMap[currentLevel].push(node);
        return;
      }
      parentLevel--;
    }

    // If we get here, something is wrong with the tree structure
    // Add to root as fallback
    rootNodes.push(node);
  });

  // Mark last children at each level for correct connector rendering
  const markLastChildren = (nodes: TreeNode[]) => {
    if (nodes.length > 0) {
      nodes[nodes.length - 1].isLast = true;
      nodes.forEach((node) => {
        if (node.children.length > 0) {
          markLastChildren(node.children);
        }
      });
    }
  };

  markLastChildren(rootNodes);
  return rootNodes;
};

// Calculate the total height of a node and its descendants
const calculateNodeHeight = (node: TreeNode, itemHeight: number): number => {
  if (node.children.length === 0) {
    return itemHeight; // Single node height
  }
  return (
    itemHeight +
    node.children.reduce((acc, child) => acc + calculateNodeHeight(child, itemHeight), 0)
  );
};

// Render a node and its children with SVG line connectors
const renderTreeNode = (
  node: TreeNode,
  index: number,
  itemHeight: number,
  level = 0,
  ancestorLines: boolean[] = [],
): JSX.Element => {
  const isLast = node.isLast;
  const isRoot = level === 0;
  const hasChildren = node.children.length > 0;
  const nodeHeight = hasChildren ? calculateNodeHeight(node, itemHeight) : itemHeight;
  const halfHeight = itemHeight / 2;
  return (
    <div key={`${node.label}-${index}`} className={styles.treeNode}>
      <div className={styles.treeNodeRow} style={{ height: `${itemHeight}px` }}>
        <div
          className={styles.connectorArea}
          style={{
            marginLeft: `${level * itemHeight}px`,
            width: `${itemHeight}px`,
            height: `${itemHeight}px`,
          }}
        >
          {/* Single SVG for all connector lines at this level */}
          <svg
            className={styles.connector}
            width={itemHeight}
            height={hasChildren ? nodeHeight : itemHeight}
            viewBox={`0 0 ${itemHeight} ${hasChildren ? nodeHeight : itemHeight}`}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            {isRoot && (
              <>
                {/* Horizontal line from the left edge to the text */}
                <line
                  x1={halfHeight}
                  y1={halfHeight}
                  x2={itemHeight}
                  y2={halfHeight}
                  strokeWidth="1.5"
                  className={styles.connectorLine}
                />
              </>
            )}
            {!isRoot && (
              <>
                {/* Vertical line from top */}
                <line
                  x1={halfHeight}
                  y1={0}
                  x2={halfHeight}
                  y2={isLast ? halfHeight : itemHeight}
                  strokeWidth="1.5"
                  className={styles.connectorLine}
                />

                {/* Horizontal line to content */}
                <line
                  x1={halfHeight}
                  y1={halfHeight}
                  x2={itemHeight}
                  y2={halfHeight}
                  strokeWidth="1.5"
                  className={styles.connectorLine}
                />
              </>
            )}

            {/* Vertical line down through children if not last child */}
            {!isLast && hasChildren && (
              <line
                x1={halfHeight}
                y1={halfHeight}
                x2={halfHeight}
                y2={nodeHeight}
                strokeWidth="1.5"
                className={styles.connectorLine}
              />
            )}

            {/* Render ancestor vertical lines */}
            {ancestorLines.map(
              (shouldDraw, i) =>
                shouldDraw && (
                  <line
                    key={`ancestor-${i}`}
                    x1={halfHeight - (level - i) * itemHeight}
                    y1={0}
                    x2={halfHeight - (level - i) * itemHeight}
                    y2={nodeHeight}
                    strokeWidth="1.5"
                    className={styles.connectorLine}
                  />
                ),
            )}
          </svg>
        </div>
        <div className={styles.treeNodeContent} style={{ lineHeight: `${itemHeight}px` }}>
          {node.label}
        </div>
      </div>

      {hasChildren && (
        <div className={styles.childrenContainer}>
          {node.children.map((child, i) => {
            // Create new ancestor lines array for child nodes
            const newAncestorLines = [...ancestorLines];
            while (newAncestorLines.length <= level) {
              newAncestorLines.push(false);
            }
            // Set current level's line status: draw if this child is not the last child
            newAncestorLines[level] = i !== node.children.length - 1;
            return renderTreeNode(child, i, itemHeight, level + 1, newAncestorLines);
          })}
        </div>
      )}
    </div>
  );
};

export const TreeDisplay = forwardRef(function TreeDisplay(
  { style, className, children, content = defaultProps.content, itemHeight = defaultProps.itemHeight }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const contentString = (content || children?.toString() || "").toString();

  const treeNodes = useMemo(() => parseTreeContent(contentString), [contentString]);

  return (
    <div className={classnames(styles.treeDisplay, className)} style={style} ref={forwardedRef}>
      <div className={styles.content}>
        {treeNodes.map((node, index) => renderTreeNode(node, index, itemHeight, 0, []))}
      </div>
    </div>
  );
});
