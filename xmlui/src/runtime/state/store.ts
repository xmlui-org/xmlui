import {
  dependencyKeyId,
  normalizeSlotKey,
  slotKeyId,
  type ReactiveVariableNode,
  type RuntimeDependencyKey,
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
  private readonly reactiveVariables = new Map<string, ReactiveVariableNode>();
  private readonly reactiveDependents = new Map<string, Set<string>>();

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
    for (const [key, node] of this.reactiveVariables) {
      if (node.slot.kind === "local" && node.slot.ownerId === ownerId) {
        this.unregisterReactiveVariable(node.slot);
      }
    }
  }

  hasLocalOwner(ownerId: StateOwnerId): boolean {
    return this.locals.has(ownerId);
  }

  hasLocal(ownerId: StateOwnerId | undefined, name: string): boolean {
    const localValues = ownerId ? this.locals.get(ownerId) : undefined;
    return Boolean(localValues && Object.prototype.hasOwnProperty.call(localValues, name));
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

  setInitialLocalValue(ownerId: StateOwnerId, name: string, value: unknown): void {
    const locals = this.locals.get(ownerId) ?? {};
    locals[name] = value;
    this.locals.set(ownerId, locals);
  }

  setInitialGlobalValues(values: StateBag): void {
    this.globals = { ...values };
  }

  setInitialGlobalValue(name: string, value: unknown): void {
    this.globals[name] = value;
  }

  registerReactiveVariable(node: ReactiveVariableNode): void {
    const normalizedNode: ReactiveVariableNode = {
      ...node,
      slot: normalizeSlotKey(node.slot),
      dependencies: node.dependencies.map((dependency) =>
        dependency.kind === "global" || dependency.kind === "local"
          ? normalizeSlotKey(dependency)
          : dependency,
      ),
    };
    const key = slotKeyId(normalizedNode.slot);
    this.unregisterReactiveVariable(normalizedNode.slot);
    this.reactiveVariables.set(key, normalizedNode);
    for (const dependency of normalizedNode.dependencies) {
      const dependencyKey = dependencyKeyId(dependency);
      const dependents = this.reactiveDependents.get(dependencyKey) ?? new Set<string>();
      dependents.add(key);
      this.reactiveDependents.set(dependencyKey, dependents);
    }
  }

  unregisterReactiveVariable(slot: StateSlotKey): void {
    const key = slotKeyId(slot);
    const existing = this.reactiveVariables.get(key);
    if (!existing) {
      return;
    }
    this.reactiveVariables.delete(key);
    for (const dependency of existing.dependencies) {
      const dependencyKey = dependencyKeyId(dependency);
      const dependents = this.reactiveDependents.get(dependencyKey);
      dependents?.delete(key);
      if (dependents?.size === 0) {
        this.reactiveDependents.delete(dependencyKey);
      }
    }
  }

  getReactiveVariable(slot: StateSlotKey): ReactiveVariableNode | undefined {
    const node = this.reactiveVariables.get(slotKeyId(slot));
    return node
      ? {
          ...node,
          dependencies: [...node.dependencies],
        }
      : undefined;
  }

  updateReactiveEvaluator(slot: StateSlotKey, evaluate: () => unknown): void {
    const key = slotKeyId(slot);
    const node = this.reactiveVariables.get(key);
    if (!node) {
      return;
    }
    this.reactiveVariables.set(key, {
      ...node,
      evaluate,
    });
  }

  getReactiveDependents(dependency: RuntimeDependencyKey): ReactiveVariableNode[] {
    return [...(this.reactiveDependents.get(dependencyKeyId(dependency)) ?? [])]
      .map((key) => this.reactiveVariables.get(key))
      .filter((node): node is ReactiveVariableNode => Boolean(node))
      .map((node) => ({
        ...node,
        dependencies: [...node.dependencies],
      }));
  }

  writeLocal(ownerId: StateOwnerId, name: string, value: unknown): StateInvalidation {
    const slot = { kind: "local", ownerId, name } as const;
    this.markExplicitAssignment(slot);
    const invalidation = this.writeLocalInternal(ownerId, name, value);
    this.recomputeReactiveDependents(slot);
    return invalidation;
  }

  private writeLocalInternal(ownerId: StateOwnerId, name: string, value: unknown): StateInvalidation {
    if (!this.locals.has(ownerId)) {
      this.createLocalOwner(ownerId);
    }
    const locals = this.locals.get(ownerId)!;
    const previousValue = locals[name];
    locals[name] = value;
    return this.emit({ kind: "local", ownerId, name }, previousValue, value);
  }

  writeGlobal(name: string, value: unknown): StateInvalidation {
    const slot = { kind: "global", name } as const;
    this.markExplicitAssignment(slot);
    const invalidation = this.writeGlobalInternal(name, value);
    this.recomputeReactiveDependents(slot);
    return invalidation;
  }

  invalidateLocal(ownerId: StateOwnerId, name: string): StateInvalidation {
    const value = this.readLocal(ownerId, name);
    const invalidation = this.emit({ kind: "local", ownerId, name }, value, value);
    this.recomputeReactiveDependents({ kind: "local", ownerId, name });
    return invalidation;
  }

  invalidateGlobal(name: string): StateInvalidation {
    const value = this.readGlobal(name);
    const invalidation = this.emit({ kind: "global", name }, value, value);
    this.recomputeReactiveDependents({ kind: "global", name });
    return invalidation;
  }

  invalidateProp(ownerId: StateOwnerId | undefined, name: string): void {
    this.recomputeReactiveDependents({ kind: "prop", ownerId, name });
  }

  invalidateReference(name: string): void {
    this.recomputeReactiveDependents({ kind: "reference", name });
    this.revision += 1;
    for (const listener of this.allSubscribers) {
      listener();
    }
  }

  invalidateRoute(): void {
    this.revision += 1;
    for (const listener of this.allSubscribers) {
      listener();
    }
  }

  private writeGlobalInternal(name: string, value: unknown): StateInvalidation {
    const previousValue = this.globals[name];
    this.globals[name] = value;
    return this.emit({ kind: "global", name }, previousValue, value);
  }

  private markExplicitAssignment(slot: StateSlotKey): void {
    const key = slotKeyId(slot);
    const node = this.reactiveVariables.get(key);
    if (!node || node.mode !== "derived") {
      return;
    }
    this.reactiveVariables.set(key, {
      ...node,
      mode: "assigned",
    });
  }

  private recomputeReactiveDependents(changedDependency: RuntimeDependencyKey, visited = new Set<string>()): void {
    const changedKey = dependencyKeyId(changedDependency);
    if (visited.has(changedKey)) {
      return;
    }
    visited.add(changedKey);

    for (const dependent of this.getReactiveDependents(changedDependency)) {
      const node = this.reactiveVariables.get(slotKeyId(dependent.slot));
      if (!node || node.mode !== "derived" || !node.evaluate) {
        continue;
      }
      const nextValue = node.evaluate();
      if (node.slot.kind === "global") {
        this.writeGlobalInternal(node.slot.name, nextValue);
      } else {
        this.writeLocalInternal(node.slot.ownerId!, node.slot.name, nextValue);
      }
      this.recomputeReactiveDependents(node.slot, visited);
    }
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
