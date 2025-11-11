import { describe, expect, it } from "vitest";
import type { NodeLoadingState } from '../../../src/components-core/abstractions/treeAbstractions';

// Helper functions to test (these would normally be extracted from TreeNative for testing)
type NodeStatesMap = Map<string, NodeLoadingState>;

function createNodeStateHelpers() {
  let nodeStates: NodeStatesMap = new Map();

  const setNodeLoadingState = (nodeId: string, state: NodeLoadingState) => {
    nodeStates.set(nodeId, state);
  };

  const getNodeLoadingState = (nodeId: string): NodeLoadingState => {
    return nodeStates.get(nodeId) || 'unloaded';
  };

  const clearNodeLoadingState = (nodeId: string) => {
    nodeStates.delete(nodeId);
  };

  const getAllNodeStates = (): NodeStatesMap => {
    return new Map(nodeStates);
  };

  const clearAllNodeStates = () => {
    nodeStates.clear();
  };

  return {
    setNodeLoadingState,
    getNodeLoadingState,
    clearNodeLoadingState,
    getAllNodeStates,
    clearAllNodeStates
  };
}

describe('Tree Node States Management - Unit Tests', () => {
  it('should set and get node loading state', () => {
    const helpers = createNodeStateHelpers();
    
    helpers.setNodeLoadingState('node1', 'loading');
    expect(helpers.getNodeLoadingState('node1')).toBe('loading');
    
    helpers.setNodeLoadingState('node1', 'loaded');
    expect(helpers.getNodeLoadingState('node1')).toBe('loaded');
  });

  it('should return unloaded for unknown nodes', () => {
    const helpers = createNodeStateHelpers();
    
    expect(helpers.getNodeLoadingState('unknown')).toBe('unloaded');
  });

  it('should clear node loading state', () => {
    const helpers = createNodeStateHelpers();
    
    helpers.setNodeLoadingState('node1', 'loaded');
    expect(helpers.getNodeLoadingState('node1')).toBe('loaded');
    
    helpers.clearNodeLoadingState('node1');
    expect(helpers.getNodeLoadingState('node1')).toBe('unloaded');
  });

  it('should handle multiple node states', () => {
    const helpers = createNodeStateHelpers();
    
    helpers.setNodeLoadingState('node1', 'loading');
    helpers.setNodeLoadingState('node2', 'loaded');
    helpers.setNodeLoadingState('node3', 'unloaded');
    
    expect(helpers.getNodeLoadingState('node1')).toBe('loading');
    expect(helpers.getNodeLoadingState('node2')).toBe('loaded');
    expect(helpers.getNodeLoadingState('node3')).toBe('unloaded');
    
    const allStates = helpers.getAllNodeStates();
    expect(allStates.size).toBe(3);
    expect(allStates.get('node1')).toBe('loading');
    expect(allStates.get('node2')).toBe('loaded');
    expect(allStates.get('node3')).toBe('unloaded');
  });

  it('should clear all node states', () => {
    const helpers = createNodeStateHelpers();
    
    helpers.setNodeLoadingState('node1', 'loading');
    helpers.setNodeLoadingState('node2', 'loaded');
    
    expect(helpers.getAllNodeStates().size).toBe(2);
    
    helpers.clearAllNodeStates();
    
    expect(helpers.getAllNodeStates().size).toBe(0);
    expect(helpers.getNodeLoadingState('node1')).toBe('unloaded');
    expect(helpers.getNodeLoadingState('node2')).toBe('unloaded');
  });

  it('should validate NodeLoadingState enum values', () => {
    const helpers = createNodeStateHelpers();
    
    // Test all valid enum values
    const validStates: NodeLoadingState[] = ['unloaded', 'loading', 'loaded'];
    
    validStates.forEach(state => {
      helpers.setNodeLoadingState('test', state);
      expect(helpers.getNodeLoadingState('test')).toBe(state);
    });
  });
});