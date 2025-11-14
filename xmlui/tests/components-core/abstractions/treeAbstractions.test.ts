import { describe, expect, it } from "vitest";
import type { NodeLoadingState, FlatTreeNodeWithState, FlatTreeNode } from '../../../src/components-core/abstractions/treeAbstractions';

describe('Tree Abstractions - Loading States', () => {
  it('NodeLoadingState type should have correct values', () => {
    const unloaded: NodeLoadingState = 'unloaded';
    const loading: NodeLoadingState = 'loading';
    const loaded: NodeLoadingState = 'loaded';
    
    expect(unloaded).toBe('unloaded');
    expect(loading).toBe('loading');
    expect(loaded).toBe('loaded');
  });

  it('FlatTreeNodeWithState should extend FlatTreeNode', () => {
    const mockFlatTreeNode: FlatTreeNode = {
      id: 1,
      key: 1,
      path: [],
      displayName: 'Test Node',
      parentIds: [],
      selectable: true,
      isExpanded: false,
      depth: 0,
      hasChildren: false,
    };

    const nodeWithState: FlatTreeNodeWithState = {
      ...mockFlatTreeNode,
      loadingState: 'unloaded',
    };

    expect(nodeWithState.loadingState).toBe('unloaded');
    expect(nodeWithState.id).toBe(1);
    expect(nodeWithState.hasChildren).toBe(false);
  });

  it('FlatTreeNodeWithState should support all loading states', () => {
    const baseNode: FlatTreeNode = {
      id: 1,
      key: 1,
      path: [],
      displayName: 'Test Node',
      parentIds: [],
      selectable: true,
      isExpanded: false,
      depth: 0,
      hasChildren: true,
    };

    const unloadedNode: FlatTreeNodeWithState = { ...baseNode, loadingState: 'unloaded' };
    const loadingNode: FlatTreeNodeWithState = { ...baseNode, loadingState: 'loading' };
    const loadedNode: FlatTreeNodeWithState = { ...baseNode, loadingState: 'loaded' };

    expect(unloadedNode.loadingState).toBe('unloaded');
    expect(loadingNode.loadingState).toBe('loading');
    expect(loadedNode.loadingState).toBe('loaded');
  });
});