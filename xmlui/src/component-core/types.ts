import type { XmluiComponentContract } from "../compiler/contracts";
import type { XmluiBuiltInRenderer } from "../runtime/rendering/types";

export type XmluiComponentTransferStatus =
  | "not-started"
  | "partial-centralized"
  | "transferred-folder"
  | "tests-transferred"
  | "tests-ported"
  | "parity-tested"
  | "closed";

export type XmluiComponentSourceFiles = {
  oldFolder: string;
  rewriteFolder: string;
  implementation?: string[];
  renderer?: string[];
  metadata?: string[];
  defaults?: string[];
  styles?: string[];
  docs?: string[];
  tests?: string[];
};

export type XmluiComponentTransferModule = {
  name: string;
  contract: XmluiComponentContract;
  renderer?: XmluiBuiltInRenderer;
  status: XmluiComponentTransferStatus;
  sources: XmluiComponentSourceFiles;
  docs?: {
    path?: string;
    category?: string;
  };
  transferredTests?: {
    runnablePaths: string[];
  };
};

export type XmluiRuntimeComponentModule = XmluiComponentTransferModule & {
  renderer: XmluiBuiltInRenderer;
};
