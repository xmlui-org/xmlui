import type { XmluiComponentContract, XmluiContractRegistry } from "./types";

export type XmluiContractMetadata = {
  components: Array<{
    name: string;
    kind: XmluiComponentContract["kind"];
    props: string[];
    events: string[];
    acceptsArbitraryProps: boolean;
  }>;
};

export function contractRegistryToLspMetadata(
  registry: XmluiContractRegistry,
): XmluiContractMetadata {
  return {
    components: registry
      .list()
      .map((contract) => ({
        name: contract.name,
        kind: contract.kind,
        props: Object.keys(contract.props).sort(),
        events: Object.keys(contract.events).sort(),
        acceptsArbitraryProps: contract.acceptsArbitraryProps === true,
      }))
      .sort((left, right) => left.name.localeCompare(right.name)),
  };
}
