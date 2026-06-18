export type StateBag = Record<string, unknown>;

export type StateOwnerId = string;

export type StateSlotKind = "local" | "global";

export type StateSlotKey = {
  kind: StateSlotKind;
  ownerId?: StateOwnerId;
  name: string;
};

export type PropDependencyKey = {
  kind: "prop";
  name: string;
};

export type RuntimeDependencyKey = StateSlotKey | PropDependencyKey;

export type StateWrite = {
  slot: StateSlotKey;
  previousValue: unknown;
  nextValue: unknown;
};

export type StateInvalidation = StateWrite & {
  revision: number;
};

export type StateSubscriber = (invalidation: StateInvalidation) => void;

export type StoreSubscriber = () => void;

export function normalizeSlotKey(slot: StateSlotKey): StateSlotKey {
  return slot.kind === "global"
    ? { kind: "global", name: slot.name }
    : { kind: "local", ownerId: requiredOwnerId(slot), name: slot.name };
}

export function slotKeyId(slot: StateSlotKey): string {
  const normalized = normalizeSlotKey(slot);
  return normalized.kind === "global"
    ? `global:${normalized.name}`
    : `local:${normalized.ownerId}:${normalized.name}`;
}

export function sameSlotKey(left: StateSlotKey, right: StateSlotKey): boolean {
  return slotKeyId(left) === slotKeyId(right);
}

function requiredOwnerId(slot: StateSlotKey): StateOwnerId {
  if (!slot.ownerId) {
    throw new Error(`Local XMLUI state slot "${slot.name}" requires an owner ID.`);
  }
  return slot.ownerId;
}
