import type { BlockScope } from "./BlockScope";
import type { LoopScope } from "./LoopScope";
import type { TryScope } from "./TryScope";

// Represents a logical thread instance
export type LogicalThread = {
  // --- Parent thread
  parent?: LogicalThread;

  // --- Child threads forked directly from this thread
  childThreads: LogicalThread[];

  // --- Available closures
  closures?: BlockScope[];

  // --- Scopes for block-level variables
  blocks?: BlockScope[];

  // --- Scopes for loops in progress
  loops?: LoopScope[];

  // --- Scopes for try blocks in progress
  tryBlocks?: TryScope[];

  // --- The value of the break label to use for the forthcoming loop
  breakLabelValue?: number;

  // --- Optional return value of the thread
  returnValue?: any;
};
