import {
  normalizeSlotKey,
  slotKeyId,
  type StateBag,
  type StateInvalidation,
  type StateOwnerId,
  type StateSlotKey,
  type StateSubscriber,
  type StoreSubscriber,
} from "./types";

export class RuntimeStateStore {
  private globals: StateBag = {};
  private locals = new Map<StateOwnerId, StateBag>();
  private revision = 0;
  private readonly allSubscribers = new Set<StoreSubscriber>();
  private readonly invalidationSubscribers = new Set<StateSubscriber>();
  private readonly slotSubscribers = new Map<string, Set<StateSubscriber>>();

  getRevision(): number {
    return this.revision;
  }

  getSnapshot(): number {
    return this.revision;
  }

  getGlobalSnapshot(): StateBag {
    return { ...this.globals };
  }

  getLocalSnapshot(ownerId: StateOwnerId): StateBag {
    return { ...(this.locals.get(ownerId) ?? {}) };
  }

  createLocalOwner(ownerId: StateOwnerId, initialValues: StateBag = {}): void {
    if (this.locals.has(ownerId)) {
      return;
    }
    this.locals.set(ownerId, { ...initialValues });
  }

  disposeLocalOwner(ownerId: StateOwnerId): void {
    this.locals.delete(ownerId);
  }

  hasLocalOwner(ownerId: StateOwnerId): boolean {
    return this.locals.has(ownerId);
  }

  hasLocal(ownerId: StateOwnerId | undefined, name: string): boolean {
    return Boolean(ownerId && Object.prototype.hasOwnProperty.call(this.locals.get(ownerId), name));
  }

  hasGlobal(name: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.globals, name);
  }

  readLocal(ownerId: StateOwnerId | undefined, name: string): unknown {
    if (!ownerId) {
      return undefined;
    }
    return this.locals.get(ownerId)?.[name];
  }

  readGlobal(name: string): unknown {
    return this.globals[name];
  }

  setInitialLocalValues(ownerId: StateOwnerId, values: StateBag): void {
    this.locals.set(ownerId, { ...values });
  }

  setInitialGlobalValues(values: StateBag): void {
    this.globals = { ...values };
  }

  writeLocal(ownerId: StateOwnerId, name: string, value: unknown): StateInvalidation {
    if (!this.locals.has(ownerId)) {
      this.createLocalOwner(ownerId);
    }
    const locals = this.locals.get(ownerId)!;
    const previousValue = locals[name];
    locals[name] = value;
    return this.emit({ kind: "local", ownerId, name }, previousValue, value);
  }

  writeGlobal(name: string, value: unknown): StateInvalidation {
    const previousValue = this.globals[name];
    this.globals[name] = value;
    return this.emit({ kind: "global", name }, previousValue, value);
  }

  subscribe(listener: StoreSubscriber): () => void {
    this.allSubscribers.add(listener);
    return () => {
      this.allSubscribers.delete(listener);
    };
  }

  subscribeToInvalidations(listener: StateSubscriber): () => void {
    this.invalidationSubscribers.add(listener);
    return () => {
      this.invalidationSubscribers.delete(listener);
    };
  }

  subscribeToSlot(slot: StateSlotKey, listener: StateSubscriber): () => void {
    const id = slotKeyId(slot);
    const subscribers = this.slotSubscribers.get(id) ?? new Set<StateSubscriber>();
    subscribers.add(listener);
    this.slotSubscribers.set(id, subscribers);
    return () => {
      subscribers.delete(listener);
      if (subscribers.size === 0) {
        this.slotSubscribers.delete(id);
      }
    };
  }

  private emit(slot: StateSlotKey, previousValue: unknown, nextValue: unknown): StateInvalidation {
    this.revision += 1;
    const invalidation: StateInvalidation = {
      slot: normalizeSlotKey(slot),
      previousValue,
      nextValue,
      revision: this.revision,
    };

    for (const listener of this.invalidationSubscribers) {
      listener(invalidation);
    }
    for (const listener of this.slotSubscribers.get(slotKeyId(slot)) ?? []) {
      listener(invalidation);
    }
    for (const listener of this.allSubscribers) {
      listener();
    }
    return invalidation;
  }
}

export function createRuntimeStateStore(): RuntimeStateStore {
  return new RuntimeStateStore();
}
