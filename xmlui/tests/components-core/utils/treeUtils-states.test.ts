import { describe, expect, it } from "vitest";
import { flattenNode, toFlatTree } from '../../../src/components-core/utils/treeUtils';
import { TreeNode, NodeLoadingState, FlatTreeNodeWithState } from '../../../src/components-core/abstractions/treeAbstractions';

describe('Tree Utils with Loading States - Unit Tests', () => {
  const sampleTreeData: TreeNode[] = [
    {
      id: '1',
      key: '1',
      displayName: 'Node 1',
      parentIds: [],
      path: ['Node 1'],
      selectable: true,
      children: [
        {
          id: '1.1',
          key: '1.1',
          displayName: 'Node 1.1',
          parentIds: ['1'],
          path: ['Node 1', 'Node 1.1'],
          selectable: true,
          children: []
        },
        {
          id: '1.2',
          key: '1.2',
          displayName: 'Node 1.2',
          parentIds: ['1'],
          path: ['Node 1', 'Node 1.2'],
          selectable: true,
          children: []
        }
      ]
    },
    {
      id: '2',
      key: '2',
      displayName: 'Node 2',
      parentIds: [],
      path: ['Node 2'],
      selectable: true,
      children: []
    }
  ];

  it('should include loading states in flattened nodes', () => {
    const nodeStates = new Map<string | number, NodeLoadingState>();
    nodeStates.set('1', 'loading');
    nodeStates.set('1.1', 'loaded');
    nodeStates.set('2', 'unloaded');

    const openedIds = ['1']; // Node 1 is expanded
    const result: FlatTreeNodeWithState[] = [];

    flattenNode(sampleTreeData[0], 0, result, openedIds, undefined, nodeStates);

    expect(result).toHaveLength(3); // Node 1, 1.1, and 1.2
    expect(result[0].loadingState).toBe('loading'); // Node 1
    expect(result[1].loadingState).toBe('loaded');  // Node 1.1
    expect(result[2].loadingState).toBe('unloaded'); // Node 1.2 (default)
  });

  it('should default to unloaded when no state is provided', () => {
    const openedIds = ['1'];
    const result: FlatTreeNodeWithState[] = [];

    flattenNode(sampleTreeData[0], 0, result, openedIds);

    expect(result).toHaveLength(3);
    expect(result[0].loadingState).toBe('unloaded');
    expect(result[1].loadingState).toBe('unloaded');
    expect(result[2].loadingState).toBe('unloaded');
  });

  it('should work with toFlatTree and include loading states', () => {
    const nodeStates = new Map<string | number, NodeLoadingState>();
    nodeStates.set('1', 'loading');
    nodeStates.set('1.1', 'loaded');
    nodeStates.set('2', 'loaded');

    const openedIds = ['1'];
    const result = toFlatTree(sampleTreeData, openedIds, undefined, nodeStates);

    expect(result).toHaveLength(4); // Node 1, 1.1, 1.2, and 2
    expect(result[0].key).toBe('1');
    expect(result[0].loadingState).toBe('loading');
    expect(result[1].key).toBe('1.1');
    expect(result[1].loadingState).toBe('loaded');
    expect(result[2].key).toBe('1.2');
    expect(result[2].loadingState).toBe('unloaded'); // Not in nodeStates map
    expect(result[3].key).toBe('2');
    expect(result[3].loadingState).toBe('loaded');
  });

  it('should preserve all existing node properties along with loading state', () => {
    const nodeStates = new Map<string | number, NodeLoadingState>();
    nodeStates.set('1', 'loading');

    const openedIds = ['1'];
    const result = toFlatTree(sampleTreeData, openedIds, undefined, nodeStates);

    const node1 = result[0];
    expect(node1.id).toBe('1');
    expect(node1.key).toBe('1');
    expect(node1.displayName).toBe('Node 1');
    expect(node1.depth).toBe(0);
    expect(node1.isExpanded).toBe(true);
    expect(node1.loadingState).toBe('loading');
    expect(node1.hasChildren).toBe(true);
  });

  it('should handle all loading state values', () => {
    const nodeStates = new Map<string | number, NodeLoadingState>();
    nodeStates.set('1', 'unloaded');
    nodeStates.set('1.1', 'loading');
    nodeStates.set('1.2', 'loaded');

    const openedIds = ['1'];
    const result = toFlatTree(sampleTreeData, openedIds, undefined, nodeStates);

    expect(result[0].loadingState).toBe('unloaded');
    expect(result[1].loadingState).toBe('loading');
    expect(result[2].loadingState).toBe('loaded');
  });

  it('should work without nodeStates parameter (backward compatibility)', () => {
    const openedIds = ['1'];
    const result = toFlatTree(sampleTreeData, openedIds);

    expect(result).toHaveLength(4);
    result.forEach(node => {
      expect(node.loadingState).toBe('unloaded');
    });
  });
});