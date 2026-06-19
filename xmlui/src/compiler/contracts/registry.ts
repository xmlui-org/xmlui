import { builtInComponentContracts } from "./builtins";
import type { XmluiComponentContract, XmluiContractRegistry } from "./types";

export type CreateContractRegistryOptions = {
  userComponents?: Iterable<string>;
  extensionComponents?: Iterable<XmluiComponentContract>;
};

export function createContractRegistry(
  options: CreateContractRegistryOptions = {},
): XmluiContractRegistry {
  const components = new Map<string, XmluiComponentContract>();
  for (const contract of builtInComponentContracts) {
    components.set(contract.name, contract);
  }
  for (const contract of options.extensionComponents ?? []) {
    components.set(contract.name, contract);
  }
  for (const name of options.userComponents ?? []) {
    if (!components.has(name)) {
      components.set(name, createUserComponentContract(name));
    }
  }
  return {
    components,
    get: (name) => components.get(name),
    has: (name) => components.has(name),
    list: () => Array.from(components.values()),
  };
}

export function createUserComponentContract(name: string): XmluiComponentContract {
  return {
    name,
    kind: "user",
    acceptsArbitraryProps: true,
    allowsChildren: true,
    declarations: { local: true },
    props: {},
    events: {},
  };
}

export function isValidUserComponentName(name: string): boolean {
  return /^[A-Z][A-Za-z0-9_]*$/.test(name);
}
