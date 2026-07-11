declare module "@xyflow/react" {
  import type { ComponentType } from "react";

  export type Node = any;
  export type Edge = any;
  export type Connection = any;
  export type NodeTypes = Record<string, ComponentType<any>>;
  export type EdgeTypes = Record<string, ComponentType<any>>;
  export type NodeProps = any;
  export type EdgeProps = any;

  export const ReactFlow: ComponentType<any>;
  export const Background: ComponentType<any>;
  export const Controls: ComponentType<any>;
  export const MiniMap: ComponentType<any>;
  export const BaseEdge: ComponentType<any>;
  export const NodeResizer: ComponentType<any>;
  export const Handle: ComponentType<any>;
  export const EdgeLabelRenderer: ComponentType<any>;
  export const Position: any;
  export const MarkerType: any;

  export function useNodesState(initialNodes: any[]): [any[], (value: any) => void, (...args: any[]) => void];
  export function useEdgesState(initialEdges: any[]): [any[], (value: any) => void, (...args: any[]) => void];
  export function addEdge(connection: any, edges: any[]): any[];
  export function getBezierPath(options: any): [string, number, number, number, number];
}
